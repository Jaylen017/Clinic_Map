'use client'

import { Clinic, TimeSlot } from '@/lib/api'
import { useState, useEffect } from 'react'
import { clinicApi, bookingApi } from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MapPin, Phone, Clock, Calendar } from 'lucide-react'

interface ClinicPopupProps {
  clinic: Clinic
  onClose: () => void
  onBookingSuccess?: () => void
}

export default function ClinicPopup({
  clinic,
  onClose,
  onBookingSuccess,
}: ClinicPopupProps) {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const queryClient = useQueryClient()

  const { data: timeSlots = [], isLoading } = useQuery({
    queryKey: ['timeslots', clinic.id, selectedDate],
    queryFn: () => clinicApi.getTimeSlots(clinic.id, selectedDate),
    enabled: !!clinic.id && !clinic.isGooglePlace,
  })

  const bookingMutation = useMutation({
    mutationFn: (timeSlotId: string) =>
      bookingApi.book(clinic.id, { timeSlotId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeslots', clinic.id] })
      queryClient.invalidateQueries({ queryKey: ['clinic', clinic.id] })
      onBookingSuccess?.()
    },
  })

  // Group time slots by date
  const slotsByDate = timeSlots.reduce((acc, slot) => {
    const date = new Date(slot.date).toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(slot)
    return acc
  }, {} as Record<string, TimeSlot[]>)

  const availableDates = Object.keys(slotsByDate).sort()

  useEffect(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0])
    }
  }, [availableDates, selectedDate])

  const handleBook = (timeSlotId: string) => {
    if (confirm('Confirm booking this time slot?')) {
      bookingMutation.mutate(timeSlotId)
    }
  }

  if (clinic.isGooglePlace) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{clinic.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
            <p className="text-gray-700">{clinic.address}</p>
          </div>

          {clinic.phoneNumber && (
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-500" />
              <a
                href={`tel:${clinic.phoneNumber}`}
                className="text-blue-600 hover:underline"
              >
                {clinic.phoneNumber}
              </a>
            </div>
          )}

          {clinic.distance && (
            <p className="text-sm text-gray-500">
              Distance: {clinic.distance < 1000
                ? `${clinic.distance} m`
                : `${(clinic.distance / 1000).toFixed(2)} km`}
            </p>
          )}

          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              This is clinic information from Google Maps. Please contact the clinic directly for appointments.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold text-gray-900">{clinic.name}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-2">
          <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
          <p className="text-gray-700">{clinic.address}</p>
        </div>

        {clinic.phoneNumber && (
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-green-500" />
            <a
              href={`tel:${clinic.phoneNumber}`}
              className="text-blue-600 hover:underline"
            >
              {clinic.phoneNumber}
            </a>
          </div>
        )}

        {(clinic.walkInStart || clinic.walkInEnd) && (
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            <p className="text-gray-700">
              Walk-in Hours: {clinic.walkInStart} - {clinic.walkInEnd}
            </p>
          </div>
        )}

        {clinic.distance && (
          <p className="text-sm text-gray-500">
            Distance: {clinic.distance < 1000
              ? `${clinic.distance} m`
              : `${(clinic.distance / 1000).toFixed(2)} km`}
          </p>
        )}
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold text-gray-900">Available Time Slots</h3>
        </div>

        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : availableDates.length === 0 ? (
          <p className="text-gray-500">No available time slots</p>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {availableDates.map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap ${
                    selectedDate === date
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {new Date(date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </button>
              ))}
            </div>

            {selectedDate && slotsByDate[selectedDate] && (
              <div className="grid grid-cols-2 gap-2">
                {slotsByDate[selectedDate]
                  .filter((slot) => slot.isAvailable)
                  .map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => handleBook(slot.id)}
                      disabled={bookingMutation.isPending}
                      className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {slot.startTime} - {slot.endTime}
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {bookingMutation.isSuccess && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <p className="text-green-800 font-semibold">
              ✓ Booking successful! Your appointment has been confirmed.
            </p>
            <button
              onClick={() => {
                window.location.href = '/booking-success'
              }}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              View Details
            </button>
          </div>
        )}

        {bookingMutation.isError && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <p className="text-red-800">
              Booking failed. Please try again.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

