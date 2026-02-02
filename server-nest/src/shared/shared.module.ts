import { Module, Global } from '@nestjs/common';
import { StoreService } from './store.service';
import { TelegramService } from './telegram.service';

@Global()
@Module({
    providers: [StoreService, TelegramService],
    exports: [StoreService, TelegramService],
})
export class SharedModule { }
