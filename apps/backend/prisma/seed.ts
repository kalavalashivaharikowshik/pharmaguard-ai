/**
 * Seeds demo organisations and one user per role.
 *
 *   npm run seed            (from apps/backend)
 *
 * Every demo account uses the password from SEED_PASSWORD (default Demo@1234).
 * Safe to run more than once: existing records are left as they are.
 */
import 'dotenv/config';
import { PrismaClient, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const PASSWORD = process.env.SEED_PASSWORD || 'Demo@1234';

const users: {
  email: string;
  fullName: string;
  role: UserRole;
  organizationName: string;
  phone: string;
  linkManufacturer?: boolean;
}[] = [
  { email: 'admin@pharmaguard.ai', fullName: 'Super Admin', role: 'SUPER_ADMIN', organizationName: 'PharmaGuard AI', phone: '+91 90000 00001' },
  { email: 'regulator@pharmaguard.ai', fullName: 'Drug Regulator', role: 'REGULATOR', organizationName: 'Central Drugs Standard Control Organisation', phone: '+91 90000 00002' },
  { email: 'manufacturer@pharmaguard.ai', fullName: 'Sun Life Pharma', role: 'MANUFACTURER', organizationName: 'Sun Life Pharmaceuticals', phone: '+91 90000 00003', linkManufacturer: true },
  { email: 'distributor@pharmaguard.ai', fullName: 'MedLine Distributors', role: 'DISTRIBUTOR', organizationName: 'MedLine Distributors Pvt Ltd', phone: '+91 90000 00004' },
  { email: 'pharmacy@pharmaguard.ai', fullName: 'Apollo Pharmacy Kukatpally', role: 'PHARMACY', organizationName: 'Apollo Pharmacy', phone: '+91 90000 00005' },
  { email: 'hospital@pharmaguard.ai', fullName: 'City Care Hospital', role: 'HOSPITAL', organizationName: 'City Care Hospital', phone: '+91 90000 00006' },
];

async function main() {
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

  const hash = await bcrypt.hash(PASSWORD, 10);

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
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
      },
    });
  }

  console.log(`Seeded ${users.length} demo users (password: ${PASSWORD}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
