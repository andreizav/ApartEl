import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';

@Injectable()
export class PortfolioService {
    constructor(private prisma: PrismaService) { }

    async findAll(tenantId: string) {
        // Get all portfolio groups for this tenant with their units
        const groups = await this.prisma.portfolioGroup.findMany({
            where: { tenantId },
            include: { units: true }
        });
        return groups;
    }

    async update(tenantId: string, portfolio: any[]) {
        if (!Array.isArray(portfolio)) throw new BadRequestException('portfolio must be an array');

        // Delete existing groups and units for this tenant
        const existingGroups = await this.prisma.portfolioGroup.findMany({
            where: { tenantId },
            select: { id: true }
        });
        const groupIds = existingGroups.map(g => g.id);

        // Delete units first (foreign key constraint)
        await this.prisma.unit.deleteMany({
            where: { groupId: { in: groupIds } }
        });
        await this.prisma.portfolioGroup.deleteMany({
            where: { tenantId }
        });

        // Create new groups with units
        for (const group of portfolio) {
            await this.prisma.portfolioGroup.create({
                data: {
                    id: group.id,
                    tenantId,
                    name: group.name,
                    expanded: group.expanded ?? true,
                    isMerge: group.isMerge ?? false,
                    units: {
                        create: (group.units || []).map((u: any) => ({
                            id: u.id,
                            name: u.name,
                            internalName: u.internalName,
                            officialAddress: u.officialAddress,
                            basePrice: u.basePrice,
                            cleaningFee: u.cleaningFee,
                            wifiSsid: u.wifiSsid,
                            wifiPassword: u.wifiPassword,
                            accessCodes: u.accessCodes,
                            status: u.status ?? 'Active',
                            assignedCleanerId: u.assignedCleanerId
                        }))
                    }
                }
            });
        }

        return this.findAll(tenantId);
    }

    async removeUnit(tenantId: string, unitId: string) {
        // Verify the unit belongs to this tenant
        const unit = await this.prisma.unit.findUnique({
            where: { id: unitId },
            include: { group: true }
        });
        if (!unit || unit.group.tenantId !== tenantId) {
            throw new NotFoundException('Unit not found');
        }

        // Delete related records first
        await this.prisma.booking.deleteMany({ where: { unitId } });
        await this.prisma.channelMapping.deleteMany({ where: { unitId } });
        await this.prisma.icalConnection.deleteMany({ where: { unitId } });

        // Delete the unit
        await this.prisma.unit.delete({ where: { id: unitId } });

        // Delete empty merge groups
        const group = await this.prisma.portfolioGroup.findUnique({
            where: { id: unit.groupId },
            include: { units: true }
        });
        if (group && group.isMerge && group.units.length === 0) {
            await this.prisma.portfolioGroup.delete({ where: { id: group.id } });
        }

        return { ok: true };
    }
}
