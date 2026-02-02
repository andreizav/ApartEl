import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

// Use the same relative path as prisma.config.ts
// The path is relative to where the script is executed from (server-nest root)
const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" });

const prisma = new PrismaClient({ adapter });
const dataFile = path.join(process.cwd(), 'data.json');

async function main() {
    console.log('Reading data.json...');
    if (!fs.existsSync(dataFile)) {
        console.log('No data.json found, skipping seed.');
        return;
    }

    const raw = fs.readFileSync(dataFile, 'utf8');
    const data = JSON.parse(raw);

    console.log('Seeding tenants...');
    for (const t of data.tenants || []) {
        await prisma.tenant.upsert({
            where: { id: t.id },
            update: {},
            create: {
                id: t.id,
                name: t.name,
                plan: t.plan,
                status: t.status,
                maxUnits: t.maxUnits,
                features: JSON.stringify(t.features),
            },
        });

        // Load Tenant Data
        const tData = data.dataByTenant[t.id];
        if (tData) {
            // Update tenant settings if available in dataByTenant
            await prisma.tenant.update({
                where: { id: t.id },
                data: {
                    waStatus: tData.appSettings?.waStatus,
                    autoDraft: tData.appSettings?.autoDraft,
                    tgBotToken: tData.appSettings?.tgBotToken,
                    tgAdminGroupId: tData.appSettings?.tgAdminGroupId,
                    aiApiKey: tData.appSettings?.aiApiKey,
                    aiSystemPrompt: tData.appSettings?.aiSystemPrompt,
                    ragSensitivity: tData.appSettings?.ragSensitivity,
                    otaConfigs: JSON.stringify(tData.otaConfigs),
                }
            });

            // Portfolio
            for (const g of tData.portfolio || []) {
                await prisma.portfolioGroup.upsert({
                    where: { id: g.id },
                    update: {},
                    create: {
                        id: g.id,
                        tenantId: t.id,
                        name: g.name,
                        expanded: g.expanded,
                        isMerge: g.isMerge,
                    },
                });

                for (const u of g.units || []) {
                    await prisma.unit.upsert({
                        where: { id: u.id },
                        update: {},
                        create: {
                            id: u.id,
                            groupId: g.id,
                            name: u.name,
                            internalName: u.internalName,
                            officialAddress: u.officialAddress,
                            basePrice: u.basePrice,
                            cleaningFee: u.cleaningFee,
                            wifiSsid: u.wifiSsid,
                            wifiPassword: u.wifiPassword,
                            accessCodes: u.accessCodes,
                            status: u.status,
                            assignedCleanerId: u.assignedCleanerId,
                        },
                    });
                }
            }

            // Bookings
            for (const b of tData.bookings || []) {
                // Verify unit exists
                const unit = await prisma.unit.findUnique({ where: { id: b.unitId } });
                if (!unit) continue;

                await prisma.booking.upsert({
                    where: { id: b.id },
                    update: {},
                    create: {
                        id: b.id,
                        tenantId: t.id,
                        unitId: b.unitId,
                        guestName: b.guestName,
                        guestPhone: b.guestPhone,
                        startDate: new Date(b.startDate),
                        endDate: new Date(b.endDate),
                        source: b.source,
                        status: b.status,
                        price: b.price,
                        createdAt: new Date(b.createdAt),
                        assignedCleanerId: b.assignedCleanerId,
                    },
                });
            }

            // Clients
            for (const c of tData.clients || []) {
                let client: any = null;
                if (c.phoneNumber) {
                    client = await prisma.client.findFirst({ where: { tenantId: t.id, phoneNumber: c.phoneNumber } });
                }

                if (!client) {
                    client = await prisma.client.create({
                        data: {
                            tenantId: t.id,
                            phoneNumber: c.phoneNumber,
                            name: c.name,
                            email: c.email,
                            address: c.address,
                            country: c.country,
                            avatar: c.avatar,
                            platform: c.platform,
                            platformId: c.platformId,
                            status: c.status,
                            lastActive: c.lastActive ? new Date(c.lastActive) : null,
                            createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
                            unreadCount: c.unreadCount,
                            online: c.online,
                            previousBookings: c.previousBookings
                        }
                    });
                }

                // Messages
                for (const m of c.messages || []) {
                    await prisma.message.upsert({
                        where: { id: m.id },
                        update: {},
                        create: {
                            id: m.id,
                            clientId: client.id,
                            text: m.text,
                            sender: m.sender,
                            timestamp: new Date(m.timestamp),
                            platform: m.platform,
                            status: m.status,
                            attachment: m.attachment ? JSON.stringify(m.attachment) : null
                        }
                    });
                }
            }

            // Transactions
            for (const tx of tData.transactions || []) {
                await prisma.transaction.upsert({
                    where: { id: tx.id },
                    update: {},
                    create: {
                        id: tx.id,
                        tenantId: t.id,
                        date: new Date(tx.date),
                        property: tx.property,
                        category: tx.category,
                        subCategory: tx.subCategory,
                        description: tx.description,
                        amount: tx.amount,
                        currency: tx.currency,
                        type: tx.type
                    }
                });
            }

            // Inventory
            for (const ic of tData.inventory || []) {
                await prisma.inventoryCategory.upsert({
                    where: { id: ic.id },
                    update: {},
                    create: {
                        id: ic.id,
                        tenantId: t.id,
                        name: ic.name
                    }
                });

                for (const item of ic.items || []) {
                    await prisma.inventoryItem.upsert({
                        where: { id: item.id },
                        update: {},
                        create: {
                            id: item.id,
                            categoryId: ic.id,
                            name: item.name,
                            quantity: item.quantity
                        }
                    });
                }
            }

            // Channel Mappings
            for (const cm of tData.channelMappings || []) {
                // Check unit existence
                const unit = await prisma.unit.findUnique({ where: { id: cm.unitId } });
                if (!unit) continue;

                await prisma.channelMapping.upsert({
                    where: { id: cm.id },
                    update: {},
                    create: {
                        id: cm.id,
                        unitId: cm.unitId,
                        unitName: cm.unitName,
                        groupName: cm.groupName,
                        airbnbId: cm.airbnbId,
                        bookingId: cm.bookingId,
                        markup: cm.markup,
                        isMapped: cm.isMapped,
                        status: cm.status
                    }
                });
            }

            // Ical Connections
            for (const ic of tData.icalConnections || []) {
                const unit = await prisma.unit.findUnique({ where: { id: ic.unitId } });
                if (!unit) continue;

                await prisma.icalConnection.upsert({
                    where: { id: ic.id },
                    update: {},
                    create: {
                        id: ic.id,
                        unitId: ic.unitId,
                        unitName: ic.unitName,
                        importUrl: ic.importUrl,
                        exportUrl: ic.exportUrl,
                        lastSync: ic.lastSync
                    }
                });
            }

        }
    }

    console.log('Seeding staff...');
    for (const s of data.staff || []) {
        await prisma.staff.upsert({
            where: { id: s.id },
            update: {},
            create: {
                id: s.id,
                tenantId: s.tenantId,
                name: s.name,
                role: s.role,
                email: s.email,
                phone: s.phone,
                avatar: s.avatar,
                status: s.status,
                unreadCount: s.unreadCount,
                online: s.online,
                lastActive: s.lastActive ? new Date(s.lastActive) : null,
            },
        });
    }

    console.log('Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
