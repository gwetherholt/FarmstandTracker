import { useState, useCallback, useEffect } from 'react'
import type { Order } from '../types'
import { useOrdersBySunday, useGenerateRecurring } from '../hooks/useOrders'
import { useIsClosed, toggleClosed } from '../hooks/useClosedSundays'
import { useIsSoldOut, toggleSoldOut } from '../hooks/useSoldOut'
import { useProducts } from '../hooks/useProducts'
import {
  generateBatchLabels,
  renderBatchLabelsCanvas,
  downloadBlob,
} from '../utils/labelGenerator'
import {
  isWebBluetoothAvailable,
  connect as connectPrinter,
  disconnect as disconnectPrinter,
  isConnected as isPrinterConnected,
  printImage,
  setDisconnectListener,
} from '../utils/phomemoPrinter'
import { toDateString } from '../utils/dates'
import PrepSummary from './PrepSummary'
import OrderCard from './OrderCard'
import OrderForm from './OrderForm'
import { NotesDisplay, AddNotes } from './SundayNotes'
import WeeklyChecklist from './WeeklyChecklist'

interface Props {
  sundayDate: string
}

/** Get the next Sunday after the given date string */
function getNextSundayFrom(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + 7)
  return toDateString(d)
}

export default function SundayBoard({ sundayDate }: Props) {
  const orders = useOrdersBySunday(sundayDate)
  const products = useProducts()
  const isClosed = useIsClosed(sundayDate)
  const isSoldOut = useIsSoldOut(sundayDate)
  const [formOpen, setFormOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const bluetoothAvailable = isWebBluetoothAvailable()
  const [printerConnected, setPrinterConnected] = useState(() => isPrinterConnected())
  const [printerBusy, setPrinterBusy] = useState(false)

  // Generate recurring orders from previous Sunday on load
  useGenerateRecurring(sundayDate)

  // Reflect printer drop-outs (e.g. powered off, out of range) in the UI.
  useEffect(() => {
    if (!bluetoothAvailable) return
    setDisconnectListener(() => setPrinterConnected(false))
    return () => setDisconnectListener(null)
  }, [bluetoothAvailable])

  const handleEdit = useCallback((order: Order) => {
    if (isClosed) return
    setEditingOrder(order)
    setFormOpen(true)
  }, [isClosed])

  const handleCloseForm = useCallback(() => {
    setFormOpen(false)
    setEditingOrder(null)
  }, [])

  const handleOpenForm = useCallback(() => {
    setEditingOrder(null)
    setFormOpen(true)
  }, [])

  // Orders with at least one item, alphabetical by customer name.
  const labelOrders = orders
    .filter((o) => Object.values(o.items).some((qty) => qty > 0))
    .sort((a, b) => a.customerName.localeCompare(b.customerName))

  const handleDownloadLabels = useCallback(async () => {
    if (labelOrders.length === 0) return
    const blob = await generateBatchLabels(labelOrders, products)
    downloadBlob(blob, `labels-${sundayDate}.png`)
  }, [labelOrders, products, sundayDate])

  const handleConnectPrinter = useCallback(async () => {
    setPrinterBusy(true)
    try {
      const connected = await connectPrinter()
      // connected === false means the user dismissed the picker — stay silent.
      if (connected) setPrinterConnected(true)
    } catch {
      setPrinterConnected(false)
      window.alert('Printer disconnected — try reconnecting')
    } finally {
      setPrinterBusy(false)
    }
  }, [])

  const handleDisconnectPrinter = useCallback(() => {
    disconnectPrinter()
    setPrinterConnected(false)
  }, [])

  const handlePrintBluetooth = useCallback(async () => {
    if (labelOrders.length === 0) return
    setPrinterBusy(true)
    try {
      const canvas = renderBatchLabelsCanvas(labelOrders, products)
      await printImage(canvas)
    } catch {
      setPrinterConnected(false)
      window.alert('Printer disconnected — try reconnecting')
    } finally {
      setPrinterBusy(false)
    }
  }, [labelOrders, products])

  const nextSunday = getNextSundayFrom(sundayDate)

  return (
    <div className="space-y-4">
      {/* Closed banner */}
      {isClosed && (
        <div className="bg-wood/5 border border-wood/15 rounded-xl p-4 text-center">
          <div className="text-2xl mb-1">{'\u{1F6AB}'}</div>
          <div className="font-hand text-2xl font-bold text-wood/50 uppercase">Closed</div>
          <p className="text-sm text-wood/40 mt-1">No orders this week</p>
        </div>
      )}

      {/* Sold out banner */}
      {!isClosed && isSoldOut && (
        <div className="bg-barn/5 border border-barn/20 rounded-xl p-4 text-center">
          <div className="text-2xl mb-1">{'\u{1F6A8}'}</div>
          <div className="font-hand text-2xl font-bold text-barn uppercase">Sold Out</div>
          <p className="text-sm text-wood/40 mt-1">All inventory claimed</p>
        </div>
      )}

      {/* Week controls */}
      <div className="flex justify-between items-center gap-2">
        <div className="flex gap-2">
          {!isClosed && labelOrders.length > 0 && (
            <>
              {/* Direct Bluetooth printing — only when Web Bluetooth exists */}
              {bluetoothAvailable &&
                (printerConnected ? (
                  <>
                    <button
                      onClick={handlePrintBluetooth}
                      disabled={printerBusy}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-olive text-cream hover:bg-olive-dark transition-colors touch-manipulation disabled:opacity-50"
                    >
                      {'\u{1F5A8}️'} {printerBusy ? 'Printing…' : 'Print Labels'}
                    </button>
                    <button
                      onClick={handleDisconnectPrinter}
                      disabled={printerBusy}
                      className="text-xs font-medium px-2 py-1.5 rounded-lg bg-wood/5 text-wood/50 hover:text-wood hover:bg-wood/10 transition-colors touch-manipulation disabled:opacity-50"
                      title="Disconnect printer"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleConnectPrinter}
                    disabled={printerBusy}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-olive/10 text-olive-dark hover:bg-olive/20 transition-colors touch-manipulation disabled:opacity-50"
                  >
                    {'\u{1F5A8}️'} {printerBusy ? 'Connecting…' : 'Connect Printer'}
                  </button>
                ))}

              {/* Always-available PNG download (the only option without BLE) */}
              <button
                onClick={handleDownloadLabels}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-olive/10 text-olive-dark hover:bg-olive/20 transition-colors touch-manipulation"
              >
                {'\u{1F3F7}️'} {bluetoothAvailable ? 'Download' : 'Print Labels'}
              </button>
            </>
          )}
        </div>
        <div className="flex gap-2">
        {!isClosed && (
          <button
            onClick={() => toggleSoldOut(sundayDate, isSoldOut)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors touch-manipulation ${
              isSoldOut
                ? 'bg-barn/10 text-barn hover:bg-barn/20'
                : 'bg-wood/5 text-wood/50 hover:text-wood hover:bg-wood/10'
            }`}
          >
            {isSoldOut ? 'Undo sold out' : 'Mark sold out'}
          </button>
        )}
        <button
          onClick={() => toggleClosed(sundayDate, isClosed)}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors touch-manipulation ${
            isClosed
              ? 'bg-olive/10 text-olive hover:bg-olive/20'
              : 'bg-wood/5 text-wood/50 hover:text-wood hover:bg-wood/10'
          }`}
        >
          {isClosed ? 'Reopen this week' : 'Mark as closed'}
        </button>
        </div>
      </div>

      {!isClosed && (
        <>
          <PrepSummary orders={orders} />

          {/* Notes for THIS Sunday displayed at top */}
          <NotesDisplay sundayDate={sundayDate} />

          {/* Weekly checklist */}
          <WeeklyChecklist sundayDate={sundayDate} />

          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} onEdit={handleEdit} />
            ))}
          </div>

          {orders.length === 0 && (
            <div className="text-center py-8">
              <div className="flex justify-center mb-2">
                <svg width="48" height="60" viewBox="0 0 32 40">
                  <ellipse cx="16" cy="22" rx="12" ry="16" fill="#F0EDE6" stroke="#E0D8CA" strokeWidth="0.5" />
                  <ellipse cx="12" cy="16" rx="4" ry="5" fill="white" opacity="0.3" />
                </svg>
              </div>
              <p className="text-wood/50 italic font-hand text-xl">No preorders yet</p>
              <p className="text-sm text-wood/35 mt-1">Tap + to add one</p>
            </div>
          )}

          {/* Add notes targeting NEXT Sunday */}
          <AddNotes targetSundayDate={nextSunday} />

          {/* FAB */}
          <button
            onClick={handleOpenForm}
            className="fixed bottom-6 right-6 w-14 h-14 bg-olive text-cream rounded-full shadow-lg text-3xl font-bold flex items-center justify-center active:bg-olive-dark z-40 touch-manipulation select-none"
            aria-label="Add order"
          >
            +
          </button>

          {formOpen && (
            <OrderForm
              key={editingOrder?.id ?? 'new'}
              sundayDate={sundayDate}
              editingOrder={editingOrder}
              onClose={handleCloseForm}
            />
          )}
        </>
      )}
    </div>
  )
}
