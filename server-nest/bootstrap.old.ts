import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';

@Injectable()
export class BootstrapService {
    constructor(private prisma: PrismaService) { }

    async getBootstrapData(tenantId: string, user: any, tenant: any) {
        // Get portfolio with units
        const groups = await this.prisma.portfolioGroup.findMany({
            where: { tenantId },
            include: { units: true }
        });

        // Get bookings
        const bookings = await this.prisma.booking.findMany({
            where: { tenantId }
        });

        // Get clients with messages
        const clients = await this.prisma.client.findMany({
            where: { tenantId },
            include: { messages: true }
        });
        const clientsWithMessages = clients.map(c => ({
            ...c,
            messages: c.messages.map(m => ({
                ...m,
                attachment: m.attachment ? JSON.parse(m.attachment) : null
            }))
        }));

        // Get staff
        const staff = await this.prisma.staff.findMany({
            where: { tenantId }
        });

        // Get transactions
        const transactions = await this.prisma.transaction.findMany({
            where: { tenantId },
            orderBy: { date: 'desc' }
        });

        // Get inventory
        const inventory = await this.prisma.inventoryCategory.findMany({
            where: { tenantId },
            include: { items: true }
        });

        // Get channel mappings and ical connections from units
        const channelMappings: any[] = [];
        const icalConnections: any[] = [];

        for (const group of groups) {
            for (const unit of group.units) {
                const mappings = await this.prisma.channelMapping.findMany({
                    where: { unitId: unit.id }
                });
                channelMappings.push(...mappings);

                const icals = await this.prisma.icalConnection.findMany({
                    where: { unitId: unit.id }
                });
                icalConnections.push(...icals);
            }
        }

        // Get tenant settings
        const tenantData = await this.prisma.tenant.findUnique({
            where: { id: tenantId }
        });

        const storedOtaConfigs = tenantData?.otaConfigs ? JSON.parse(tenantData.otaConfigs) : {};
        const otaConfigs = {
            airbnb: { isEnabled: false },
            booking: { isEnabled: false },
            expedia: { isEnabled: false },
            ...storedOtaConfigs
        };
        const appSettings = {
            waStatus: tenantData?.waStatus ?? 'disconnected',
            autoDraft: tenantData?.autoDraft ?? true,
            tgBotToken: tenantData?.tgBotToken ?? '',
            tgAdminGroupId: tenantData?.tgAdminGroupId ?? '',
            aiApiKey: tenantData?.aiApiKey ?? '',
            aiSystemPrompt: tenantData?.aiSystemPrompt ?? 'You are a helpful property manager.',
            ragSensitivity: tenantData?.ragSensitivity ?? 0.7
        };

        return {
            user,
            tenant,
            portfolio: groups.map(g => ({
                ...g,
                units: g.units.map(u => ({
                    ...u,
                    photos: u.photos ? JSON.parse(u.photos) : []
                }))
            })),
            bookings,
            clients: clientsWithMessages,
            staff,
            transactions,
            inventory,
            channelMappings,
            icalConnections,
            otaConfigs,
            appSettings,
        };
    }

    async reset(tenantId: string, currentUserId?: string) {
        // 1. Clear everything (except current user if provided)
        await this.clearTenantData(tenantId, currentUserId);

        // 2. Seed with mock data
        await this.seedTenantData(tenantId);
