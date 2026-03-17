import { useState, useCallback } from 'react'
import { useNotificationSettings } from '../hooks/useNotifications'
import {
  saveSettings,
  requestPermission,
  getPermissionStatus,
  sendTestNotification,
} from '../utils/notifications'

interface Props {
  onBack: () => void
}

function TimeInput({
  label,
  hour,
  minute,
  onChange,
}: {
  label: string
  hour: number
  minute: number
  onChange: (h: number, m: number) => void
}) {
  const value = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-wood-dark">{label}</span>
      <input
        type="time"
        value={value}
        onChange={(e) => {
          const [h, m] = e.target.value.split(':').map(Number)
          onChange(h, m)
        }}
        className="px-2 py-1.5 rounded-lg border border-wood/20 bg-white text-wood-dark text-sm focus:outline-none focus:ring-2 focus:ring-olive/40"
      />
    </div>
  )
}

export default function Settings({ onBack }: Props) {
  const settings = useNotificationSettings()
  const [permStatus, setPermStatus] = useState<string>(getPermissionStatus())
  const [testSent, setTestSent] = useState(false)

  const handleToggleEnabled = useCallback(async () => {
    if (!settings.enabled) {
      // Enabling — request permission first
      const perm = await requestPermission()
      setPermStatus(perm)
      if (perm === 'granted') {
        await saveSettings({ enabled: true })
      }
    } else {
      await saveSettings({ enabled: false })
    }
  }, [settings.enabled])

  const handleTest = useCallback(async () => {
    await sendTestNotification()
    setTestSent(true)
    setTimeout(() => setTestSent(false), 3000)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-olive-dark font-bold text-lg"
        >
          &larr;
        </button>
        <h2 className="font-serif text-2xl text-wood-dark font-bold">Settings</h2>
      </div>

      {/* Notifications section */}
      <div className="bg-white rounded-xl border border-wood/10 overflow-hidden">
        <div className="p-4 space-y-4">
          <h3 className="font-serif text-lg text-wood-dark font-semibold">
            {'\u{1F514}'} Notifications
          </h3>

          {permStatus === 'unsupported' && (
            <div className="bg-amber/10 border border-amber/20 rounded-lg p-3 text-sm text-wood-dark">
              Your browser doesn't support notifications.
            </div>
          )}

          {permStatus === 'denied' && (
            <div className="bg-barn/5 border border-barn/20 rounded-lg p-3 text-sm text-wood-dark">
              Notifications are blocked. Please enable them in your browser/device settings for this site, then refresh.
            </div>
          )}

          {permStatus !== 'unsupported' && (
            <>
              {/* Explanation */}
              {!settings.enabled && permStatus !== 'denied' && (
                <p className="text-sm text-wood/70">
                  Get a reminder Saturday evening to prep eggs, and Sunday morning before stand opens. Notifications only fire when the app is open on your phone.
                </p>
              )}

              {/* Enable toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-wood-dark">
                  Enable reminders
                </span>
                <button
                  onClick={handleToggleEnabled}
                  className={`relative w-12 h-7 rounded-full transition-colors touch-manipulation ${
                    settings.enabled ? 'bg-olive' : 'bg-wood/20'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                      settings.enabled ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {settings.enabled && (
                <>
                  {/* Sunday morning time */}
                  <div className="bg-parchment/60 rounded-lg p-3 space-y-3">
                    <div className="text-xs font-semibold text-wood-dark uppercase tracking-wide">
                      {'\u{1F95A}'} Sunday Morning
                    </div>
                    <TimeInput
                      label="Reminder time"
                      hour={settings.sundayHour}
                      minute={settings.sundayMinute}
                      onChange={(h, m) => saveSettings({ sundayHour: h, sundayMinute: m })}
                    />
                    <p className="text-xs text-wood/50">
                      "Put the eggs out!" with your order count and prep summary
                    </p>
                  </div>

                  {/* Saturday evening time */}
                  <div className="bg-parchment/60 rounded-lg p-3 space-y-3">
                    <div className="text-xs font-semibold text-wood-dark uppercase tracking-wide">
                      {'\u{1F414}'} Saturday Evening
                    </div>
                    <TimeInput
                      label="Reminder time"
                      hour={settings.saturdayHour}
                      minute={settings.saturdayMinute}
                      onChange={(h, m) => saveSettings({ saturdayHour: h, saturdayMinute: m })}
                    />
                    <p className="text-xs text-wood/50">
                      Tomorrow's prep totals so you can get eggs ready
                    </p>
                  </div>

                  {/* Test button */}
                  <button
                    onClick={handleTest}
                    className="w-full py-2.5 rounded-lg text-sm font-medium bg-olive/10 text-olive-dark hover:bg-olive/20 transition-colors touch-manipulation"
                  >
                    {testSent ? '\u2705 Sent! Check your notifications' : '\u{1F514} Send test notification'}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-wood/40 text-center px-4">
        Reminders fire when the app is open at the scheduled time.
        For best results, keep the app in a browser tab or installed as a PWA.
      </div>
    </div>
  )
}
