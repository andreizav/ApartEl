import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { ClientsModule } from './modules/clients/clients.module';
import { StaffModule } from './modules/staff/staff.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ChannelsModule } from './modules/channels/channels.module';
import { SettingsModule } from './modules/settings/settings.module';
import { MessagesModule } from './modules/messages/messages.module';
import { BootstrapModule } from './modules/bootstrap/bootstrap.module';

@Module({
  imports: [SharedModule, AuthModule, BookingsModule, TenantsModule, ClientsModule, StaffModule, PortfolioModule, TransactionsModule, InventoryModule, ChannelsModule, SettingsModule, MessagesModule, BootstrapModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
