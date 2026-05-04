const { PrismaClient } = require('@prisma/client');
const { performance } = require('perf_hooks');

const prisma = new PrismaClient();

async function testParallelQueries() {
  const tenantId = 't1';

  const start = performance.now();
  const [
    groups,
    bookings,
    clients,
    staff,
    transactions,
    inventory,
    tenantData
  ] = await Promise.all([
    prisma.portfolioGroup.findMany({
      where: { tenantId },
      include: { units: true }
    }),
    prisma.booking.findMany({
      where: { tenantId }
    }),
    prisma.client.findMany({
      where: { tenantId },
      include: { messages: true }
    }),
    prisma.staff.findMany({
      where: { tenantId }
    }),
    prisma.transaction.findMany({
      where: { tenantId },
      orderBy: { date: 'desc' }
    }),
    prisma.inventoryCategory.findMany({
      where: { tenantId },
      include: { items: true }
    }),
    prisma.tenant.findUnique({
      where: { id: tenantId }
    })
  ]);

  const unitIds = groups.flatMap(g => g.units.map(u => u.id));

  const [channelMappings, icalConnections] = await Promise.all([
    unitIds.length > 0 ? prisma.channelMapping.findMany({
        where: { unitId: { in: unitIds } }
    }) : [],
    unitIds.length > 0 ? prisma.icalConnection.findMany({
        where: { unitId: { in: unitIds } }
    }) : []
  ]);

  const end = performance.now();
  console.log(`Parallel query executed in: ${(end - start).toFixed(2)} ms`);
  console.log(`Units found: ${unitIds.length}`);
  console.log(`Channel Mappings: ${channelMappings.length}`);
}

testParallelQueries()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
