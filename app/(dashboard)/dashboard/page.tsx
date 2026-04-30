import Link from 'next/link'
import { Wallet, Plus, Phone, Wifi, Tv, Zap, GraduationCap, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { getSupabaseServer } from '@/lib/server-supabase'
import { redirect } from 'next/navigation'
import { formatCurrency, formatDate, getGreeting } from '@/lib/utils'
import Badge from '@/app/components/ui/Badge'

const quickActions = [
  { label: 'Airtime', icon: Phone, href: '/dashboard/airtime', color: 'bg-blue-100 text-blue-600' },
  { label: 'Data', icon: Wifi, href: '/dashboard/data', color: 'bg-purple-100 text-purple-600' },
  { label: 'Cable', icon: Tv, href: '/dashboard/cable', color: 'bg-orange-100 text-orange-600' },
  { label: 'Electricity', icon: Zap, href: '/dashboard/electricity', color: 'bg-yellow-100 text-yellow-600' },
  { label: 'Education', icon: GraduationCap, href: '/dashboard/education', color: 'bg-pink-100 text-pink-600' },
]

export default async function DashboardPage() {
  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [profileResult, transactionsResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const profile = profileResult.data
  const transactions = transactionsResult.data || []
  const balance = profile?.balance ?? 0
  const firstName = profile?.full_name?.split(' ')[0] || 'User'

  const statusMap: Record<string, 'success' | 'pending' | 'failed'> = {
    SUCCESS: 'success',
    PENDING: 'pending',
    FAILED: 'failed',
  }

  return (
    <div className="px-4 py-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{getGreeting()},</p>
          <h1 className="text-lg font-bold text-gray-900">{firstName} 👋</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#059669] flex items-center justify-center text-white font-bold text-sm">
          {firstName[0]?.toUpperCase()}
        </div>
      </div>

      {/* Balance Card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#059669] to-[#047857] p-5 text-white shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="w-4 h-4 opacity-80" />
          <span className="text-sm opacity-80">Wallet Balance</span>
        </div>
        <p className="text-3xl font-bold mb-4">{formatCurrency(balance)}</p>
        <Link
          href="/dashboard/fund"
          className="inline-flex items-center gap-2 bg-white text-[#059669] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Money
        </Link>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-5 gap-2">
          {quickActions.map(({ label, icon: Icon, href, color }) => (
            <Link key={href} href={href} className="flex flex-col items-center gap-1.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] text-gray-600 font-medium text-center">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Recent Transactions</h2>
          <Link href="/dashboard/transactions" className="text-xs text-[#059669] font-medium">
            View all
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
            <p className="text-sm text-gray-400">No transactions yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 p-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  tx.type === 'DEPOSIT' ? 'bg-green-100' : 'bg-red-50'
                }`}>
                  {tx.type === 'DEPOSIT'
                    ? <ArrowDownLeft className="w-4 h-4 text-green-600" />
                    : <ArrowUpRight className="w-4 h-4 text-red-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {tx.service_type || tx.type}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(tx.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-gray-800'}`}>
                    {tx.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(tx.amount)}
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
