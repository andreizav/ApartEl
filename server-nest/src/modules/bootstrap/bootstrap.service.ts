import { Injectable } from '@nestjs/common';
import { StoreService } from '../../shared/store.service';

@Injectable()
export class BootstrapService {
    constructor(private storeService: StoreService) { }

    getBootstrapData(tenantId: string, user: any, tenant: any) {
        const data = this.storeService.getTenantData(tenantId);
        const state = this.storeService.getState();
        const staff = state!.staff.filter((s: any) => s.tenantId === tenantId);

        return {
            user,
            tenant,
            portfolio: data.portfolio,
            bookings: data.bookings,
            clients: data.clients,
            staff,
            transactions: data.transactions,
            inventory: data.inventory,
            channelMappings: data.channelMappings,
            icalConnections: data.icalConnections,
            otaConfigs: data.otaConfigs,
            appSettings: data.appSettings,
        };
    }

    reset(tenantId: string) {
        this.storeService.resetTenant(tenantId);
        return { success: true, message: 'Data reset to seed values' };
    }

    clear(tenantId: string) {
        this.storeService.clearTenant(tenantId);
        return { success: true, message: 'All data cleared' };
    }
}
