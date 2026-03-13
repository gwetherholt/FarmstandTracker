import Dexie, { type Table } from 'dexie'
import type { Order, Customer } from '../types'

class FarmStandDB extends Dexie {
  orders!: Table<Order, number>
  customers!: Table<Customer, number>

  constructor() {
    super('farmstand')
    this.version(1).stores({
      orders: '++id, sundayDate, customerName, createdAt',
      customers: '++id, &name, lastOrderDate',
    })
  }
}

export const db = new FarmStandDB()
