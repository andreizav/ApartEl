import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AuthGuard } from '../auth/auth.guard';
import { TenantId } from '../auth/user.decorator';

@Controller('inventory')
@UseGuards(AuthGuard)
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Get()
    findAll(@TenantId() tenantId: string) {
        return this.inventoryService.findAll(tenantId);
    }

    @Put()
    update(@TenantId() tenantId: string, @Body() inventory: any[]) {
        return this.inventoryService.update(tenantId, inventory);
    }
}
