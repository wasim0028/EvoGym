import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PLANS = [
  { name: 'Monthly',   description: 'Full gym access, billed monthly',        price: 99900,  durationDays: 30 },
  { name: 'Quarterly', description: 'Full gym access, billed every 3 months', price: 269900, durationDays: 90 },
  { name: 'Annual',    description: 'Full gym access, billed yearly',         price: 999900, durationDays: 365 },
];

async function main() {
  // upsert, not createMany: running the seed twice must not create a second
  // "Monthly" plan. (createMany's skipDuplicates only skips rows that break a
  // unique constraint, so without @unique on name it silently duplicated.)
  for (const plan of PLANS) {
    await prisma.membershipPlan.upsert({
      where: { name: plan.name },
      update: {
        description: plan.description,
        price: plan.price,
        durationDays: plan.durationDays,
        isActive: true,
      },
      create: plan,
    });
  }

  const adminPassword = await bcrypt.hash('ChangeMe123!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@evogym.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@evogym.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const total = await prisma.membershipPlan.count();
  console.log(`Seed complete. ${total} membership plans in the database.`);
  console.log('Admin login: admin@evogym.com / ChangeMe123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
