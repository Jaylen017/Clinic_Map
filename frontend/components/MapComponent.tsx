'use client'

import { useEffect, useRef } from 'react'
import { Clinic } from '@/lib/api'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapComponentProps {
  userLocation: { lat: number; lng: number }
  clinics: Clinic[]
  onClinicClick: (clinic: Clinic) => void
}

export default function MapComponent({
  userLocation,
  clinics,
  onClinicClick,
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const userMarkerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Initialize map
    mapRef.current = L.map(mapContainerRef.current).setView(
      [userLocation.lat, userLocation.lng],
      12
    )

    // Add tile layer (OpenStreetMap - completely free, no API key needed)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapRef.current)

    // Add user location marker
    const userIcon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: #3b82f6;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      "></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    })

    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
      icon: userIcon,
    }).addTo(mapRef.current)

    userMarkerRef.current.bindPopup('<div class="p-2"><strong>Your Location</strong></div>')

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [userLocation])

  // Update clinic markers
  useEffect(() => {
    if (!mapRef.current) return

    // Clear existing clinic markers
    markersRef.current.forEach((marker) => {
      marker.remove()
    })
    markersRef.current.clear()

    // Add clinic markers
    clinics.forEach((clinic) => {
      const clinicIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: ${clinic.isGooglePlace ? '#f59e0b' : '#10b981'};
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: transform 0.2s;
        "></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      })

      const marker = L.marker([clinic.latitude, clinic.longitude], {
        icon: clinicIcon,
      }).addTo(mapRef.current!)

      const distanceText =
        clinic.distance && clinic.distance < 1000
          ? `${clinic.distance} m`
          : clinic.distance
          ? `${(clinic.distance / 1000).toFixed(2)} km`
          : ''

      marker.bindPopup(`
        <div class="p-2">
          <strong>${clinic.name}</strong><br/>
          <span class="text-sm text-gray-600">${clinic.address}</span>
          ${distanceText ? `<p class="text-xs text-gray-500 mt-1">Distance: ${distanceText}</p>` : ''}
        </div>
      `)

      marker.on('click', () => {
        onClinicClick(clinic)
        // Center map on clinic
        mapRef.current?.setView([clinic.latitude, clinic.longitude], 15, {
          animate: true,
          duration: 1.0,
        })
      })

      markersRef.current.set(clinic.id, marker)
    })
  }, [clinics, onClinicClick])

  return (
    <>
      <div ref={mapContainerRef} className="w-full h-full" />
      <style jsx global>{`
        .leaflet-container {
          height: 100%;
          width: 100%;
          z-index: 0;
        }
        
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .custom-marker div:hover {
          transform: scale(1.2);
          transition: transform 0.2s;
        }
      `}</style>
    </>
  )
}


