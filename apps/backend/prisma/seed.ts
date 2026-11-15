/**
 * Seeds demo organisations and one user per role.
 *
 *   npm run seed            (from apps/backend)
 *
 * Every demo account uses the password from SEED_PASSWORD (default Demo@1234).
 * Safe to run more than once: existing records are left as they are.
 * In production set SEED_DEMO_DATA=true to run the same seed on start-up.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

import { seedDemoData } from '../src/database/demo-seed';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

seedDemoData(prisma)
  .then((n) => console.log(`Seeded ${n} demo users (password: ${process.env.SEED_PASSWORD || 'Demo@1234'}).`))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
