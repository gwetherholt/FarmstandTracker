import { useRef, useState } from 'react'
import { db } from '../db'

// Every Dexie table, in a stable order. Keep in sync with src/db/index.ts.
const TABLES = [
  'orders',
  'customers',
  'notes',
  'closedSundays',
  'soldOutSundays',
  'checklist',
  'notificationSettings',
  'products',
] as const

type TableName = (typeof TABLES)[number]

interface BackupFile {
  version: number
  exportedAt: string
  orders: unknown[]
  customers: unknown[]
  notes: unknown[]
  closedSundays: unknown[]
  soldOutSundays: unknown[]
  checklist: unknown[]
  notificationSettings: unknown[]
  products: unknown[]
}

type Status =
  | { kind: 'idle' }
  | { kind: 'success'; text: string }
  | { kind: 'error'; text: string }

function todayStamp(): string {
  // YYYY-MM-DD in local time
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function BackupManager() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [busy, setBusy] = useState(false)

  const handleExport = async () => {
    setBusy(true)
    setStatus({ kind: 'idle' })
    try {
      const [
        orders,
        customers,
        notes,
        closedSundays,
        soldOutSundays,
        checklist,
        notificationSettings,
        products,
      ] = await Promise.all(TABLES.map((t) => db.table(t).toArray()))

      const backup: BackupFile = {
        version: 1,
        exportedAt: new Date().toISOString(),
        orders,
        customers,
        notes,
        closedSundays,
        soldOutSundays,
        checklist,
        notificationSettings,
        products,
      }

      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `farmstand-backup-${todayStamp()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setStatus({
        kind: 'success',
        text: `Exported ${orders.length} orders, ${customers.length} customers, ${products.length} products`,
      })
    } catch (err) {
      setStatus({
        kind: 'error',
        text: `Export failed: ${err instanceof Error ? err.message : String(err)}`,
      })
    } finally {
      setBusy(false)
    }
  }

  const handleImportClick = () => {
    setStatus({ kind: 'idle' })
    fileInputRef.current?.click()
  }

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Reset the input so selecting the same file again still fires onChange.
    e.target.value = ''
    if (!file) return

    setBusy(true)
    setStatus({ kind: 'idle' })
    try {
      const text = await file.text()
      let parsed: unknown
      try {
        parsed = JSON.parse(text)
      } catch {
        throw new Error("That file isn't valid JSON.")
      }

      const data = parsed as Partial<BackupFile>
      if (
        typeof data !== 'object' ||
        data === null ||
        typeof data.version !== 'number' ||
        !Array.isArray(data.products) ||
        !Array.isArray(data.orders)
      ) {
        throw new Error("This doesn't look like a FarmStand backup file.")
      }

      const proceed = window.confirm(
        'This will add the backup into your current data. Continue?'
      )
      if (!proceed) {
        setBusy(false)
        return
      }

      const tableObjs = TABLES.map((t) => db.table(t))
      await db.transaction('rw', tableObjs, async () => {
        for (const t of TABLES) {
          const rows = data[t as TableName]
          if (Array.isArray(rows) && rows.length > 0) {
            await db.table(t).bulkPut(rows)
          }
        }
      })

      const orderCount = data.orders.length
      const customerCount = Array.isArray(data.customers) ? data.customers.length : 0
      const productCount = data.products.length
      setStatus({
        kind: 'success',
        text: `Imported ${orderCount} orders, ${customerCount} customers, ${productCount} products`,
      })
    } catch (err) {
      setStatus({
        kind: 'error',
        text: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-wood/10 overflow-hidden">
      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-serif text-lg text-wood-dark font-semibold">
            {'\u{1F4BE}'} Backup
          </h3>
          <p className="text-sm text-wood/70 mt-1">
            Save all your orders, customers, and products to a file, or restore
            from a backup. Importing merges into your current data.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={handleExport}
            disabled={busy}
            className="w-full py-3.5 rounded-xl text-base font-semibold bg-olive text-cream hover:bg-olive-dark disabled:opacity-40 transition-colors touch-manipulation"
          >
            {'⬇️'} Export backup
          </button>
          <button
            onClick={handleImportClick}
            disabled={busy}
            className="w-full py-3.5 rounded-xl text-base font-semibold bg-parchment text-wood-dark border border-wood/20 hover:bg-parchment/70 disabled:opacity-40 transition-colors touch-manipulation"
          >
            {'⬆️'} Import backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileSelected}
            className="hidden"
          />
        </div>

        {status.kind === 'success' && (
          <div className="bg-olive/10 border border-olive/20 rounded-lg p-3 text-sm text-olive-dark font-medium">
            {'✅'} {status.text}
          </div>
        )}
        {status.kind === 'error' && (
          <div className="bg-barn/5 border border-barn/20 rounded-lg p-3 text-sm text-barn font-medium">
            {'⚠️'} {status.text}
          </div>
        )}
      </div>
    </div>
  )
}
