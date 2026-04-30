import { redirect } from 'next/navigation'
import { getSupabaseServer } from '@/lib/server-supabase'
import Link from 'next/link'
import { Users, List, Settings, BarChart2 } from 'lucide-react'

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: BarChart2 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/transactions', label: 'Transactions', icon: List },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#059669] text-white px-4 py-3">
        <h1 className="text-base font-bold">MEDERSUB Admin</h1>
      </div>
      <div className="flex overflow-x-auto border-b border-gray-200 bg-white px-2">
        {adminNavItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-1.5 px-3 py-3 text-sm font-medium text-gray-600 hover:text-[#059669] whitespace-nowrap border-b-2 border-transparent hover:border-[#059669] transition-colors"
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </div>
      <main className="p-4">{children}</main>
    </div>
  )
}
