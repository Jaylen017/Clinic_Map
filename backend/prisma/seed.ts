import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 10)

  const patientUser = await prisma.user.upsert({
    where: { email: 'patient@example.com' },
    update: {},
    create: {
      email: 'patient@example.com',
      password: hashedPassword,
      name: 'John Patient',
      role: 'PATIENT',
    },
  })

  const clinicUser = await prisma.user.upsert({
    where: { email: 'clinic@example.com' },
    update: {},
    create: {
      email: 'clinic@example.com',
      password: hashedPassword,
      name: 'City Medical Center',
      role: 'CLINIC',
    },
  })

  // Create sample clinic (using real coordinates for New York City)
  const clinic = await prisma.clinic.upsert({
    where: { id: 'sample-clinic-1' },
    update: {},
    create: {
      id: 'sample-clinic-1',
      name: 'City Medical Center',
      address: '123 Main Street, New York, NY 10001, USA',
      latitude: 40.7128,
      longitude: -74.0060,
      phoneNumber: '+1-555-0123',
      email: 'info@citymedical.com',
      walkInStart: '09:00',
      walkInEnd: '17:00',
      isSearchable: true,
      userId: clinicUser.id,
    },
  })

  // Create sample time slots for the next 7 days
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const timeSlots = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)

    // Create slots from 9 AM to 5 PM, every hour
    for (let hour = 9; hour < 17; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`

      timeSlots.push({
        clinicId: clinic.id,
        date,
        startTime,
        endTime,
        isAvailable: true,
      })
    }
  }

  await prisma.timeSlot.createMany({
    data: timeSlots,
    skipDuplicates: true,
  })

  console.log('✅ Database seeded successfully!')
  console.log(`   - Created patient user: ${patientUser.email}`)
  console.log(`   - Created clinic user: ${clinicUser.email}`)
  console.log(`   - Created clinic: ${clinic.name}`)
  console.log(`   - Created ${timeSlots.length} time slots`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


