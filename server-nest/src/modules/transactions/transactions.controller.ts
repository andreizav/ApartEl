import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from '../auth/auth.guard';
import { TenantId } from '../auth/user.decorator';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Get()
    findAll(@TenantId() tenantId: string) {
        return this.transactionsService.findAll(tenantId);
    }

    @Post()
    create(@TenantId() tenantId: string, @Body() tx: any) {
        return this.transactionsService.create(tenantId, tx);
    }
}
