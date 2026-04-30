'use client'

import { useState, useEffect } from 'react'
import { LogOut, Edit2, Lock, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/app/components/ui/PageHeader'
import Card from '@/app/components/ui/Card'
import Button from '@/app/components/ui/Button'
import Toast from '@/app/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { UserProfile } from '@/types'
import { formatCurrency } from '@/lib/utils'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }) => { if (data) setProfile(data as UserProfile) })
    })
  }, [])

  const handleLogout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'

  const menuItems = [
    { icon: Edit2, label: 'Edit Name', action: () => setToast({ message: 'Coming soon', type: 'success' }) },
    { icon: Lock, label: 'Change Password', action: () => router.push('/forgot-password') },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Profile" />
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="px-4 py-5 space-y-4">
        {/* Avatar & Info */}
        <Card className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-[#059669] flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
            {initials}
          </div>
          <h2 className="text-base font-bold text-gray-900">{profile?.full_name || 'User'}</h2>
          <p className="text-sm text-gray-500 mb-4">{profile?.email}</p>
          <div className="bg-[#d1fae5] rounded-xl px-4 py-3 inline-block">
            <p className="text-xs text-gray-500 mb-1">Wallet Balance</p>
            <p className="text-lg font-bold text-[#059669]">{formatCurrency(profile?.balance || 0)}</p>
          </div>
        </Card>

        {/* Settings */}
        <Card padding={false}>
          {menuItems.map(({ icon: Icon, label, action }, i) => (
            <button
              key={label}
              onClick={action}
              className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                i < menuItems.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-800">{label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          ))}
        </Card>

        {/* Logout */}
        <Button variant="danger" size="lg" onClick={handleLogout} loading={loading}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>

        <p className="text-center text-xs text-gray-400">MEDERSUB v1.0.0</p>
      </div>
    </div>
  )
}
