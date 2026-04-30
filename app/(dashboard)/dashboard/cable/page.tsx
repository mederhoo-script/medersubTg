'use client'

import { useState, useEffect } from 'react'
import { Tv, CreditCard } from 'lucide-react'
import PageHeader from '@/app/components/ui/PageHeader'
import Button from '@/app/components/ui/Button'
import Input from '@/app/components/ui/Input'
import Toast from '@/app/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { Service } from '@/types'

const providers = [
  { id: 'dstv', label: 'DSTV', color: 'bg-blue-600', textColor: 'text-white' },
  { id: 'gotv', label: 'GOTV', color: 'bg-orange-500', textColor: 'text-white' },
  { id: 'startimes', label: 'Startimes', color: 'bg-red-600', textColor: 'text-white' },
]

export default function CablePage() {
  const [provider, setProvider] = useState('')
  const [iucNumber, setIucNumber] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [plans, setPlans] = useState<Service[]>([])
  const [selectedPlan, setSelectedPlan] = useState<Service | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (!provider) return
    setSelectedPlan(null)
    fetch(`/api/services?type=CABLE&network=${provider}`)
      .then((r) => r.json())
      .then((data) => setPlans(data.services || []))
      .catch(() => setPlans([]))
  }, [provider])

  const handleVerify = async () => {
    if (!iucNumber || !provider) return
    setVerifying(true)
    setCustomerName('')
    try {
      const res = await fetch(`/api/cable/verify?serviceID=${provider}&billersCode=${iucNumber}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Verification failed')
      setCustomerName(data.customerName || 'Verified')
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : 'Verification failed', type: 'error' })
    } finally {
      setVerifying(false)
    }
  }

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
          serviceType: 'CABLE',
          amount: selectedPlan?.amount,
          mobileNumber: iucNumber,
          serviceID: selectedPlan?.serviceID,
          planName: selectedPlan?.name,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Purchase failed')

      setToast({ message: 'Cable subscription successful!', type: 'success' })
      setIucNumber('')
      setCustomerName('')
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
      <PageHeader title="Cable TV" />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-5">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Select Provider</p>
          <div className="grid grid-cols-3 gap-2">
            {providers.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProvider(p.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                  provider === p.id ? 'border-[#059669] bg-[#d1fae5]' : 'border-gray-100 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-full ${p.color} flex items-center justify-center`}>
                  <Tv className={`w-5 h-5 ${p.textColor}`} />
                </div>
                <span className="text-xs text-gray-600">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Input
          label="IUC / Smart Card Number"
          type="text"
          placeholder="Enter IUC number"
          value={iucNumber}
          onChange={(e) => { setIucNumber(e.target.value); setCustomerName('') }}
          icon={CreditCard}
          required
          rightElement={
            <Button
              type="button"
              size="sm"
              onClick={handleVerify}
              loading={verifying}
              disabled={!iucNumber || !provider}
            >
              Verify
            </Button>
          }
        />

        {customerName && (
          <div className="bg-[#d1fae5] rounded-xl p-3">
            <p className="text-sm text-[#059669] font-medium">✓ {customerName}</p>
          </div>
        )}

        {provider && plans.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Select Plan</p>
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
          </div>
        )}

        {confirmed && selectedPlan ? (
          <div className="bg-[#d1fae5] rounded-2xl p-4 space-y-3">
            <p className="text-sm font-semibold text-gray-800">Confirm Purchase</p>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Provider: <span className="font-medium">{provider.toUpperCase()}</span></p>
              <p>IUC: <span className="font-medium">{iucNumber}</span></p>
              <p>Customer: <span className="font-medium">{customerName}</span></p>
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
          <Button type="submit" size="lg" disabled={!provider || !iucNumber || !customerName || !selectedPlan}>
            Continue
          </Button>
        )}
      </form>
    </div>
  )
}
