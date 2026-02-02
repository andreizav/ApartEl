import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../shared/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
    private readonly jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production';

    constructor(private prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : request.body?.token || request.query?.token;

        if (!token) {
            throw new UnauthorizedException('Token required');
        }

        try {
            const decoded: any = jwt.verify(token, this.jwtSecret);

            const user = await this.prisma.staff.findFirst({
                where: { id: decoded.userId, tenantId: decoded.tenantId }
            });

            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            const tenant = await this.prisma.tenant.findUnique({
                where: { id: decoded.tenantId }
            });

            // Parse tenant features
            const tenantWithFeatures = tenant ? {
                ...tenant,
                features: tenant.features ? JSON.parse(tenant.features) : {}
            } : null;

            request['user'] = user;
            request['tenant'] = tenantWithFeatures;
            request['userId'] = decoded.userId;
            request['tenantId'] = decoded.tenantId;

            return true;
        } catch (e) {
            if (e instanceof UnauthorizedException) throw e;
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
