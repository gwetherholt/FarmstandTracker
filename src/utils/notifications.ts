import { db } from '../db'
import type { NotificationSettings } from '../types'
import { getNextSunday, toDateString } from './dates'
import { calculatePrepSummary } from './pricing'

const DEFAULT_SETTINGS: NotificationSettings = {
  key: 'settings',
  enabled: false,
  sundayHour: 7,
  sundayMinute: 0,
  saturdayHour: 18,
  saturdayMinute: 0,
  lastSundayFired: null,
  lastSaturdayFired: null,
}

export async function getSettings(): Promise<NotificationSettings> {
  const row = await db.notificationSettings.get('settings')
  return row ?? DEFAULT_SETTINGS
}

export async function saveSettings(updates: Partial<NotificationSettings>): Promise<void> {
  const current = await getSettings()
  await db.notificationSettings.put({ ...current, ...updates, key: 'settings' })
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  return Notification.requestPermission()
}

export function getPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

async function showNotification(title: string, body: string): Promise<void> {
  // Prefer SW notification (richer on Android), fall back to Notification API
  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.ready
    await reg.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: title, // prevents duplicate notifications
    })
  } else if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/icons/icon-192.png' })
  }
}

export async function sendTestNotification(): Promise<void> {
  const perm = await requestPermission()
  if (perm !== 'granted') return

  const thisSunday = toDateString(getNextSunday())
  const orders = await db.orders.where('sundayDate').equals(thisSunday).toArray()
  const summary = calculatePrepSummary(orders)

  const body = orders.length > 0
    ? `${summary.orderCount} order${summary.orderCount !== 1 ? 's' : ''}: ${summary.chickenHalfDoz} chicken, ${summary.duckHalfDoz} duck, ${summary.gooseHalfDoz} goose half-doz — $${summary.revenue} total`
    : 'No orders yet for this Sunday.'

  await showNotification('\u{1F95A} Test Reminder', body)
}

/**
 * Check if any scheduled notifications should fire right now.
 * Called on an interval from the app.
 */
export async function checkScheduledNotifications(): Promise<void> {
  const settings = await getSettings()
  if (!settings.enabled) return
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const now = new Date()
  const dayOfWeek = now.getDay() // 0=Sunday, 6=Saturday
  const hour = now.getHours()
  const minute = now.getMinutes()
  const todayStr = toDateString(now)

  // Sunday morning reminder
  if (dayOfWeek === 0 && hour === settings.sundayHour && minute >= settings.sundayMinute && minute < settings.sundayMinute + 2) {
    if (settings.lastSundayFired !== todayStr) {
      const thisSunday = toDateString(getNextSunday(now))
      const closed = await db.closedSundays.get(thisSunday)
      if (!closed) {
        const orders = await db.orders.where('sundayDate').equals(thisSunday).toArray()
        const summary = calculatePrepSummary(orders)
        const parts: string[] = []
        if (summary.chickenHalfDoz > 0) parts.push(`${summary.chickenEggs} chicken eggs`)
        if (summary.duckHalfDoz > 0) parts.push(`${summary.duckEggs} duck eggs`)
        if (summary.gooseHalfDoz > 0) parts.push(`${summary.gooseEggs} goose eggs`)
        const body = orders.length > 0
          ? `You have ${summary.orderCount} order${summary.orderCount !== 1 ? 's' : ''} today. Prep: ${parts.join(', ')} — $${summary.revenue}`
          : 'No orders for today.'
        await showNotification('\u{1F95A} Put the eggs out!', body)
      }
      await saveSettings({ lastSundayFired: todayStr })
    }
  }

  // Saturday evening reminder
  if (dayOfWeek === 6 && hour === settings.saturdayHour && minute >= settings.saturdayMinute && minute < settings.saturdayMinute + 2) {
    if (settings.lastSaturdayFired !== todayStr) {
      // Tomorrow is Sunday — figure out which date that is
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowSunday = toDateString(tomorrow)
      const closed = await db.closedSundays.get(tomorrowSunday)
      if (!closed) {
        const orders = await db.orders.where('sundayDate').equals(tomorrowSunday).toArray()
        const summary = calculatePrepSummary(orders)
        const parts: string[] = []
        if (summary.chickenHalfDoz > 0) parts.push(`${summary.chickenHalfDoz} chicken`)
        if (summary.duckHalfDoz > 0) parts.push(`${summary.duckHalfDoz} duck`)
        if (summary.gooseHalfDoz > 0) parts.push(`${summary.gooseHalfDoz} goose`)
        const body = orders.length > 0
          ? `Tomorrow's prep: ${parts.join(', ')} half-doz — ${summary.orderCount} total order${summary.orderCount !== 1 ? 's' : ''}`
          : 'No orders yet for tomorrow.'
        await showNotification('\u{1F414} Tomorrow\'s prep', body)
      }
      await saveSettings({ lastSaturdayFired: todayStr })
    }
  }
}
