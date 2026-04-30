'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PageHeaderProps {
  title: string
  backHref?: string
  rightElement?: React.ReactNode
}

export default function PageHeader({ title, backHref, rightElement }: PageHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (backHref) router.push(backHref)
    else router.back()
  }

  return (
    <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-base font-semibold text-gray-900">{title}</h1>
      </div>
      {rightElement}
    </div>
  )
}
