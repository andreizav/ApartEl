import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { SharedModule } from '../../shared/shared.module';

@Module({
    imports: [SharedModule],
    controllers: [InventoryController],
    providers: [InventoryService],
})
export class InventoryModule { }
