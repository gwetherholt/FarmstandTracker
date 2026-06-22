/**
 * Direct Bluetooth printing to a Phomemo T02 thermal printer via Web Bluetooth.
 *
 * Works on Chrome for Android over HTTPS (Vercel serves the PWA over HTTPS),
 * so labels can be printed straight from the app — no Phomemo phone app needed.
 *
 * The T02 speaks an ESC/POS-style raster protocol over a BLE GATT service:
 *   - service:           0xff00
 *   - write char:        0xff02  (we send raster commands here)
 *   - notify char:       0xff03  (printer status; not required to print)
 *
 * The print head is 384 dots wide (53mm @ 203 DPI), so label canvases are
 * authored at exactly 384px and need no centering or cropping.
 */

const SERVICE_UUID = 0xff00
const WRITE_CHAR_UUID = 0xff02
export const NOTIFY_CHAR_UUID = 0xff03

const PRINTER_WIDTH = 384 // dots; must match the label canvas width
const BYTES_PER_ROW = PRINTER_WIDTH / 8 // 48

// Max raster rows per GS v 0 command — large images are split into bands so we
// never overflow the printer's buffer.
const BAND_HEIGHT = 255
// BLE write chunk size. Smaller chunks (128) slow transmission, which gives the
// print head time to apply heat more consistently.
const CHUNK_SIZE = 128

// Module-level singletons so a reconnect within the same session can skip the
// device picker.
let device: BluetoothDevice | null = null
let writeChar: BluetoothRemoteGATTCharacteristic | null = null
let onDisconnectCallback: (() => void) | null = null

/** True when the Web Bluetooth API is present (Chrome/Android over HTTPS). */
export function isWebBluetoothAvailable(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.bluetooth
}

/** Register a callback fired when the printer drops its connection. */
export function setDisconnectListener(cb: (() => void) | null): void {
  onDisconnectCallback = cb
}

function handleDisconnected(): void {
  writeChar = null
  onDisconnectCallback?.()
}

/**
 * Show the BLE device picker (or reuse the previously chosen device) and
 * connect to the printer's write characteristic.
 *
 * @returns true once connected, false if the user cancelled the picker.
 * @throws on any genuine connection failure.
 */
export async function connect(): Promise<boolean> {
  if (!isWebBluetoothAvailable()) {
    throw new Error('Web Bluetooth is not available in this browser')
  }

  try {
    if (!device) {
      device = await navigator.bluetooth!.requestDevice({
        filters: [{ namePrefix: 'T' }],
        optionalServices: [SERVICE_UUID],
      })
      device.addEventListener('gattserverdisconnected', handleDisconnected)
    }

    if (!device.gatt) throw new Error('Selected device has no GATT server')

    const server = await device.gatt.connect()
    const service = await server.getPrimaryService(SERVICE_UUID)
    writeChar = await service.getCharacteristic(WRITE_CHAR_UUID)
    return true
  } catch (err) {
    // The user dismissing the chooser surfaces as a NotFoundError — treat as a
    // silent cancel rather than an error.
    if (err instanceof DOMException && err.name === 'NotFoundError') {
      return false
    }
    throw err
  }
}

/** Drop the GATT connection (the device reference is kept for quick reconnect). */
export function disconnect(): void {
  if (device?.gatt?.connected) {
    device.gatt.disconnect()
  }
  writeChar = null
}

/** True when a printer is connected and ready to receive data. */
export function isConnected(): boolean {
  return !!device?.gatt?.connected && writeChar !== null
}

/**
 * Convert a canvas to a 1-bit monochrome ESC/POS raster command stream.
 * A pixel is printed black when its luminance is below the mid threshold;
 * fully-transparent pixels are treated as white (paper).
 */
function canvasToRaster(canvas: HTMLCanvasElement): Uint8Array<ArrayBuffer> {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context is unavailable')

  const width = canvas.width
  const height = canvas.height
  const { data } = ctx.getImageData(0, 0, width, height)

  // Pack pixels into rows of BYTES_PER_ROW, MSB-first, black bit = 1.
  const bitmap = new Uint8Array(BYTES_PER_ROW * height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width && x < PRINTER_WIDTH; x++) {
      const i = (y * width + x) * 4
      const alpha = data[i + 3]
      const lum =
        alpha === 0
          ? 255
          : 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      if (lum < 200) {
        bitmap[y * BYTES_PER_ROW + (x >> 3)] |= 0x80 >> (x & 7)
      }
    }
  }

  // Build the command stream: init, then one GS v 0 raster command per band,
  // then a paper feed at the end.
  const bands = Math.ceil(height / BAND_HEIGHT)
  const HEADER = 10 // ESC @ (2) + ESC 7 heat (5) + GS | density (3)
  const FEED = 3 // ESC d n
  const total =
    HEADER + bands * 8 + bitmap.length + FEED
  const out = new Uint8Array(total)
  let o = 0

  // ESC @  — initialize printer
  out[o++] = 0x1b
  out[o++] = 0x40

  // ESC 7 n1 n2 n3  — set heat: max dots, heat time, heat interval. A longer
  // heat time (0x80) burns each dot darker.
  out[o++] = 0x1b
  out[o++] = 0x37
  out[o++] = 0x07
  out[o++] = 0x80
  out[o++] = 0x02

  // GS | n  — set print density to max (0x08) for the darkest output.
  out[o++] = 0x1d
  out[o++] = 0x7c
  out[o++] = 0x08

  for (let yStart = 0; yStart < height; yStart += BAND_HEIGHT) {
    const bandHeight = Math.min(BAND_HEIGHT, height - yStart)
    // GS v 0 m xL xH yL yH  — print raster bit image
    out[o++] = 0x1d
    out[o++] = 0x76
    out[o++] = 0x30
    out[o++] = 0x00
    out[o++] = BYTES_PER_ROW & 0xff
    out[o++] = (BYTES_PER_ROW >> 8) & 0xff
    out[o++] = bandHeight & 0xff
    out[o++] = (bandHeight >> 8) & 0xff

    const start = yStart * BYTES_PER_ROW
    const end = start + bandHeight * BYTES_PER_ROW
    out.set(bitmap.subarray(start, end), o)
    o += end - start
  }

  // ESC d 4  — feed 4 lines so the label clears the tear bar
  out[o++] = 0x1b
  out[o++] = 0x64
  out[o++] = 0x04

  return out
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Print a label canvas. The canvas should be 384px wide to match the print
 * head; wider content is cropped, narrower content is left-padded with paper.
 *
 * @throws if the printer is not connected or a write fails (e.g. it dropped).
 */
export async function printImage(canvas: HTMLCanvasElement): Promise<void> {
  if (!writeChar) throw new Error('Printer not connected')

  const payload = canvasToRaster(canvas)
  for (let i = 0; i < payload.length; i += CHUNK_SIZE) {
    const chunk = payload.subarray(i, i + CHUNK_SIZE)
    if (writeChar.writeValueWithoutResponse) {
      await writeChar.writeValueWithoutResponse(chunk)
    } else {
      await writeChar.writeValue(chunk)
    }
    // Small pause so the printer's buffer keeps up with the BLE stream.
    await delay(20)
  }
}
