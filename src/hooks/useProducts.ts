import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { db } from '../db'
import type { Product } from '../types'

export const DEFAULT_PRODUCTS: Omit<Product, 'id' | 'createdAt'>[] = [
  { key: 'chicken', name: 'Rainbow Chicken Eggs', emoji: '\u{1F414}', price: 2, unit: 'half-doz', active: true, sortOrder: 0 },
  { key: 'duck', name: 'Duck Eggs', emoji: '\u{1F986}', price: 3, unit: 'half-doz', active: true, sortOrder: 1 },
  { key: 'goose', name: 'Fertile Goose Eggs', emoji: '\u{1FABF}', price: 6, unit: 'half-doz', active: true, sortOrder: 2 },
  { key: 'quail', name: 'Quail Eggs', emoji: '\u{1F95A}', price: 4, unit: 'half-doz', active: true, sortOrder: 3 },
]

/** Seed default products on fresh installs (v8 .upgrade() only runs for existing dbs). */
export async function ensureSeeded(): Promise<void> {
  const count = await db.products.count()
  if (count > 0) return
  const now = new Date().toISOString()
  await db.products.bulkAdd(DEFAULT_PRODUCTS.map((p) => ({ ...p, createdAt: now })))
}

export function useProducts(): Product[] {
  return useLiveQuery(
    () => db.products.orderBy('sortOrder').toArray(),
    [],
    [] as Product[]
  )
}

export function useActiveProducts(): Product[] {
  const products = useProducts()
  return useMemo(() => products.filter((p) => p.active), [products])
}

export function useProductMap(): Map<string, Product> {
  const products = useProducts()
  return useMemo(() => {
    const map = new Map<string, Product>()
    for (const p of products) map.set(p.key, p)
    return map
  }, [products])
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function uniqueKey(base: string): Promise<string> {
  let candidate = base || 'product'
  let n = 2
  while (await db.products.where('key').equals(candidate).first()) {
    candidate = `${base}-${n}`
    n++
  }
  return candidate
}

export async function addProduct(input: {
  name: string
  emoji: string
  price: number
  unit: string
}): Promise<number> {
  const key = await uniqueKey(slugify(input.name))
  const maxSort = await db.products.orderBy('sortOrder').last()
  const sortOrder = (maxSort?.sortOrder ?? -1) + 1
  return db.products.add({
    key,
    name: input.name.trim(),
    emoji: input.emoji,
    price: input.price,
    unit: input.unit,
    active: true,
    sortOrder,
    createdAt: new Date().toISOString(),
  })
}

export async function updateProduct(
  id: number,
  changes: Partial<Pick<Product, 'name' | 'emoji' | 'price' | 'unit' | 'sortOrder'>>
): Promise<void> {
  await db.products.update(id, changes)
}

/** Soft-delete: preserves order history that references this product's key. */
export async function deactivateProduct(id: number): Promise<void> {
  await db.products.update(id, { active: false })
}

export async function reactivateProduct(id: number): Promise<void> {
  await db.products.update(id, { active: true })
}
