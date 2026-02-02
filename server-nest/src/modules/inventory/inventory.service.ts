import { BadRequestException, Injectable } from '@nestjs/common';
import { StoreService } from '../../shared/store.service';

@Injectable()
export class InventoryService {
    constructor(private storeService: StoreService) { }

    findAll(tenantId: string) {
        const data = this.storeService.getTenantData(tenantId);
        return data.inventory;
    }

    update(tenantId: string, inventory: any[]) {
        if (!Array.isArray(inventory)) throw new BadRequestException('inventory must be an array');
        const data = this.storeService.getTenantData(tenantId);
        data.inventory = inventory;
        this.storeService.save();
        return data.inventory;
    }
}
