import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service';

@Injectable()
export class TransactionsService {
    constructor(private prisma: PrismaService) { }

    async findAll(tenantId: string) {
        return this.prisma.transaction.findMany({
            where: { tenantId },
            orderBy: { date: 'desc' }
        });
    }

    async create(tenantId: string, tx: any) {
        return this.prisma.transaction.create({
            data: {
                id: tx.id || `tx-${Date.now()}`,
                tenantId,
                date: new Date(tx.date),
                property: tx.property ?? '',
                category: tx.category ?? '',
                subCategory: tx.subCategory ?? '',
                description: tx.description ?? '',
                amount: tx.amount ?? 0,
                currency: tx.currency ?? 'USD',
                type: tx.type ?? 'expense',
            }
        });
    }
}
