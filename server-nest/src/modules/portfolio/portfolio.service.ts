import { BadRequestException, Injectable } from '@nestjs/common';
import { StoreService } from '../../shared/store.service';

@Injectable()
export class PortfolioService {
    constructor(private storeService: StoreService) { }

    findAll(tenantId: string) {
        const data = this.storeService.getTenantData(tenantId);
        return data.portfolio;
    }

    update(tenantId: string, portfolio: any[]) {
        if (!Array.isArray(portfolio)) throw new BadRequestException('portfolio must be an array');
        const data = this.storeService.getTenantData(tenantId);
        data.portfolio = portfolio;
        this.storeService.save();
        return data.portfolio;
    }

    removeUnit(tenantId: string, unitId: string) {
        const data = this.storeService.getTenantData(tenantId);
        data.portfolio = data.portfolio
            .map((g: any) => ({ ...g, units: g.units.filter((u: any) => u.id !== unitId) }))
            .filter((g: any) => g.units.length > 0 || !g.isMerge);

        data.bookings = data.bookings.filter((b: any) => b.unitId !== unitId);
        data.channelMappings = data.channelMappings.filter((m: any) => m.unitId !== unitId);
        data.icalConnections = data.icalConnections.filter((i: any) => i.unitId !== unitId);

        this.storeService.save();
        return { ok: true };
    }
}
