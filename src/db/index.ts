import Dexie, { type Table } from 'dexie'
import type { Order, Customer, SundayNote, ClosedSunday, SoldOutSunday, ChecklistItem, NotificationSettings, Product } from '../types'

class FarmStandDB extends Dexie {
  orders!: Table<Order, number>
  customers!: Table<Customer, number>
  notes!: Table<SundayNote, number>
  closedSundays!: Table<ClosedSunday, string>
  soldOutSundays!: Table<SoldOutSunday, string>
  checklist!: Table<ChecklistItem, number>
  notificationSettings!: Table<NotificationSettings, string>
  products!: Table<Product, number>

  constructor() {
    super('farmstand')
    this.version(1).stores({
      orders: '++id, sundayDate, customerName, createdAt',
      customers: '++id, &name, lastOrderDate',
    })
    this.version(2).stores({
      orders: '++id, sundayDate, customerName, createdAt',
      customers: '++id, &name, lastOrderDate',
      notes: '++id, sundayDate, createdAt',
    })
    // v3: adds recurring, sourceOrderId fields to orders (no index changes needed)
    this.version(3).stores({
      orders: '++id, sundayDate, customerName, createdAt',
      customers: '++id, &name, lastOrderDate',
      notes: '++id, sundayDate, createdAt',
    }).upgrade((tx) => {
      return tx.table('orders').toCollection().modify((order) => {
        if (order.recurring === undefined) order.recurring = false
        if (order.sourceOrderId === undefined) order.sourceOrderId = null
      })
    })
    // v4: closed Sundays table
    this.version(4).stores({
      orders: '++id, sundayDate, customerName, createdAt',
      customers: '++id, &name, lastOrderDate',
      notes: '++id, sundayDate, createdAt',
      closedSundays: 'sundayDate',
    })
    // v5: contactSource field on orders and customers (no index changes)
    this.version(5).stores({
      orders: '++id, sundayDate, customerName, createdAt',
      customers: '++id, &name, lastOrderDate',
      notes: '++id, sundayDate, createdAt',
      closedSundays: 'sundayDate',
    })
    // v6: checklist and sold-out tables
    this.version(6).stores({
      orders: '++id, sundayDate, customerName, createdAt',
      customers: '++id, &name, lastOrderDate',
      notes: '++id, sundayDate, createdAt',
      closedSundays: 'sundayDate',
      soldOutSundays: 'sundayDate',
      checklist: '++id, sundayDate',
    })
    // v7: notification settings
    this.version(7).stores({
      orders: '++id, sundayDate, customerName, createdAt',
      customers: '++id, &name, lastOrderDate',
      notes: '++id, sundayDate, createdAt',
      closedSundays: 'sundayDate',
      soldOutSundays: 'sundayDate',
      checklist: '++id, sundayDate',
      notificationSettings: 'key',
    })
    // v8: product catalog
    this.version(8).stores({
      orders: '++id, sundayDate, customerName, createdAt',
      customers: '++id, &name, lastOrderDate',
      notes: '++id, sundayDate, createdAt',
      closedSundays: 'sundayDate',
      soldOutSundays: 'sundayDate',
      checklist: '++id, sundayDate',
      notificationSettings: 'key',
      products: '++id, &key, sortOrder, active',
    }).upgrade(async (tx) => {
      const now = new Date().toISOString()
      await tx.table('products').bulkAdd([
        { key: 'chicken', name: 'Rainbow Chicken Eggs', emoji: '\u{1F414}', price: 2, unit: 'half-doz', active: true, sortOrder: 0, createdAt: now },
        { key: 'duck', name: 'Duck Eggs', emoji: '\u{1F986}', price: 3, unit: 'half-doz', active: true, sortOrder: 1, createdAt: now },
        { key: 'goose', name: 'Fertile Goose Eggs', emoji: '\u{1FABF}', price: 6, unit: 'half-doz', active: true, sortOrder: 2, createdAt: now },
        { key: 'quail', name: 'Quail Eggs', emoji: '\u{1F95A}', price: 4, unit: 'half-doz', active: true, sortOrder: 3, createdAt: now },
      ])
    })
  }
}

export const db = new FarmStandDB()
