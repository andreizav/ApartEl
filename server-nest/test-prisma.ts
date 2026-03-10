import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const dbUrl = "file:./prisma/dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter })

async function testPerformance() {
  console.log('Testing old way...')
  const tenantId = 'test-tenant'

  const startOld = Date.now()
  const groups = await prisma.portfolioGroup.findMany({
      where: { tenantId },
      include: { units: { include: { icalConnections: true } } }
  });

  const icalsOld: any[] = [];
  groups.forEach(g => {
      g.units.forEach(u => {
          u.icalConnections.forEach(m => icalsOld.push(m));
      });
  });
  const timeOld = Date.now() - startOld
  console.log(`Old way icals: ${icalsOld.length}, time: ${timeOld}ms`)

  console.log('Testing new way...')
  const startNew = Date.now()
  const icalsNew = await prisma.icalConnection.findMany({
    where: {
      unit: {
        group: {
          tenantId
        }
      }
    }
  })
  const timeNew = Date.now() - startNew
  console.log(`New way icals: ${icalsNew.length}, time: ${timeNew}ms`)
}

testPerformance().catch(e => console.error(e)).finally(() => prisma.$disconnect())
