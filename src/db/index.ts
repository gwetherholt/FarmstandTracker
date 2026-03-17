import Dexie, { type Table } from 'dexie'
import type { Order, Customer, SundayNote, ClosedSunday } from '../types'

class FarmStandDB extends Dexie {
  orders!: Table<Order, number>
  customers!: Table<Customer, number>
  notes!: Table<SundayNote, number>
  closedSundays!: Table<ClosedSunday, string>

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
  }
}

export const db = new FarmStandDB()
