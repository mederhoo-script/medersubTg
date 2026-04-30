import { redirect } from 'next/navigation'
import { getSupabaseServer } from '@/lib/server-supabase'
import BottomNav from '@/app/components/ui/BottomNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
