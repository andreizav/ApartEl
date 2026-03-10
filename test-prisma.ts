import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const mappings = await prisma.channelMapping.findMany({
    where: {
      unit: {
        group: {
          tenantId: '123'
        }
      }
    }
  })
  console.log(mappings)
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
