'use client'

import { useState } from 'react'
import { Zap, Hash } from 'lucide-react'
import PageHeader from '@/app/components/ui/PageHeader'
import Button from '@/app/components/ui/Button'
import Input from '@/app/components/ui/Input'
import Toast from '@/app/components/ui/Toast'
import { supabase } from '@/lib/supabase'

const providers = [
  { id: 'ekedc', label: 'EKEDC' },
  { id: 'ikedc', label: 'IKEDC' },
  { id: 'aedc', label: 'AEDC' },
  { id: 'phedc', label: 'PHEDC' },
  { id: 'eedc', label: 'EEDC' },
  { id: 'kedco', label: 'KEDCO' },
]

export default function ElectricityPage() {
  const [provider, setProvider] = useState('')
  const [meterType, setMeterType] = useState<'prepaid' | 'postpaid'>('prepaid')
  const [meterNumber, setMeterNumber] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [amount, setAmount] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const handleVerify = async () => {
    if (!meterNumber || !provider) return
    setVerifying(true)
    setCustomerName('')
    try {
      const res = await fetch(
        `/api/electricity/verify?serviceID=${provider}&billersCode=${meterNumber}&meterType=${meterType === 'prepaid' ? 1 : 2}`
      )
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
          serviceType: 'ELECTRICITY',
          amount: Number(amount),
          mobileNumber: meterNumber,
          serviceID: provider,
          meterType: meterType === 'prepaid' ? 1 : 2,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Purchase failed')

      setToast({ message: 'Electricity token purchased!', type: 'success' })
      setMeterNumber('')
      setCustomerName('')
      setAmount('')
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
      <PageHeader title="Buy Electricity" />
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
                className={`py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  provider === p.id
                    ? 'border-[#059669] bg-[#d1fae5] text-[#059669]'
                    : 'border-gray-100 bg-white text-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Meter Type</p>
          <div className="flex gap-3">
            {(['prepaid', 'postpaid'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setMeterType(type)}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium capitalize transition-all ${
                  meterType === type
                    ? 'border-[#059669] bg-[#d1fae5] text-[#059669]'
                    : 'border-gray-100 bg-white text-gray-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Meter Number"
          type="text"
          placeholder="Enter meter number"
          value={meterNumber}
          onChange={(e) => { setMeterNumber(e.target.value); setCustomerName('') }}
          icon={Hash}
          required
          rightElement={
            <Button
              type="button"
              size="sm"
              onClick={handleVerify}
              loading={verifying}
              disabled={!meterNumber || !provider}
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

        <Input
          label="Amount (₦)"
          type="number"
          placeholder="Minimum ₦500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          icon={Zap}
          min="500"
          required
        />

        {confirmed ? (
          <div className="bg-[#d1fae5] rounded-2xl p-4 space-y-3">
            <p className="text-sm font-semibold text-gray-800">Confirm Purchase</p>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Provider: <span className="font-medium">{provider.toUpperCase()}</span></p>
              <p>Meter: <span className="font-medium">{meterNumber}</span></p>
              <p>Type: <span className="font-medium capitalize">{meterType}</span></p>
              <p>Amount: <span className="font-medium">₦{Number(amount).toLocaleString()}</span></p>
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
          <Button type="submit" size="lg" disabled={!provider || !meterNumber || !customerName || !amount}>
            Continue
          </Button>
        )}
      </form>
    </div>
  )
}
