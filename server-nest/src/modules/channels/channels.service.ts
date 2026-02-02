import { BadRequestException, Injectable } from '@nestjs/common';
import { StoreService } from '../../shared/store.service';

@Injectable()
export class ChannelsService {
    constructor(private storeService: StoreService) { }

    getMappings(tenantId: string) {
        const data = this.storeService.getTenantData(tenantId);
        return data.channelMappings;
    }

    updateMappings(tenantId: string, list: any[]) {
        if (!Array.isArray(list)) throw new BadRequestException('channelMappings must be an array');
        const data = this.storeService.getTenantData(tenantId);
        data.channelMappings = list;
        this.storeService.save();
        return data.channelMappings;
    }

    getIcal(tenantId: string) {
        const data = this.storeService.getTenantData(tenantId);
        return data.icalConnections;
    }

    updateIcal(tenantId: string, list: any[]) {
        if (!Array.isArray(list)) throw new BadRequestException('icalConnections must be an array');
        const data = this.storeService.getTenantData(tenantId);
        data.icalConnections = list;
        this.storeService.save();
        return data.icalConnections;
    }

    getOta(tenantId: string) {
        const data = this.storeService.getTenantData(tenantId);
        return data.otaConfigs;
    }

    updateOta(tenantId: string, configs: any) {
        if (typeof configs !== 'object') throw new BadRequestException('otaConfigs must be an object');
        const data = this.storeService.getTenantData(tenantId);
        data.otaConfigs = { ...data.otaConfigs, ...configs };
        this.storeService.save();
        return data.otaConfigs;
    }

    sync(tenantId: string) {
        const data = this.storeService.getTenantData(tenantId);
        const portfolio = data.portfolio || [];
        const allUnits: any[] = [];
        portfolio.forEach((g: any) => {
            (g.units || []).forEach((u: any) => allUnits.push({ unit: u, groupName: g.name }));
        });

        const currentMappings = data.channelMappings || [];
        const currentIcals = data.icalConnections || [];
        const updatedMappings: any[] = [];
        const updatedIcals: any[] = [];

        allUnits.forEach(({ unit, groupName }) => {
            const existingMap = currentMappings.find((m: any) => m.unitId === unit.id);
            updatedMappings.push(
                existingMap
                    ? { ...existingMap, unitName: unit.name, groupName }
                    : { id: `cm-${unit.id}`, unitId: unit.id, unitName: unit.name, groupName, airbnbId: '', bookingId: '', markup: 0, isMapped: false, status: 'Inactive' }
            );

            const existingIcal = currentIcals.find((i: any) => i.unitId === unit.id);
            updatedIcals.push(
                existingIcal
                    ? { ...existingIcal, unitName: unit.name }
                    : { id: `ical-${unit.id}`, unitId: unit.id, unitName: unit.name, importUrl: '', exportUrl: `https://api.apartel.app/cal/${tenantId}/${unit.id}.ics`, lastSync: 'Never' }
            );
        });

        data.channelMappings = updatedMappings;
        data.icalConnections = updatedIcals;
        this.storeService.save();

        return { channelMappings: data.channelMappings, icalConnections: data.icalConnections };
    }
}
