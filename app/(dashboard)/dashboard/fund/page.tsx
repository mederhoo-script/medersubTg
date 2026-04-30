'use client'

import { useState, useEffect } from 'react'
import { Wallet, Info } from 'lucide-react'
import PageHeader from '@/app/components/ui/PageHeader'
import Button from '@/app/components/ui/Button'
import Input from '@/app/components/ui/Input'
import Card from '@/app/components/ui/Card'
import Toast from '@/app/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

declare global {
  interface Window {
    MonnifySDK?: {
      initialize: (config: Record<string, unknown>) => void
    }
  }
}

export default function FundPage() {
  const [amount, setAmount] = useState('')
  const [balance, setBalance] = useState(0)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://sdk.monnify.com/plugin/monnify.js'
    script.async = true
    document.head.appendChild(script)

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserEmail(user.email || '')
      setUserId(user.id)
      supabase
        .from('profiles')
        .select('balance, full_name')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setBalance(data.balance || 0)
            setUserName(data.full_name || '')
          }
        })
    })

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const handlePay = () => {
    const amountNum = Number(amount)
    if (!amountNum || amountNum < 100) {
      setToast({ message: 'Minimum amount is ₦100', type: 'error' })
      return
    }

    setLoading(true)
    const reference = `FUND-${userId}-${Date.now()}`

    if (!window.MonnifySDK) {
      setToast({ message: 'Payment SDK not loaded. Please refresh.', type: 'error' })
      setLoading(false)
      return
    }

    window.MonnifySDK.initialize({
      amount: amountNum,
      currency: 'NGN',
      reference,
      customerFullName: userName || 'Customer',
      customerEmail: userEmail,
      apiKey: process.env.NEXT_PUBLIC_MONNIFY_API_KEY || '',
      contractCode: process.env.NEXT_PUBLIC_MONNIFY_CONTRACT_CODE || '',
      paymentDescription: 'Wallet Funding',
      isTestMode: process.env.NODE_ENV !== 'production',
      onComplete: async (response: { paymentReference: string; amountPaid: number }) => {
        try {
          const res = await fetch('/api/fund/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reference: response.paymentReference,
              amount: response.amountPaid,
              userId,
            }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Verification failed')
          setToast({ message: `Wallet funded with ${formatCurrency(response.amountPaid)}!`, type: 'success' })
          setBalance((prev) => prev + response.amountPaid)
          setAmount('')
        } catch (err: unknown) {
          setToast({ message: err instanceof Error ? err.message : 'Payment verification failed', type: 'error' })
        } finally {
          setLoading(false)
        }
      },
      onClose: () => setLoading(false),
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Fund Wallet" />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="px-4 py-5 space-y-5">
        <Card className="bg-gradient-to-br from-[#059669] to-[#047857] text-white border-0">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 opacity-80" />
            <span className="text-sm opacity-80">Current Balance</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(balance)}</p>
        </Card>

        <Card>
          <div className="space-y-4">
            <Input
              label="Amount (₦)"
              type="number"
              placeholder="Enter amount (min ₦100)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="100"
            />

            <div className="grid grid-cols-3 gap-2">
              {[500, 1000, 2000, 5000, 10000, 20000].map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAmount(String(a))}
                  className={`py-2 rounded-xl text-sm font-medium border transition-all ${
                    amount === String(a)
                      ? 'bg-[#059669] text-white border-[#059669]'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  ₦{a.toLocaleString()}
                </button>
              ))}
            </div>

            <Button size="lg" onClick={handlePay} loading={loading} disabled={!amount}>
              Pay with Monnify
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex gap-2">
            <Info className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-800">How to fund your wallet</p>
              <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                <li>Enter amount and click Pay</li>
                <li>Complete payment via card, bank transfer, or USSD</li>
                <li>Balance updates instantly after payment</li>
                <li>Minimum deposit: ₦100</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
