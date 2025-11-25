import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { emitTimeslotUpdate } from '../socket';

const router = Router();
const prisma = new PrismaClient();

const bookAppointmentSchema = z.object({
  userId: z.string().optional(), // Optional for guest bookings
  timeSlotId: z.string(),
  notes: z.string().optional(),
});

/**
 * POST /api/clinic/:id/book
 * Book an appointment
 */
router.post('/clinic/:id/book', async (req, res) => {
  try {
    const clinicId = req.params.id;
    const data = bookAppointmentSchema.parse(req.body);

    // Check if time slot exists and is available
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: data.timeSlotId },
      include: {
        clinic: true,
        booking: true,
      },
    });

    if (!timeSlot) {
      return res.status(404).json({ error: 'Time slot not found' });
    }

    if (timeSlot.clinicId !== clinicId) {
      return res.status(400).json({ error: 'Time slot does not belong to this clinic' });
    }

    if (!timeSlot.isAvailable || timeSlot.booking) {
      return res.status(400).json({ error: 'Time slot is no longer available' });
    }

    // Create or get user (for guest bookings)
    let userId = data.userId;
    if (!userId) {
      const guestUser = await prisma.user.create({
        data: {
          email: `guest_${Date.now()}@temp.com`,
          password: 'temp',
          role: 'PATIENT',
        },
      });
      userId = guestUser.id;
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId,
        clinicId,
        timeSlotId: data.timeSlotId,
        notes: data.notes,
        status: 'CONFIRMED',
      },
    });

    // Mark time slot as unavailable
    await prisma.timeSlot.update({
      where: { id: data.timeSlotId },
      data: { isAvailable: false },
    });

    // Emit real-time update via Socket.IO
    emitTimeslotUpdate(clinicId, {
      timeSlotId: data.timeSlotId,
      isAvailable: false,
      bookingId: booking.id,
    });

    res.status(201).json({
      success: true,
      booking: {
        id: booking.id,
        clinicId: booking.clinicId,
        timeSlotId: booking.timeSlotId,
        status: booking.status,
        createdAt: booking.createdAt,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Book appointment error:', error);
    res.status(500).json({ error: error.message || 'Failed to book appointment' });
  }
});

export default router;

