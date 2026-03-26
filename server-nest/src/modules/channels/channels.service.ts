import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';

@Injectable()
export class ChannelsService {
    constructor(private prisma: PrismaService) { }

    async getMappings(tenantId: string) {
        // Get all mappings for this tenant's units directly to avoid nested object loading in memory
        return this.prisma.channelMapping.findMany({
            where: { unit: { group: { tenantId } } }
        });
    }

    async updateMappings(tenantId: string, list: any[]) {
        if (!Array.isArray(list)) throw new BadRequestException('channelMappings must be an array');

        const upsertPromises = list.map(mapping =>
            this.prisma.channelMapping.upsert({
                where: { id: mapping.id },
                update: {
                    unitName: mapping.unitName,
                    groupName: mapping.groupName,
                    airbnbId: mapping.airbnbId,
                    bookingId: mapping.bookingId,
                    markup: mapping.markup,
                    isMapped: mapping.isMapped,
                    status: mapping.status
                },
                create: {
                    id: mapping.id,
                    unitId: mapping.unitId,
                    unitName: mapping.unitName,
                    groupName: mapping.groupName,
                    airbnbId: mapping.airbnbId ?? '',
                    bookingId: mapping.bookingId ?? '',
                    markup: mapping.markup ?? 0,
                    isMapped: mapping.isMapped ?? false,
                    status: mapping.status ?? 'Inactive'
                }
            })
        );

        await this.prisma.$transaction(upsertPromises);

        return this.getMappings(tenantId);
    }

    async getIcal(tenantId: string) {
        // Get all iCal connections for this tenant's units directly to avoid nested object loading in memory
        return this.prisma.icalConnection.findMany({
            where: { unit: { group: { tenantId } } }
        });
    }

    async updateIcal(tenantId: string, list: any[]) {
        if (!Array.isArray(list)) throw new BadRequestException('icalConnections must be an array');

        const upsertPromises = list.map(conn =>
            this.prisma.icalConnection.upsert({
                where: { id: conn.id },
                update: {
                    unitName: conn.unitName,
                    importUrl: conn.importUrl,
                    exportUrl: conn.exportUrl,
                    lastSync: conn.lastSync
                },
                create: {
                    id: conn.id,
                    unitId: conn.unitId,
                    unitName: conn.unitName,
                    importUrl: conn.importUrl ?? '',
                    exportUrl: conn.exportUrl ?? '',
                    lastSync: conn.lastSync ?? 'Never'
                }
            })
        );

        await this.prisma.$transaction(upsertPromises);

        return this.getIcal(tenantId);
    }

    async getOta(tenantId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId }
        });
        if (!tenant) throw new NotFoundException('Tenant not found');
        return tenant.otaConfigs ? JSON.parse(tenant.otaConfigs) : {};
    }

    async updateOta(tenantId: string, configs: any) {
        if (typeof configs !== 'object') throw new BadRequestException('otaConfigs must be an object');

        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId }
        });
        if (!tenant) throw new NotFoundException('Tenant not found');

        const currentConfigs = tenant.otaConfigs ? JSON.parse(tenant.otaConfigs) : {};
        const updatedConfigs = { ...currentConfigs, ...configs };

        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: { otaConfigs: JSON.stringify(updatedConfigs) }
        });

        return updatedConfigs;
    }

    async sync(tenantId: string) {
        const groups = await this.prisma.portfolioGroup.findMany({
            where: { tenantId },
            include: { units: true }
        });

        const allUnits: { unit: any; groupName: string }[] = [];
        groups.forEach(g => {
            g.units.forEach(u => allUnits.push({ unit: u, groupName: g.name }));
        });

        const currentMappings = await this.getMappings(tenantId);
        const currentIcals = await this.getIcal(tenantId);
        const updatedMappings: any[] = [];
        const updatedIcals: any[] = [];

        const operations: any[] = [];

        for (const { unit, groupName } of allUnits) {
            const existingMap = currentMappings.find((m: any) => m.unitId === unit.id);
            if (existingMap) {
                operations.push(this.prisma.channelMapping.update({
                    where: { id: existingMap.id },
                    data: { unitName: unit.name, groupName }
                }));
                updatedMappings.push({ ...existingMap, unitName: unit.name, groupName });
            } else {
                const newMappingData = {
                    id: `cm-${unit.id}`,
                    unitId: unit.id,
                    unitName: unit.name,
                    groupName,
                    airbnbId: '',
                    bookingId: '',
                    markup: 0,
                    isMapped: false,
                    status: 'Inactive'
                };
                operations.push(this.prisma.channelMapping.create({
                    data: newMappingData
                }));
                updatedMappings.push(newMappingData);
            }

            const existingIcal = currentIcals.find((i: any) => i.unitId === unit.id);
            if (existingIcal) {
                operations.push(this.prisma.icalConnection.update({
                    where: { id: existingIcal.id },
                    data: { unitName: unit.name }
                }));
                updatedIcals.push({ ...existingIcal, unitName: unit.name });
            } else {
                const newIcalData = {
                    id: `ical-${unit.id}`,
                    unitId: unit.id,
                    unitName: unit.name,
                    importUrl: '',
                    exportUrl: `https://api.apartel.app/cal/${tenantId}/${unit.id}.ics`,
                    lastSync: 'Never'
                };
                operations.push(this.prisma.icalConnection.create({
                    data: newIcalData
                }));
                updatedIcals.push(newIcalData);
            }
        }

        // Perform manual sync of content (update timestamps)
        console.log(`[Channels] Starting manual iCal sync for tenant ${tenantId}...`);
        for (const conn of updatedIcals) {
            if (conn.importUrl) {
                console.log(`[Channels] Syncing iCal for tenant ${tenantId}, unit ${conn.unitId} from ${conn.importUrl}`);
                // Mock sync: Just update timestamp
                const now = new Date().toISOString();
                operations.push(this.prisma.icalConnection.update({
                    where: { id: conn.id },
                    data: { lastSync: now }
                }));
                conn.lastSync = now;
            }
        }

        await this.prisma.$transaction(operations);

        return { channelMappings: updatedMappings, icalConnections: updatedIcals };
    }
}
