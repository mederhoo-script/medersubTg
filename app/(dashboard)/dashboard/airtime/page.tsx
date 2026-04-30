'use client'

import { useState } from 'react'
import { Phone } from 'lucide-react'
import PageHeader from '@/app/components/ui/PageHeader'
import Button from '@/app/components/ui/Button'
import Input from '@/app/components/ui/Input'
import Toast from '@/app/components/ui/Toast'
import { supabase } from '@/lib/supabase'

const networks = [
  { id: 'mtn', label: 'MTN', color: 'bg-yellow-400', textColor: 'text-yellow-900' },
  { id: 'airtel', label: 'Airtel', color: 'bg-red-500', textColor: 'text-white' },
  { id: 'glo', label: 'Glo', color: 'bg-green-500', textColor: 'text-white' },
  { id: '9mobile', label: '9mobile', color: 'bg-emerald-800', textColor: 'text-white' },
]

const quickAmounts = [50, 100, 200, 500, 1000, 2000]

export default function AirtimePage() {
  const [network, setNetwork] = useState('')
  const [phone, setPhone] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!confirmed) {
      setConfirmed(true)
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const res = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          serviceType: 'AIRTIME',
          amount: Number(amount),
          mobileNumber: phone,
          serviceID: `${network}-airtime`,
          network,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Purchase failed')

      setToast({ message: `₦${amount} airtime sent to ${phone}!`, type: 'success' })
      setPhone('')
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
      <PageHeader title="Buy Airtime" />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-5">
        {/* Network Selector */}
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

        {/* Phone Input */}
        <Input
          label="Phone Number"
          type="tel"
          placeholder="08012345678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          icon={Phone}
          maxLength={11}
          required
        />

        {/* Quick Amounts */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Select Amount</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {quickAmounts.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAmount(String(a))}
                className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  amount === String(a)
                    ? 'bg-[#059669] text-white border-[#059669]'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                ₦{a.toLocaleString()}
              </button>
            ))}
          </div>
          <Input
            label="Or enter custom amount"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="50"
            required
          />
        </div>

        {/* Confirmation or Submit */}
        {confirmed ? (
          <div className="bg-[#d1fae5] rounded-2xl p-4 space-y-3">
            <p className="text-sm font-semibold text-gray-800">Confirm Purchase</p>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Network: <span className="font-medium">{network.toUpperCase()}</span></p>
              <p>Phone: <span className="font-medium">{phone}</span></p>
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
          <Button type="submit" size="lg" disabled={!network || !phone || !amount}>
            Continue
          </Button>
        )}
      </form>
    </div>
  )
}
