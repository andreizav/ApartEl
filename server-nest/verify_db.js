const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const unit = await prisma.unit.findFirst();
        if (!unit) {
            console.log('No units found to update.');
            // Optionally create one if we have a tenant
            const tenant = await prisma.tenant.findFirst();
            if (tenant) {
                const group = await prisma.portfolioGroup.create({
                    data: {
                        id: 'test-group-' + Date.now(),
                        name: 'Test Group',
                        tenantId: tenant.id
                    }
                });
                const newUnit = await prisma.unit.create({
                    data: {
                        id: 'test-unit-' + Date.now(),
                        name: 'Test Unit',
                        status: 'Active',
                        groupId: group.id,
                        airbnbListingId: 'test-initial-id'
                    }
                });
                console.log('Created unit:', newUnit);
            }
        } else {
            console.log('Updating unit:', unit.id);
            const updated = await prisma.unit.update({
                where: { id: unit.id },
                data: { airbnbListingId: 'test-airbnb-id-verified' }
            });
            console.log('Updated unit:', updated);

            // Read it back to be sure
            const check = await prisma.unit.findUnique({ where: { id: unit.id } });
            if (check.airbnbListingId === 'test-airbnb-id-verified') {
                console.log('SUCCESS: airbnbListingId persisted!');
            } else {
                console.error('FAILURE: airbnbListingId NOT persisted!');
                process.exit(1);
            }
        }
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
