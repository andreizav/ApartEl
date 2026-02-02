import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { StoreService } from '../../shared/store.service';

@Injectable()
export class AuthGuard implements CanActivate {
    private readonly jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production';

    constructor(private storeService: StoreService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : request.body?.token || request.query?.token;

        if (!token) {
            throw new UnauthorizedException('Token required');
        }

        try {
            const decoded: any = jwt.verify(token, this.jwtSecret);
            const state = this.storeService.getState();

            const user = state?.staff.find(s => s.id === decoded.userId && s.tenantId === decoded.tenantId);
            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            const tenant = state?.tenants.find(t => t.id === decoded.tenantId);

            request['user'] = user;
            request['tenant'] = tenant; // Optional if you want tenant in request
            request['userId'] = decoded.userId; // Convenience
            request['tenantId'] = decoded.tenantId; // Convenience

            return true;
        } catch (e) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
