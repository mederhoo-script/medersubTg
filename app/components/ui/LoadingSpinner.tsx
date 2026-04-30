export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-[#d1fae5] border-t-[#059669] rounded-full animate-spin mb-3" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}
