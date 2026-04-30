import { getSupabaseServer } from '@/lib/server-supabase'
import { formatCurrency } from '@/lib/utils'
import Badge from '@/app/components/ui/Badge'

export default async function AdminDashboardPage() {
  const supabase = await getSupabaseServer()

  const [usersResult, txResult] = await Promise.all([
    supabase.from('profiles').select('id, balance', { count: 'exact' }),
    supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(10),
  ])

  const totalUsers = usersResult.count || 0
  const transactions = txResult.data || []
  const totalRevenue = transactions
    .filter((t) => t.type === 'PURCHASE' && t.status === 'SUCCESS')
    .reduce((s: number, t: { amount: number }) => s + t.amount, 0)
  const totalTransactions = transactions.length

  const statusMap: Record<string, 'success' | 'pending' | 'failed'> = {
    SUCCESS: 'success', PENDING: 'pending', FAILED: 'failed',
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Users', value: totalUsers.toLocaleString() },
          { label: 'Transactions', value: totalTransactions.toLocaleString() },
          { label: 'Revenue', value: formatCurrency(totalRevenue) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-base font-bold text-gray-900 truncate">{value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent Transactions</h2>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-600">Type</th>
                  <th className="text-left p-3 font-medium text-gray-600">Amount</th>
                  <th className="text-left p-3 font-medium text-gray-600">Status</th>
                  <th className="text-left p-3 font-medium text-gray-600">Date</th>
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
                    <td className="p-3 text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
