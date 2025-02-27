import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.timeBlockout.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.availability.deleteMany({});
  await prisma.barbersOnServices.deleteMany({});
  await prisma.barber.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.admin.deleteMany({});
  await prisma.settings.deleteMany({});

  // Create admin
  const hashedPassword = await hash('admin123', 10);
  await prisma.admin.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
    },
  });

  // Create barbers
  const barber1 = await prisma.barber.create({
    data: {
      name: 'James Wilson',
      email: 'james@example.com',
      bio: 'Master barber with over 10 years of experience specializing in classic cuts and hot towel shaves.',
      imageUrl: '/images/barbers/james.jpg',
    },
  });

  const barber2 = await prisma.barber.create({
    data: {
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      bio: 'Expert in modern styling and beard shaping with a passion for precision cuts.',
      imageUrl: '/images/barbers/sarah.jpg',
    },
  });

  const barber3 = await prisma.barber.create({
    data: {
      name: 'Miguel Rodriguez',
      email: 'miguel@example.com',
      bio: 'Specialist in fades and creative designs. Miguel brings artistry to every haircut.',
      imageUrl: '/images/barbers/miguel.jpg',
    },
  });

  // Create services
  const service1 = await prisma.service.create({
    data: {
      name: 'Classic Haircut',
      description: 'Precision cut with attention to detail, includes hot towel and styling',
      price: 30.00,
      duration: 30,
      imageUrl: '/images/services/haircut.jpg',
    },
  });

  const service2 = await prisma.service.create({
    data: {
      name: 'Beard Trim',
      description: 'Shape and style your beard with precision tools and techniques',
      price: 20.00,
      duration: 20,
      imageUrl: '/images/services/beard.jpg',
    },
  });

  const service3 = await prisma.service.create({
    data: {
      name: 'Haircut & Beard Trim',
      description: 'Complete package for hair and beard styling',
      price: 45.00,
      duration: 45,
      imageUrl: '/images/services/haircut-beard.jpg',
    },
  });

  const service4 = await prisma.service.create({
    data: {
      name: 'Hot Towel Shave',
      description: 'Traditional straight razor shave with hot towel treatment',
      price: 35.00,
      duration: 30,
      imageUrl: '/images/services/shave.jpg',
    },
  });

  const service5 = await prisma.service.create({
    data: {
      name: 'Hair Styling',
      description: 'Professional styling with premium products',
      price: 25.00,
      duration: 20,
      imageUrl: '/images/services/styling.jpg',
    },
  });

  const service6 = await prisma.service.create({
    data: {
      name: 'Kids Haircut',
      description: 'Gentle haircuts for young gentlemen under 12',
      price: 25.00,
      duration: 30,
      imageUrl: '/images/services/kids.jpg',
    },
  });

  // Associate barbers with services
  await prisma.barbersOnServices.createMany({
    data: [
      { barberId: barber1.id, serviceId: service1.id },
      { barberId: barber1.id, serviceId: service2.id },
      { barberId: barber1.id, serviceId: service3.id },
      { barberId: barber1.id, serviceId: service4.id },
      { barberId: barber2.id, serviceId: service1.id },
      { barberId: barber2.id, serviceId: service2.id },
      { barberId: barber2.id, serviceId: service3.id },
      { barberId: barber2.id, serviceId: service5.id },
      { barberId: barber2.id, serviceId: service6.id },
      { barberId: barber3.id, serviceId: service1.id },
      { barberId: barber3.id, serviceId: service2.id },
      { barberId: barber3.id, serviceId: service3.id },
      { barberId: barber3.id, serviceId: service5.id },
    ],
  });

  // Create barber availability (standard work hours)
  // For James (Monday - Saturday)
  for (let day = 1; day <= 6; day++) {
    await prisma.availability.create({
      data: {
        barberId: barber1.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
      },
    });
  }

  // For Sarah (Tuesday - Saturday)
  for (let day = 2; day <= 6; day++) {
    await prisma.availability.create({
      data: {
        barberId: barber2.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
      },
    });
  }

  // For Miguel (Monday, Wednesday, Friday, Saturday)
  const miguelDays = [1, 3, 5, 6];
  for (const day of miguelDays) {
    await prisma.availability.create({
      data: {
        barberId: barber3.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
      },
    });
  }

  // Create sample time blockouts
  // James has a training session next week
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(9, 0, 0, 0); // 9 AM

  await prisma.timeBlockout.create({
    data: {
      barberId: barber1.id,
      startTime: nextWeek,
      endTime: new Date(nextWeek.getTime() + 3 * 60 * 60 * 1000), // 3 hours later
      reason: 'Training session',
    },
  });

  // Create shop settings
  await prisma.settings.create({
    data: {
      shopName: 'Premium Barber Shop',
      shopAddress: '123 Main Street, Anytown, USA 12345',
      shopPhone: '(555) 123-4567',
      shopEmail: 'info@premiumbarber.com',
      shopHoursStart: '09:00',
      shopHoursEnd: '17:00',
      timeSlotInterval: 30,
      minAdvanceBookingHours: 1,
      maxAdvanceBookingDays: 30,
      reminderHours: 24,
    },
  });

  console.log('Database has been seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });