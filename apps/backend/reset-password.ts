import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash(
    'Admin@123',
    10,
  );

  await prisma.user.update({
    where: {
      email:
        'admin@pharmaguard.ai',
    },
    data: {
      password: hash,
    },
  });

  console.log(
    'Password Reset Done',
  );
}

main();