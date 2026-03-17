import { useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import type { NotificationSettings } from '../types'
import { checkScheduledNotifications } from '../utils/notifications'

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

export function useNotificationSettings(): NotificationSettings {
  return useLiveQuery(
    () => db.notificationSettings.get('settings'),
    [],
    DEFAULT_SETTINGS
  ) ?? DEFAULT_SETTINGS
}

/** Runs the notification scheduler while the app is open (checks every 60s) */
export function useNotificationScheduler() {
  useEffect(() => {
    // Check immediately on mount
    checkScheduledNotifications()

    const interval = setInterval(checkScheduledNotifications, 60_000)
    return () => clearInterval(interval)
  }, [])
}
