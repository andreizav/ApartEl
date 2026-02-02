import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { StoreService } from '../../shared/store.service';

@Injectable()
export class StaffService {
    constructor(private storeService: StoreService) { }

    findAll(tenantId: string) {
        const state = this.storeService.getState();
        return state!.staff.filter(s => s.tenantId === tenantId);
    }

    create(tenantId: string, member: any) {
        if (!member?.email) throw new ConflictException('email required');

        const state = this.storeService.getState();
        if (state!.staff.some(s => s.email.toLowerCase() === member.email.toLowerCase())) {
            throw new ConflictException('Staff with this email already exists');
        }

        const newMember = {
            id: member.id || `u-${Date.now()}`,
            tenantId,
            name: member.name ?? member.email.split('@')[0],
            role: member.role ?? 'Staff',
            email: member.email,
            phone: member.phone ?? '',
            avatar: member.avatar ?? `https://picsum.photos/seed/${Date.now()}/100/100`,
            status: member.status ?? 'Active',
            messages: member.messages ?? [],
            unreadCount: member.unreadCount ?? 0,
            online: false,
            lastActive: new Date().toISOString(),
        };

        state!.staff.push(newMember);
        this.storeService.save();
        return newMember;
    }

    update(tenantId: string, id: string, updates: any) {
        const state = this.storeService.getState();
        const idx = state!.staff.findIndex(s => s.id === id && s.tenantId === tenantId);

        if (idx < 0) throw new NotFoundException('Staff not found');

        const { id: _, tenantId: __, ...rest } = updates;
        state!.staff[idx] = { ...state!.staff[idx], ...rest };
        this.storeService.save();
        return state!.staff[idx];
    }

    remove(tenantId: string, id: string) {
        const state = this.storeService.getState();
        const idx = state!.staff.findIndex(s => s.id === id && s.tenantId === tenantId);

        if (idx < 0) throw new NotFoundException('Staff not found');

        state!.staff.splice(idx, 1);
        this.storeService.save();
        return { ok: true };
    }
}
