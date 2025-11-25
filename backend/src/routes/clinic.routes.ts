import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { geocodeAddress, validateAddress, searchNearbyClinics } from '../services/googleMaps.service';
import { z } from 'zod';
import { emitTimeslotUpdate } from '../socket';
import { io } from '../server';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const registerClinicSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(1),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional(),
  walkInStart: z.string().optional(),
  walkInEnd: z.string().optional(),
  photoUrl: z.string().url().optional(),
  timeSlots: z.array(z.object({
    date: z.string(),
    times: z.array(z.object({
      startTime: z.string(),
      endTime: z.string(),
    })),
  })).optional(),
  userId: z.string().optional(), // For authenticated users
});

const searchClinicsSchema = z.object({
  lat: z.string().transform(Number),
  lng: z.string().transform(Number),
  radius: z.string().transform(Number).optional().default(5000),
});

/**
 * POST /api/clinic/register
 * Register a new clinic
 */
router.post('/register', async (req, res) => {
  try {
    const data = registerClinicSchema.parse(req.body);

    // Validate address
    const isValid = await validateAddress(data.address);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid address' });
    }

    // Geocode address
    const geocodeResult = await geocodeAddress(data.address);

    // Create or get user (if userId provided, use it; otherwise create guest user)
    let userId = data.userId;
    if (!userId) {
      // Create a guest user for clinic registration
      const guestUser = await prisma.user.create({
        data: {
          email: data.email || `clinic_${Date.now()}@temp.com`,
          password: 'temp', // In production, require proper auth
          name: data.name,
          role: 'CLINIC',
        },
      });
      userId = guestUser.id;
    }

    // Create clinic
    const clinic = await prisma.clinic.create({
      data: {
        name: data.name,
        address: geocodeResult.formatted_address,
        latitude: geocodeResult.lat,
        longitude: geocodeResult.lng,
        phoneNumber: data.phoneNumber,
        email: data.email,
        walkInStart: data.walkInStart,
        walkInEnd: data.walkInEnd,
        photoUrl: data.photoUrl,
        googlePlaceId: geocodeResult.place_id,
        isSearchable: true,
        userId,
      },
    });

    // Create time slots if provided
    if (data.timeSlots && data.timeSlots.length > 0) {
      const timeSlotData = data.timeSlots.flatMap(slot =>
        slot.times.map(time => ({
          clinicId: clinic.id,
          date: new Date(slot.date),
          startTime: time.startTime,
          endTime: time.endTime,
          isAvailable: true,
        }))
      );

      await prisma.timeSlot.createMany({
        data: timeSlotData,
      });
    }

    res.status(201).json({
      success: true,
      clinic: {
        id: clinic.id,
        name: clinic.name,
        address: clinic.address,
        latitude: clinic.latitude,
        longitude: clinic.longitude,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Register clinic error:', error);
    res.status(500).json({ error: error.message || 'Failed to register clinic' });
  }
});

/**
 * GET /api/clinics/search
 * Search for nearby clinics
 */
router.get('/search', async (req, res) => {
  try {
    const { lat, lng, radius } = searchClinicsSchema.parse(req.query);

    // Search in database first
    const dbClinics = await prisma.clinic.findMany({
      where: {
        isSearchable: true,
        latitude: {
          gte: lat - 0.1, // Approximate bounding box
          lte: lat + 0.1,
        },
        longitude: {
          gte: lng - 0.1,
          lte: lng + 0.1,
        },
      },
      include: {
        timeSlots: {
          where: {
            isAvailable: true,
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)), // Today or future
            },
          },
          orderBy: {
            date: 'asc',
          },
        },
      },
    });

    // Also fetch from Google Maps for real clinics
    let googleClinics: any[] = [];
    try {
      const places = await searchNearbyClinics(lat, lng, radius);
      googleClinics = places.map(place => ({
        id: `google_${place.place_id}`,
        name: place.name,
        address: place.formatted_address,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        phoneNumber: place.formatted_phone_number || place.international_phone_number,
        googlePlaceId: place.place_id,
        isGooglePlace: true,
        timeSlots: [], // Google places don't have time slots
      }));
    } catch (error) {
      console.error('Google Places search error:', error);
    }

    // Calculate distances and combine results
    const allClinics = [...dbClinics, ...googleClinics].map(clinic => {
      const distance = calculateDistance(lat, lng, clinic.latitude, clinic.longitude);
      return {
        ...clinic,
        distance: Math.round(distance), // Distance in meters
      };
    });

    // Sort by distance
    allClinics.sort((a, b) => a.distance - b.distance);

    res.json({
      success: true,
      clinics: allClinics,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Search clinics error:', error);
    res.status(500).json({ error: error.message || 'Failed to search clinics' });
  }
});

/**
 * GET /api/clinic/:id
 * Get clinic details
 */
router.get('/:id', async (req, res) => {
  try {
    const clinic = await prisma.clinic.findUnique({
      where: { id: req.params.id },
      include: {
        timeSlots: {
          where: {
            isAvailable: true,
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
          orderBy: [
            { date: 'asc' },
            { startTime: 'asc' },
          ],
        },
      },
    });

    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    res.json({
      success: true,
      clinic,
    });
  } catch (error: any) {
    console.error('Get clinic error:', error);
    res.status(500).json({ error: error.message || 'Failed to get clinic' });
  }
});

/**
 * GET /api/clinic/:id/timeslots
 * Get available time slots for a clinic
 */
router.get('/:id/timeslots', async (req, res) => {
  try {
    const { date } = req.query;
    const where: any = {
      clinicId: req.params.id,
      isAvailable: true,
    };

    if (date) {
      const targetDate = new Date(date as string);
      where.date = {
        gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        lt: new Date(targetDate.setHours(23, 59, 59, 999)),
      };
    } else {
      where.date = {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      };
    }

    const timeSlots = await prisma.timeSlot.findMany({
      where,
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
    });

    res.json({
      success: true,
      timeSlots,
    });
  } catch (error: any) {
    console.error('Get timeslots error:', error);
    res.status(500).json({ error: error.message || 'Failed to get time slots' });
  }
});

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default router;


