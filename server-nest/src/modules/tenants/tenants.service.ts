import { Injectable, NotFoundException } from '@nestjs/common';
import { StoreService } from '../../shared/store.service';

@Injectable()
export class TenantsService {
    constructor(private storeService: StoreService) { }

    getTenant(tenantId: string) {
        const state = this.storeService.getState();
        const tenant = state?.tenants.find(t => t.id === tenantId);
        if (!tenant) throw new NotFoundException('Tenant not found');
        return tenant;
    }

    updateTenant(tenantId: string, updates: any) {
        const { plan, maxUnits, features } = updates;
        const state = this.storeService.getState();
        const idx = state!.tenants.findIndex(t => t.id === tenantId);

        if (idx < 0) throw new NotFoundException('Tenant not found');

        if (plan) state!.tenants[idx].plan = plan;
        if (typeof maxUnits === 'number') state!.tenants[idx].maxUnits = maxUnits;
        if (features && typeof features === 'object') {
            state!.tenants[idx].features = { ...state!.tenants[idx].features, ...features };
        }

        this.storeService.save();
        return state!.tenants[idx];
    }
}
