'use client'

import { useState, useEffect } from 'react'
import Badge from '@/app/components/ui/Badge'
import Button from '@/app/components/ui/Button'
import Toast from '@/app/components/ui/Toast'
import { formatCurrency } from '@/lib/utils'
import { UserProfile } from '@/types'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [editUser, setEditUser] = useState<UserProfile | null>(null)
  const [editName, setEditName] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadUsers = async () => {
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    setUsers(data.users || [])
    setLoading(false)
  }

  useEffect(() => { loadUsers() }, [])

  const handleBlock = async (userId: string, block: boolean) => {
    setActionLoading(userId)
    try {
      const res = await fetch('/api/admin/users/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, block }),
      })
      if (!res.ok) throw new Error('Action failed')
      setToast({ message: `User ${block ? 'blocked' : 'unblocked'}`, type: 'success' })
      loadUsers()
    } catch {
      setToast({ message: 'Action failed', type: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleEditSave = async () => {
    if (!editUser) return
    setActionLoading(editUser.id)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: editUser.id, full_name: editName }),
      })
      if (!res.ok) throw new Error('Update failed')
      setToast({ message: 'User updated', type: 'success' })
      setEditUser(null)
      loadUsers()
    } catch {
      setToast({ message: 'Update failed', type: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return <div className="text-center py-10 text-sm text-gray-400">Loading users...</div>

  return (
    <div className="space-y-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <h2 className="text-sm font-semibold text-gray-700">All Users ({users.length})</h2>

      {editUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm space-y-4">
            <h3 className="font-semibold text-gray-800">Edit User</h3>
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Full name"
            />
            <div className="flex gap-2">
              <Button variant="secondary" size="md" className="flex-1" onClick={() => setEditUser(null)}>
                Cancel
              </Button>
              <Button size="md" className="flex-1" loading={!!actionLoading} onClick={handleEditSave}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-3 font-medium text-gray-600">Name</th>
                <th className="text-left p-3 font-medium text-gray-600">Balance</th>
                <th className="text-left p-3 font-medium text-gray-600">Role</th>
                <th className="text-left p-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="p-3">
                    <p className="font-medium text-gray-800">{user.full_name || 'N/A'}</p>
                    <p className="text-gray-400 truncate max-w-[120px]">{user.email}</p>
                  </td>
                  <td className="p-3 font-medium">{formatCurrency(user.balance)}</td>
                  <td className="p-3">
                    <Badge variant={user.role === 'ADMIN' ? 'info' : 'success'}>{user.role}</Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditUser(user); setEditName(user.full_name || '') }}
                        className="px-2 py-1 text-xs bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleBlock(user.id, true)}
                        disabled={actionLoading === user.id}
                        className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                      >
                        Block
                      </button>
                    </div>
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
