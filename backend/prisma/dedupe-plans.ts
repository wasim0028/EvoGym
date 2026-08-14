import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/* Removes duplicate membership plans created by the old seed script.
   Keeps the OLDEST row for each name and repoints any subscriptions and
   payments at it before deleting the extras — deleting a plan that still has
   rows referencing it would fail on the foreign key.

   Run this BEFORE `prisma migrate dev`, because the migration adds a unique
   constraint on name and would fail while duplicates exist.

     npx tsx prisma/dedupe-plans.ts
*/
async function main() {
  const plans = await prisma.membershipPlan.findMany({
    orderBy: { createdAt: 'asc' },
  });

  const keepByName = new Map<string, string>();
  const duplicates: { id: string; name: string }[] = [];

  for (const plan of plans) {
    if (keepByName.has(plan.name)) {
      duplicates.push({ id: plan.id, name: plan.name });
    } else {
      keepByName.set(plan.name, plan.id);
    }
  }

  if (duplicates.length === 0) {
    console.log(`No duplicates found (${plans.length} plans).`);
    return;
  }

  console.log(`Found ${duplicates.length} duplicate plan(s).`);

  for (const dup of duplicates) {
    const keepId = keepByName.get(dup.name)!;

    const subs = await prisma.subscription.updateMany({
      where: { planId: dup.id },
      data: { planId: keepId },
    });
    const pays = await prisma.payment.updateMany({
      where: { planId: dup.id },
      data: { planId: keepId },
    });

    await prisma.membershipPlan.delete({ where: { id: dup.id } });
    console.log(
      `  removed duplicate "${dup.name}" ` +
        `(moved ${subs.count} subscription(s), ${pays.count} payment(s))`,
    );
  }

  const remaining = await prisma.membershipPlan.count();
  console.log(`Done. ${remaining} plans remain.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
