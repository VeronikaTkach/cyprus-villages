/**
 * bootstrap-admin — production-safe admin user setup
 *
 * Creates a SUPER_ADMIN user if one with the given email does not yet exist.
 * Safe to run multiple times: exits cleanly if the user is already present.
 * Does NOT touch any other tables.
 *
 * Required env vars:
 *   ADMIN_EMAIL     — admin login email
 *   ADMIN_PASSWORD  — plain-text password (hashed here before storing)
 *
 * Run via:  pnpm db:bootstrap-admin
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/cyprus_villages',
});

const prisma = new PrismaClient({ adapter });

async function bootstrapAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.',
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log(`Admin "${email}" already exists — nothing to do.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      name: 'Admin',
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log(`Admin "${email}" created.`);
}

bootstrapAdmin()
  .catch((error: unknown) => {
    console.error('Bootstrap failed:', error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
