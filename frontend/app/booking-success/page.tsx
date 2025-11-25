'use client'

import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

export default function BookingSuccessPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Booking Successful!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Your appointment has been confirmed. We have sent you a confirmation message.
          </p>
          <button
            onClick={() => router.push('/patient/map')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Map
          </button>
        </div>
      </div>
    </div>
  )
}

