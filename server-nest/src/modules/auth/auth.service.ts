import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { StoreService } from '../../shared/store.service';
import { LoginDto } from './dto/login.dto';
import * as jwt from 'jsonwebtoken';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    private readonly jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production';

    constructor(private storeService: StoreService) { }

    private createToken(user: any) {
        return jwt.sign(
            { userId: user.id, tenantId: user.tenantId, email: user.email },
            this.jwtSecret,
            { expiresIn: '7d' }
        );
    }

    login(loginDto: LoginDto) {
        const { email } = loginDto;
        const state = this.storeService.getState();
        const user = state?.staff.find(s => s.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const token = this.createToken(user);
        const tenant = state?.tenants.find(t => t.id === user.tenantId);

        // Update last active
        user.lastActive = new Date().toISOString();
        user.online = true;
        this.storeService.save();

        return {
            success: true,
            token,
            user: { ...user },
            tenant: tenant || null
        };
    }

    register(registerDto: RegisterDto) {
        const { email, orgName } = registerDto;
        const state = this.storeService.getState();

        if (state?.staff.some(s => s.email.toLowerCase() === email.toLowerCase())) {
            throw new ConflictException('Email already registered');
        }

        const tenantId = `t-${Date.now()}`;
        const tenant = {
            id: tenantId,
            name: String(orgName),
            plan: 'Free',
            status: 'Active',
            maxUnits: 1,
            features: { staffBot: false, multiCalendar: true, reports: false },
        };

        const userId = `u-${Date.now()}`;
        const user = {
            id: userId,
            tenantId,
            name: String(email).split('@')[0],
            role: 'Manager',
            email: String(email),
            phone: '',
            avatar: `https://picsum.photos/seed/${userId}/100/100`,
            status: 'Active',
            messages: [],
            unreadCount: 0,
            online: true,
            lastActive: new Date().toISOString(),
        };

        state!.tenants.push(tenant);
        state!.staff.push(user);
        // Ensure tenant data structure exists
        this.storeService.getTenantData(tenantId);
        this.storeService.save();

        const token = this.createToken(user);

        return {
            success: true,
            token,
            user,
            tenant
        };
    }

    logout(userId: string) {
        const state = this.storeService.getState();
        const idx = state!.staff.findIndex(s => s.id === userId);
        if (idx >= 0) {
            state!.staff[idx].online = false;
            this.storeService.save();
        }
        return { success: true };
    }
}
