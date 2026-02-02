import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';

@Injectable()
export class InventoryService {
    constructor(private prisma: PrismaService) { }

    async findAll(tenantId: string) {
        const categories = await this.prisma.inventoryCategory.findMany({
            where: { tenantId },
            include: { items: true }
        });
        return categories;
    }

    async update(tenantId: string, inventory: any[]) {
        if (!Array.isArray(inventory)) throw new BadRequestException('inventory must be an array');

        // Delete existing categories and items for this tenant
        const existingCategories = await this.prisma.inventoryCategory.findMany({
            where: { tenantId },
            select: { id: true }
        });
        const categoryIds = existingCategories.map(c => c.id);

        await this.prisma.inventoryItem.deleteMany({
            where: { categoryId: { in: categoryIds } }
        });
        await this.prisma.inventoryCategory.deleteMany({
            where: { tenantId }
        });

        // Create new categories with items
        for (const category of inventory) {
            await this.prisma.inventoryCategory.create({
                data: {
                    id: category.id,
                    tenantId,
                    name: category.name,
                    items: {
                        create: (category.items || []).map((item: any) => ({
                            id: item.id,
                            name: item.name,
                            quantity: item.quantity ?? 0
                        }))
                    }
                }
            });
        }

        return this.findAll(tenantId);
    }
}
