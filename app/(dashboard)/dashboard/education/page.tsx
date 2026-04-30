'use client'

import { useState, useEffect } from 'react'
import { GraduationCap } from 'lucide-react'
import PageHeader from '@/app/components/ui/PageHeader'
import Button from '@/app/components/ui/Button'
import Input from '@/app/components/ui/Input'
import Toast from '@/app/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { Service } from '@/types'

const examBodies = [
  { id: 'waec', label: 'WAEC' },
  { id: 'jamb', label: 'JAMB' },
  { id: 'neco', label: 'NECO' },
  { id: 'nabteb', label: 'NABTEB' },
]

export default function EducationPage() {
  const [examBody, setExamBody] = useState('')
  const [phone, setPhone] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [plans, setPlans] = useState<Service[]>([])
  const [selectedPlan, setSelectedPlan] = useState<Service | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    if (!examBody) return
    setSelectedPlan(null)
    fetch(`/api/services?type=EDUCATION&network=${examBody}`)
      .then((r) => r.json())
      .then((data) => setPlans(data.services || []))
      .catch(() => setPlans([]))
  }, [examBody])

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
          serviceType: 'EDUCATION',
          amount: (selectedPlan?.amount || 0) * quantity,
          mobileNumber: phone,
          serviceID: selectedPlan?.serviceID,
          quantity,
          planName: selectedPlan?.name,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Purchase failed')

      setToast({ message: `${quantity} ${examBody.toUpperCase()} pin(s) purchased!`, type: 'success' })
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
      <PageHeader title="Education Pins" />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-5">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Select Exam Body</p>
          <div className="grid grid-cols-2 gap-2">
            {examBodies.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setExamBody(e.id)}
                className={`flex items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                  examBody === e.id ? 'border-[#059669] bg-[#d1fae5]' : 'border-gray-100 bg-white'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#d1fae5] flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-[#059669]" />
                </div>
                <span className="text-sm font-medium text-gray-800">{e.label}</span>
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
          maxLength={11}
          required
        />

        {examBody && plans.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Select Pin Type</p>
            <div className="space-y-2">
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

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Quantity</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 font-bold"
            >
              −
            </button>
            <span className="text-base font-semibold text-gray-800 w-8 text-center">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 font-bold"
            >
              +
            </button>
          </div>
        </div>

        {confirmed && selectedPlan ? (
          <div className="bg-[#d1fae5] rounded-2xl p-4 space-y-3">
            <p className="text-sm font-semibold text-gray-800">Confirm Purchase</p>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Exam: <span className="font-medium">{examBody.toUpperCase()}</span></p>
              <p>Pin: <span className="font-medium">{selectedPlan.name}</span></p>
              <p>Quantity: <span className="font-medium">{quantity}</span></p>
              <p>Total: <span className="font-medium">₦{((selectedPlan.amount || 0) * quantity).toLocaleString()}</span></p>
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
          <Button type="submit" size="lg" disabled={!examBody || !phone || !selectedPlan}>
            Continue
          </Button>
        )}
      </form>
    </div>
  )
}
