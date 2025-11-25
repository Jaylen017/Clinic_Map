'use client'

import { useEffect, useState } from 'react'
import { clinicApi, Clinic } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import ClinicPopup from '@/components/ClinicPopup'
import { getSocket } from '@/lib/socket'
import dynamic from 'next/dynamic'

// Dynamically import map component to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4 bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-700">Loading map...</p>
      </div>
    </div>
  ),
})

export default function PatientMapPage() {
  const [userLocation, setUserLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null)

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Geolocation error:', error)
          // Default to a location (e.g., New York)
          setUserLocation({ lat: 40.7128, lng: -74.0060 })
        }
      )
    } else {
      // Default location
      setUserLocation({ lat: 40.7128, lng: -74.0060 })
    }
  }, [])

  // Fetch clinics
  const { data: clinics = [] } = useQuery({
    queryKey: ['clinics', userLocation?.lat, userLocation?.lng],
    queryFn: () => {
      if (!userLocation) return []
      return clinicApi.search(userLocation.lat, userLocation.lng, 10000)
    },
    enabled: !!userLocation,
  })

  // Setup Socket.IO for real-time updates
  useEffect(() => {
    if (!selectedClinic || selectedClinic.isGooglePlace) return

    const socket = getSocket()
    socket.emit('join:clinic', selectedClinic.id)

    socket.on('timeslot:updated', (data: any) => {
      if (data.timeSlotId) {
        window.location.reload()
      }
    })

    return () => {
      socket.emit('leave:clinic', selectedClinic.id)
    }
  }, [selectedClinic])

  if (!userLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4 bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Getting your location...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen">
      <MapComponent
        userLocation={userLocation}
        clinics={clinics}
        onClinicClick={setSelectedClinic}
      />

      {selectedClinic && (
        <div className="absolute top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[1000]">
          <ClinicPopup
            clinic={selectedClinic}
            onClose={() => setSelectedClinic(null)}
            onBookingSuccess={() => {
              // Optionally close popup or show success message
            }}
          />
        </div>
      )}
    </div>
  )
}
