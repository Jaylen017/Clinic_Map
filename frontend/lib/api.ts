import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface Clinic {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  phoneNumber?: string
  email?: string
  walkInStart?: string
  walkInEnd?: string
  photoUrl?: string
  distance?: number
  isGooglePlace?: boolean
  googlePlaceId?: string
  timeSlots?: TimeSlot[]
}

export interface TimeSlot {
  id: string
  clinicId: string
  date: string
  startTime: string
  endTime: string
  isAvailable: boolean
}

export interface Booking {
  id: string
  clinicId: string
  timeSlotId: string
  status: string
  createdAt: string
}

// Clinic APIs
export const clinicApi = {
  register: async (data: {
    name: string
    address: string
    phoneNumber?: string
    email?: string
    walkInStart?: string
    walkInEnd?: string
    photoUrl?: string
    timeSlots?: Array<{
      date: string
      times: Array<{ startTime: string; endTime: string }>
    }>
  }) => {
    const response = await api.post('/clinic/register', data)
    return response.data
  },

  search: async (lat: number, lng: number, radius: number = 5000) => {
    const response = await api.get<{ success: boolean; clinics: Clinic[] }>(
      '/clinics/search',
      {
        params: { lat, lng, radius },
      }
    )
    return response.data.clinics
  },

  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; clinic: Clinic }>(
      `/clinic/${id}`
    )
    return response.data.clinic
  },

  getTimeSlots: async (id: string, date?: string) => {
    const response = await api.get<{ success: boolean; timeSlots: TimeSlot[] }>(
      `/clinic/${id}/timeslots`,
      {
        params: date ? { date } : {},
      }
    )
    return response.data.timeSlots
  },
}

// Booking APIs
export const bookingApi = {
  book: async (clinicId: string, data: { timeSlotId: string; notes?: string }) => {
    const response = await api.post<{ success: boolean; booking: Booking }>(
      `/clinic/${clinicId}/book`,
      data
    )
    return response.data.booking
  },
}

// Auth APIs
export const authApi = {
  signup: async (data: {
    email: string
    password: string
    name?: string
    role?: 'PATIENT' | 'CLINIC'
  }) => {
    const response = await api.post('/signup', data)
    return response.data
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/login', data)
    return response.data
  },
}

export default api


