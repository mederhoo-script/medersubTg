'use client'

import { useState, useEffect } from 'react'
import Badge from '@/app/components/ui/Badge'
import Toast from '@/app/components/ui/Toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Transaction } from '@/types'

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [refundLoading, setRefundLoading] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/transactions')
      .then((r) => r.json())
      .then((data) => { setTransactions(data.transactions || []); setLoading(false) })
  }, [])

  const handleRefund = async (txId: string) => {
    setRefundLoading(txId)
    try {
      const res = await fetch('/api/admin/transactions/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: txId }),
      })
      if (!res.ok) throw new Error('Refund failed')
      setToast({ message: 'Refund processed', type: 'success' })
      setTransactions((prev) =>
        prev.map((t) => t.id === txId ? { ...t, status: 'FAILED' as Transaction['status'] } : t)
      )
    } catch {
      setToast({ message: 'Refund failed', type: 'error' })
    } finally {
      setRefundLoading(null)
    }
  }

  const statusMap: Record<string, 'success' | 'pending' | 'failed'> = {
    SUCCESS: 'success', PENDING: 'pending', FAILED: 'failed',
  }

  if (loading) return <div className="text-center py-10 text-sm text-gray-400">Loading...</div>

  return (
    <div className="space-y-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <h2 className="text-sm font-semibold text-gray-700">Transactions ({transactions.length})</h2>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-3 font-medium text-gray-600">Type</th>
                <th className="text-left p-3 font-medium text-gray-600">Amount</th>
                <th className="text-left p-3 font-medium text-gray-600">Status</th>
                <th className="text-left p-3 font-medium text-gray-600">Date</th>
                <th className="text-left p-3 font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="p-3 font-medium">{tx.service_type || tx.type}</td>
                  <td className="p-3">{formatCurrency(tx.amount)}</td>
                  <td className="p-3">
                    <Badge variant={statusMap[tx.status] || 'info'}>{tx.status}</Badge>
                  </td>
                  <td className="p-3 text-gray-400">{formatDate(tx.created_at)}</td>
                  <td className="p-3">
                    {tx.type === 'PURCHASE' && tx.status === 'FAILED' && (
                      <button
                        onClick={() => handleRefund(tx.id)}
                        disabled={refundLoading === tx.id}
                        className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                      >
                        {refundLoading === tx.id ? '...' : 'Refund'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
