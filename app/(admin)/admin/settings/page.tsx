'use client'

import { useState, useEffect } from 'react'
import Button from '@/app/components/ui/Button'
import Card from '@/app/components/ui/Card'
import Toast from '@/app/components/ui/Toast'

export default function AdminSettingsPage() {
  const [maintenance, setMaintenance] = useState(false)
  const [markup, setMarkup] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        setMaintenance(data.maintenance_mode || false)
        setMarkup(String(data.global_markup || '0'))
      })
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maintenance_mode: maintenance, global_markup: Number(markup) }),
      })
      if (!res.ok) throw new Error('Save failed')
      setToast({ message: 'Settings saved', type: 'success' })
    } catch {
      setToast({ message: 'Failed to save settings', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <h2 className="text-sm font-semibold text-gray-700">Settings</h2>

      <Card>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">Maintenance Mode</p>
              <p className="text-xs text-gray-500">Disable all purchases for maintenance</p>
            </div>
            <button
              onClick={() => setMaintenance(!maintenance)}
              className={`w-12 h-6 rounded-full transition-colors ${maintenance ? 'bg-[#059669]' : 'bg-gray-200'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${maintenance ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Global Markup (%)
            </label>
            <input
              type="number"
              value={markup}
              onChange={(e) => setMarkup(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
              placeholder="0"
              min="0"
              max="100"
            />
            <p className="text-xs text-gray-400 mt-1">Applied as percentage on all purchases</p>
          </div>

          <Button size="lg" onClick={handleSave} loading={loading}>
            Save Settings
          </Button>
        </div>
      </Card>
    </div>
  )
}
