import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const PASSWORD = () => process.env.SEED_PASSWORD || 'Demo@1234';

const users: {
  email: string;
  fullName: string;
  role: UserRole;
  organizationName: string;
  phone: string;
  city: string;
  latitude: number;
  longitude: number;
  linkManufacturer?: boolean;
}[] = [
  { email: 'admin@pharmaguard.ai', fullName: 'Super Admin', role: 'SUPER_ADMIN', organizationName: 'PharmaGuard AI', phone: '+91 90000 00001', city: 'Hyderabad', latitude: 17.4435, longitude: 78.3772 },
  { email: 'regulator@pharmaguard.ai', fullName: 'Drug Regulator', role: 'REGULATOR', organizationName: 'Central Drugs Standard Control Organisation', phone: '+91 90000 00002', city: 'New Delhi', latitude: 28.6139, longitude: 77.209 },
  { email: 'manufacturer@pharmaguard.ai', fullName: 'Sun Life Pharma', role: 'MANUFACTURER', organizationName: 'Sun Life Pharmaceuticals', phone: '+91 90000 00003', city: 'Hyderabad', latitude: 17.604, longitude: 78.556, linkManufacturer: true },
  { email: 'distributor@pharmaguard.ai', fullName: 'MedLine Distributors', role: 'DISTRIBUTOR', organizationName: 'MedLine Distributors Pvt Ltd', phone: '+91 90000 00004', city: 'Secunderabad', latitude: 17.4399, longitude: 78.4983 },
  { email: 'pharmacy@pharmaguard.ai', fullName: 'Apollo Pharmacy Kukatpally', role: 'PHARMACY', organizationName: 'Apollo Pharmacy', phone: '+91 90000 00005', city: 'Hyderabad', latitude: 17.4948, longitude: 78.3996 },
  { email: 'hospital@pharmaguard.ai', fullName: 'City Care Hospital', role: 'HOSPITAL', organizationName: 'City Care Hospital', phone: '+91 90000 00006', city: 'Vijayawada', latitude: 16.5062, longitude: 80.648 },
];

/** Creates the demo manufacturer and one user per role. Safe to run repeatedly. */
export async function seedDemoData(prisma: PrismaClient): Promise<number> {
  const manufacturer = await prisma.manufacturer.upsert({
    where: { licenseNumber: 'MFG-TS-2026-001' },
    update: {},
    create: {
      name: 'Sun Life Pharmaceuticals',
      licenseNumber: 'MFG-TS-2026-001',
      email: 'manufacturer@pharmaguard.ai',
      phone: '+91 90000 00003',
      address: 'Genome Valley, Hyderabad, Telangana',
    },
  });

  const hash = await bcrypt.hash(PASSWORD(), 10);

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { city: u.city, latitude: u.latitude, longitude: u.longitude },
      create: {
        email: u.email,
        password: hash,
        fullName: u.fullName,
        role: u.role,
        organizationName: u.organizationName,
        phone: u.phone,
        status: 'ACTIVE',
        isVerified: true,
        manufacturerId: u.linkManufacturer ? manufacturer.id : null,
        city: u.city,
        latitude: u.latitude,
        longitude: u.longitude,
      },
    });
  }

  return users.length;
}

