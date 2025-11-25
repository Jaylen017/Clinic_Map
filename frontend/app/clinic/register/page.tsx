'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { clinicApi } from '@/lib/api'
import { useMutation } from '@tanstack/react-query'

const formSchema = z.object({
  name: z.string().min(1, 'Clinic name is required'),
  address: z.string().min(1, 'Address is required'),
  phoneNumber: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  walkInStart: z.string().optional(),
  walkInEnd: z.string().optional(),
  photoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
})

type FormData = z.infer<typeof formSchema>

export default function ClinicRegisterPage() {
  const router = useRouter()
  const [timeSlots, setTimeSlots] = useState<
    Array<{
      date: string
      times: Array<{ startTime: string; endTime: string }>
    }>
  >([])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const mutation = useMutation({
    mutationFn: (data: FormData & { timeSlots?: typeof timeSlots }) =>
      clinicApi.register(data),
    onSuccess: () => {
      alert('Clinic registered successfully!')
      router.push('/welcome')
    },
    onError: (error: any) => {
      alert(`Registration failed: ${error.message}`)
    },
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate({
      ...data,
      timeSlots: timeSlots.length > 0 ? timeSlots : undefined,
    })
  }

  const addTimeSlot = () => {
    setTimeSlots([
      ...timeSlots,
      {
        date: new Date().toISOString().split('T')[0],
        times: [{ startTime: '09:00', endTime: '10:00' }],
      },
    ])
  }

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index))
  }

  const addTimeToSlot = (slotIndex: number) => {
    const updated = [...timeSlots]
    updated[slotIndex].times.push({ startTime: '09:00', endTime: '10:00' })
    setTimeSlots(updated)
  }

  const updateTimeSlot = (
    slotIndex: number,
    timeIndex: number,
    field: 'date' | 'startTime' | 'endTime',
    value: string
  ) => {
    const updated = [...timeSlots]
    if (field === 'date') {
      updated[slotIndex].date = value
    } else {
      updated[slotIndex].times[timeIndex][field] = value
    }
    setTimeSlots(updated)
  }

  const removeTimeFromSlot = (slotIndex: number, timeIndex: number) => {
    const updated = [...timeSlots]
    updated[slotIndex].times = updated[slotIndex].times.filter(
      (_, i) => i !== timeIndex
    )
    setTimeSlots(updated)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Register Clinic
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Clinic Name *
                </label>
                <input
                  {...register('name')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., City Medical Center"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address * (Google Maps autocomplete will be used)
                </label>
                <input
                  {...register('address')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full address"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    {...register('phoneNumber')}
                    type="tel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1-555-0123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="info@clinic.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Walk-in Start Time
                  </label>
                  <input
                    {...register('walkInStart')}
                    type="time"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Walk-in End Time
                  </label>
                  <input
                    {...register('walkInEnd')}
                    type="time"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Clinic Photo URL (Optional)
                </label>
                <input
                  {...register('photoUrl')}
                  type="url"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/photo.jpg"
                />
                {errors.photoUrl && (
                  <p className="text-red-500 text-sm mt-1">{errors.photoUrl.message}</p>
                )}
              </div>
            </div>

            {/* Time Slots */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Available Time Slots
                </h2>
                <button
                  type="button"
                  onClick={addTimeSlot}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Date
                </button>
              </div>

              {timeSlots.map((slot, slotIndex) => (
                <div
                  key={slotIndex}
                  className="mb-4 p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-2">
                    <input
                      type="date"
                      value={slot.date}
                      onChange={(e) =>
                        updateTimeSlot(slotIndex, 0, 'date', e.target.value)
                      }
                      className="px-3 py-1 border border-gray-300 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(slotIndex)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>

                  {slot.times.map((time, timeIndex) => (
                    <div key={timeIndex} className="flex gap-2 mb-2">
                      <input
                        type="time"
                        value={time.startTime}
                        onChange={(e) =>
                          updateTimeSlot(
                            slotIndex,
                            timeIndex,
                            'startTime',
                            e.target.value
                          )
                        }
                        className="px-3 py-1 border border-gray-300 rounded"
                      />
                      <span className="self-center">-</span>
                      <input
                        type="time"
                        value={time.endTime}
                        onChange={(e) =>
                          updateTimeSlot(
                            slotIndex,
                            timeIndex,
                            'endTime',
                            e.target.value
                          )
                        }
                        className="px-3 py-1 border border-gray-300 rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeTimeFromSlot(slotIndex, timeIndex)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addTimeToSlot(slotIndex)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Add Time Slot
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? 'Submitting...' : 'Submit Registration'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/welcome')}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

