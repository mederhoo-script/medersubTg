'use client'

import { useState, useEffect } from 'react'
import { ArrowUpRight, ArrowDownLeft, RotateCcw } from 'lucide-react'
import PageHeader from '@/app/components/ui/PageHeader'
import Badge from '@/app/components/ui/Badge'
import LoadingSpinner from '@/app/components/ui/LoadingSpinner'
import { supabase } from '@/lib/supabase'
import { Transaction } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

type Filter = 'ALL' | 'DEPOSIT' | 'PURCHASE'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<Filter>('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (filter !== 'ALL') {
        query = query.eq('type', filter)
      }

      const { data } = await query
      setTransactions(data || [])
      setLoading(false)
    }
    load()
  }, [filter])

  const statusMap: Record<string, 'success' | 'pending' | 'failed'> = {
    SUCCESS: 'success',
    PENDING: 'pending',
    FAILED: 'failed',
  }

  const getIcon = (tx: Transaction) => {
    if (tx.type === 'DEPOSIT') return <ArrowDownLeft className="w-4 h-4 text-green-600" />
    if (tx.type === 'REFUND') return <RotateCcw className="w-4 h-4 text-blue-600" />
    return <ArrowUpRight className="w-4 h-4 text-red-500" />
  }

  const getIconBg = (tx: Transaction) => {
    if (tx.type === 'DEPOSIT') return 'bg-green-100'
    if (tx.type === 'REFUND') return 'bg-blue-100'
    return 'bg-red-50'
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Transactions" />

      <div className="sticky top-[57px] bg-gray-50 px-4 py-3 z-10">
        <div className="flex gap-2">
          {(['ALL', 'DEPOSIT', 'PURCHASE'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-[#059669] text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-0">
        {transactions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No transactions found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 p-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getIconBg(tx)}`}>
                  {getIcon(tx)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{tx.service_type || tx.type}</p>
                  <p className="text-xs text-gray-400 truncate">{tx.reference}</p>
                  <p className="text-xs text-gray-400">{formatDate(tx.created_at)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? 'text-green-600' : 'text-gray-800'}`}>
                    {tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  <Badge variant={statusMap[tx.status] || 'info'}>{tx.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
