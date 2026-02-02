import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { StoreService } from '../../shared/store.service';

@Injectable()
export class ClientsService {
    constructor(private storeService: StoreService) { }

    findAll(tenantId: string) {
        const data = this.storeService.getTenantData(tenantId);
        return data.clients;
    }

    create(tenantId: string, client: any) {
        if (!client?.phoneNumber) throw new ConflictException('phoneNumber required');

        const data = this.storeService.getTenantData(tenantId);
        if (data.clients.some((c: any) => c.phoneNumber === client.phoneNumber)) {
            throw new ConflictException('Client with this phone already exists');
        }

        data.clients.push(client);
        this.storeService.save();
        return client;
    }

    update(tenantId: string, phone: string, updates: any) {
        const decodedPhone = decodeURIComponent(phone);
        const data = this.storeService.getTenantData(tenantId);
        const idx = data.clients.findIndex((c: any) => c.phoneNumber === decodedPhone);

        if (idx < 0) throw new NotFoundException('Client not found');

        data.clients[idx] = { ...data.clients[idx], ...updates, phoneNumber: data.clients[idx].phoneNumber };
        this.storeService.save();
        return data.clients[idx];
    }

    remove(tenantId: string, phone: string) {
        const decodedPhone = decodeURIComponent(phone);
        const data = this.storeService.getTenantData(tenantId);
        const before = data.clients.length;
        data.clients = data.clients.filter((c: any) => c.phoneNumber !== decodedPhone);

        if (data.clients.length === before) throw new NotFoundException('Client not found');

        this.storeService.save();
        return { ok: true };
    }
}
