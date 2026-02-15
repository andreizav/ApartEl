import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const unit = await prisma.unit.findFirst();
        if (!unit) {
            console.log('No units found, creating one...');
            // Create a dummy group and unit if needed
            const tenant = await prisma.tenant.findFirst();
            if (!tenant) throw new Error('No tenant found');

            await prisma.portfolioGroup.create({
                data: {
                    id: 'g1',
                    name: 'Test Group',
                    tenantId: tenant.id,
                    units: {
                        create: {
                            id: 'u1',
                            name: 'Test Unit',
                            status: 'Active',
                            airbnbListingId: 'test-airbnb-id'
                        }
                    }
                }
            });
            console.log('Created unit with airbnbListingId');
        } else {
            console.log('Updating unit:', unit.id);
            const updated = await prisma.unit.update({
                where: { id: unit.id },
                data: { airbnbListingId: 'test-airbnb-id-123' }
            });
            console.log('Updated unit:', updated);

            if (updated.airbnbListingId === 'test-airbnb-id-123') {
                console.log('SUCCESS: airbnbListingId persisted!');
            } else {
                console.error('FAILURE: airbnbListingId NOT persisted!');
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
