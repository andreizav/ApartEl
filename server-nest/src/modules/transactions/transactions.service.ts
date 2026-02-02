import { Injectable } from '@nestjs/common';
import { StoreService } from '../../shared/store.service';

@Injectable()
export class TransactionsService {
    constructor(private storeService: StoreService) { }

    findAll(tenantId: string) {
        const data = this.storeService.getTenantData(tenantId);
        return data.transactions;
    }

    create(tenantId: string, tx: any) {
        const data = this.storeService.getTenantData(tenantId);
        const newTx = {
            id: tx.id || `tx-${Date.now()}`,
            tenantId: tenantId,
            date: tx.date,
            property: tx.property ?? '',
            category: tx.category ?? '',
            subCategory: tx.subCategory ?? '',
            description: tx.description ?? '',
            amount: tx.amount ?? 0,
            currency: tx.currency ?? 'USD',
            type: tx.type ?? 'expense',
        };
        data.transactions.unshift(newTx);
        this.storeService.save();
        return newTx;
    }
}
