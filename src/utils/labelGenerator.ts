import type { Order, Product } from '../types'
import { formatPickupDate } from './dates'

/**
 * Generates label PNGs sized for a Phomemo T02 thermal printer.
 *
 * The T02 prints on a 53mm-wide continuous roll, which is 384px at 203 DPI.
 * The app does NOT print directly — it produces PNGs that the user opens in
 * the Phomemo phone app to print, then tears apart at the dashed cut lines.
 */

const LABEL_WIDTH = 384 // 53mm @ 203 DPI — the T02's native print width
const PADDING = 16
const CONTENT_WIDTH = LABEL_WIDTH - PADDING * 2
const ITEM_INDENT = PADDING + 4 // small left margin for item lines

// Vertical metrics (px)
const NAME_BLOCK = 48
const DIVIDER_GAP_TOP = 6
const DIVIDER_GAP_BOTTOM = 14
const ITEM_LINE = 34
const NOTES_GAP_TOP = 8
const NOTES_LINE = 18
const TOTAL_GAP_TOP = 12
const TOTAL_GAP_BOTTOM = 10
const TOTAL_BLOCK = 32
const DATE_GAP_TOP = 14
const DATE_BLOCK = 32

// Spacing above/below the dashed cut line between stacked labels
const CUT_GAP = 12

// Colors
const COLOR_NAME = '#3D3929' // wood-dark
const COLOR_ITEM = '#3D3929'
const COLOR_TOTAL = '#3D3929'
const COLOR_DIVIDER = '#CCCCCC'
const COLOR_NOTES = '#78716C' // wood
const COLOR_DATE = '#999999' // lighter gray
const COLOR_CUT = '#BBBBBB'

interface LabelContent {
  name: string
  items: string[]
  totalLabel: string
  notesLines: string[]
  dateLabel: string
}

/**
 * Number of cartons in an order. Each half-dozen is one carton, so the carton
 * count is the sum of all positive item quantities.
 */
function cartonCount(order: Order): number {
  let n = 0
  for (const qty of Object.values(order.items)) {
    if (qty > 0) n += qty
  }
  return n
}

/** Build the lookup map once per generation call. */
function toProductMap(products: Product[]): Map<string, Product> {
  const map = new Map<string, Product>()
  for (const p of products) map.set(p.key, p)
  return map
}

/** Wrap text to fit within maxWidth using the ctx's current font. */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (current && ctx.measureText(test).width > maxWidth) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

/**
 * Resolve an order into its renderable lines. Items keyed by product key are
 * looked up in the catalog; quantities of 0 (or missing products) are skipped.
 * Formatted as "{emoji} {quantity} {unit} {product name}".
 */
function buildContent(
  order: Order,
  productMap: Map<string, Product>,
  measureCtx: CanvasRenderingContext2D
): LabelContent {
  const items: string[] = []
  let total = 0
  for (const [key, qty] of Object.entries(order.items)) {
    if (!qty || qty <= 0) continue
    const product = productMap.get(key)
    if (!product) continue
    items.push(`${product.emoji} ${qty} ${product.unit} ${product.name}`)
    total += product.price * qty
  }

  let notesLines: string[] = []
  const notes = order.notes?.trim()
  if (notes) {
    measureCtx.font = 'italic 12px Inter, system-ui, sans-serif'
    notesLines = wrapText(measureCtx, notes, CONTENT_WIDTH)
  }

  return {
    name: order.customerName,
    items,
    totalLabel: `Total: $${total.toFixed(2)}`,
    notesLines,
    dateLabel: formatPickupDate(order.sundayDate),
  }
}

/** Total height a single label occupies given its content. */
function contentHeight(content: LabelContent): number {
  let h = PADDING
  h += NAME_BLOCK
  h += DIVIDER_GAP_TOP + 1 + DIVIDER_GAP_BOTTOM
  h += content.items.length * ITEM_LINE
  // Total line, preceded by a thin divider
  h += TOTAL_GAP_TOP + 1 + TOTAL_GAP_BOTTOM + TOTAL_BLOCK
  if (content.notesLines.length > 0) {
    h += NOTES_GAP_TOP + content.notesLines.length * NOTES_LINE
  }
  h += DATE_GAP_TOP + DATE_BLOCK
  h += PADDING
  return h
}

/**
 * Draw a single label at vertical offset `top`. Returns the height drawn so
 * the batch generator can advance its cursor.
 */
function drawLabel(ctx: CanvasRenderingContext2D, top: number, content: LabelContent): number {
  const height = contentHeight(content)

  // White background for this label's region
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, top, LABEL_WIDTH, height)

  let y = top + PADDING

  // Customer name — bold, large, centered
  ctx.fillStyle = COLOR_NAME
  ctx.font = 'bold 32px "Playfair Display", Georgia, serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(content.name, LABEL_WIDTH / 2, y + 34)
  y += NAME_BLOCK

  // Thin gray divider
  y += DIVIDER_GAP_TOP
  ctx.strokeStyle = COLOR_DIVIDER
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PADDING, y + 0.5)
  ctx.lineTo(LABEL_WIDTH - PADDING, y + 0.5)
  ctx.stroke()
  y += 1 + DIVIDER_GAP_BOTTOM

  // Order items — left-aligned with a small left margin
  ctx.textAlign = 'left'
  ctx.fillStyle = COLOR_ITEM
  ctx.font = '24px Inter, system-ui, sans-serif'
  for (const item of content.items) {
    ctx.fillText(item, ITEM_INDENT, y + 24)
    y += ITEM_LINE
  }

  // Order total — thin divider above, then bold centered total
  y += TOTAL_GAP_TOP
  ctx.strokeStyle = COLOR_DIVIDER
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PADDING, y + 0.5)
  ctx.lineTo(LABEL_WIDTH - PADDING, y + 0.5)
  ctx.stroke()
  y += 1 + TOTAL_GAP_BOTTOM
  ctx.textAlign = 'center'
  ctx.fillStyle = COLOR_TOTAL
  ctx.font = 'bold 24px Inter, system-ui, sans-serif'
  ctx.fillText(content.totalLabel, LABEL_WIDTH / 2, y + 24)
  y += TOTAL_BLOCK

  // Notes — italic, smaller
  if (content.notesLines.length > 0) {
    y += NOTES_GAP_TOP
    ctx.textAlign = 'left'
    ctx.fillStyle = COLOR_NOTES
    ctx.font = 'italic 12px Inter, system-ui, sans-serif'
    for (const line of content.notesLines) {
      ctx.fillText(line, ITEM_INDENT, y + 12)
      y += NOTES_LINE
    }
  }

  // Pickup date — centered, lighter gray, at the bottom
  y += DATE_GAP_TOP
  ctx.textAlign = 'center'
  ctx.fillStyle = COLOR_DATE
  ctx.font = '24px Inter, system-ui, sans-serif'
  ctx.fillText(content.dateLabel, LABEL_WIDTH / 2, y + 24)

  return height
}

function createCanvas(width: number, height: number): {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
} {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context is unavailable')
  return { canvas, ctx }
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Failed to generate label image'))
    }, 'image/png')
  })
}

/**
 * Render an order's labels to 384px-wide canvases (the T02 print-head width, so
 * they can be printed directly with no centering or cropping). One identical
 * canvas is returned per carton — i.e. one per half-dozen ordered — each showing
 * the full order info.
 */
export function renderSingleLabelCanvas(order: Order, products: Product[]): HTMLCanvasElement[] {
  const productMap = toProductMap(products)
  const measure = createCanvas(LABEL_WIDTH, 1)
  const content = buildContent(order, productMap, measure.ctx)
  const height = contentHeight(content)

  const canvases: HTMLCanvasElement[] = []
  for (let i = 0; i < cartonCount(order); i++) {
    const { canvas, ctx } = createCanvas(LABEL_WIDTH, height)
    drawLabel(ctx, 0, content)
    canvases.push(canvas)
  }
  return canvases
}

/**
 * Render every order's label stacked vertically onto one tall 384px-wide
 * canvas, separated by gray dashed cut lines.
 */
export function renderBatchLabelsCanvas(orders: Order[], products: Product[]): HTMLCanvasElement {
  const productMap = toProductMap(products)
  const measure = createCanvas(LABEL_WIDTH, 1)
  // One label per carton: each order's content is repeated once per half-dozen.
  const contents: LabelContent[] = []
  for (const order of orders) {
    const content = buildContent(order, productMap, measure.ctx)
    for (let i = 0; i < cartonCount(order); i++) contents.push(content)
  }
  const heights = contents.map(contentHeight)

  const cutBlock = CUT_GAP * 2 + 1 // gap + dashed line + gap
  const cutCount = Math.max(contents.length - 1, 0)
  const totalHeight = heights.reduce((sum, h) => sum + h, 0) + cutCount * cutBlock

  const { canvas, ctx } = createCanvas(LABEL_WIDTH, Math.max(totalHeight, 1))

  // White background for the whole sheet
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, LABEL_WIDTH, totalHeight)

  let y = 0
  contents.forEach((content, i) => {
    y += drawLabel(ctx, y, content)
    if (i < contents.length - 1) {
      // Dashed cut line between labels
      y += CUT_GAP
      ctx.strokeStyle = COLOR_CUT
      ctx.lineWidth = 1
      ctx.setLineDash([6, 6])
      ctx.beginPath()
      ctx.moveTo(PADDING, y + 0.5)
      ctx.lineTo(LABEL_WIDTH - PADDING, y + 0.5)
      ctx.stroke()
      ctx.setLineDash([])
      y += 1 + CUT_GAP
    }
  })

  return canvas
}

/**
 * Generate an order's labels as PNG blobs (for download) — one identical blob
 * per carton (half-dozen).
 */
export async function generateSingleLabel(order: Order, products: Product[]): Promise<Blob[]> {
  return Promise.all(renderSingleLabelCanvas(order, products).map(canvasToBlob))
}

/**
 * Generate one tall PNG with every order's label stacked vertically, separated
 * by a gray dashed cut line. The user prints the single image and tears the
 * labels apart at the cut lines.
 */
export async function generateBatchLabels(orders: Order[], products: Product[]): Promise<Blob> {
  return canvasToBlob(renderBatchLabelsCanvas(orders, products))
}

/** Make a customer name safe for use in a download filename. */
export function slugifyName(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'order'
  )
}

/** Trigger a browser download for a blob via a temporary anchor element. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
