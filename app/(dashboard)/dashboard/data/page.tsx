'use client'

import { useState, useEffect } from 'react'
import { Wifi } from 'lucide-react'
import PageHeader from '@/app/components/ui/PageHeader'
import Button from '@/app/components/ui/Button'
import Input from '@/app/components/ui/Input'
import Toast from '@/app/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { Service } from '@/types'

const networks = [
  { id: 'mtn', label: 'MTN', color: 'bg-yellow-400', textColor: 'text-yellow-900' },
  { id: 'airtel', label: 'Airtel', color: 'bg-red-500', textColor: 'text-white' },
  { id: 'glo', label: 'Glo', color: 'bg-green-500', textColor: 'text-white' },
  { id: '9mobile', label: '9mobile', color: 'bg-emerald-800', textColor: 'text-white' },
]

export default function DataPage() {
  const [network, setNetwork] = useState('')
  const [phone, setPhone] = useState('')
  const [plans, setPlans] = useState<Service[]>([])
  const [selectedPlan, setSelectedPlan] = useState<Service | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (!network) return
    setLoadingPlans(true)
    setSelectedPlan(null)
    fetch(`/api/services?type=DATA&network=${network}`)
      .then((r) => r.json())
      .then((data) => setPlans(data.services || []))
      .catch(() => setPlans([]))
      .finally(() => setLoadingPlans(false))
  }, [network])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirmed) { setConfirmed(true); return }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const res = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          serviceType: 'DATA',
          amount: selectedPlan?.amount,
          mobileNumber: phone,
          serviceID: selectedPlan?.serviceID,
          network,
          planName: selectedPlan?.name,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Purchase failed')

      setToast({ message: `Data plan purchased for ${phone}!`, type: 'success' })
      setPhone('')
      setSelectedPlan(null)
      setConfirmed(false)
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : 'Purchase failed', type: 'error' })
      setConfirmed(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Buy Data" />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-5">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Select Network</p>
          <div className="grid grid-cols-4 gap-2">
            {networks.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setNetwork(n.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                  network === n.id ? 'border-[#059669] bg-[#d1fae5]' : 'border-gray-100 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-full ${n.color} flex items-center justify-center`}>
                  <span className={`text-xs font-bold ${n.textColor}`}>{n.label.slice(0, 3)}</span>
                </div>
                <span className="text-xs text-gray-600">{n.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Phone Number"
          type="tel"
          placeholder="08012345678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          icon={Wifi}
          maxLength={11}
          required
        />

        {network && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Select Plan</p>
            {loadingPlans ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-2 border-[#059669] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : plans.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No plans available</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {plans.map((plan) => (
                  <label
                    key={plan.serviceID}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedPlan?.serviceID === plan.serviceID
                        ? 'border-[#059669] bg-[#d1fae5]'
                        : 'border-gray-100 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      className="hidden"
                      checked={selectedPlan?.serviceID === plan.serviceID}
                      onChange={() => setSelectedPlan(plan)}
                    />
                    <span className="text-sm font-medium text-gray-800">{plan.name}</span>
                    <span className="text-sm font-bold text-[#059669]">₦{plan.amount?.toLocaleString()}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {confirmed && selectedPlan ? (
          <div className="bg-[#d1fae5] rounded-2xl p-4 space-y-3">
            <p className="text-sm font-semibold text-gray-800">Confirm Purchase</p>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Network: <span className="font-medium">{network.toUpperCase()}</span></p>
              <p>Phone: <span className="font-medium">{phone}</span></p>
              <p>Plan: <span className="font-medium">{selectedPlan.name}</span></p>
              <p>Amount: <span className="font-medium">₦{selectedPlan.amount?.toLocaleString()}</span></p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="md" className="flex-1" onClick={() => setConfirmed(false)}>
                Cancel
              </Button>
              <Button type="submit" size="md" className="flex-1" loading={loading}>
                Confirm
              </Button>
            </div>
          </div>
        ) : (
          <Button type="submit" size="lg" disabled={!network || !phone || !selectedPlan}>
            Continue
          </Button>
        )}
      </form>
    </div>
  )
}
