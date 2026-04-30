'use client'

import { useEffect } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToastProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={cn(
      'fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg min-w-[280px] max-w-[360px]',
      type === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'
    )}>
      {type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
      <p className="text-sm flex-1">{message}</p>
      <button onClick={onClose} className="shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
