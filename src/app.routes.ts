import { Routes } from '@angular/router';
import { LoginComponent } from './app/login/login.component';
import { DashboardComponent } from './app/dashboard/dashboard.component';
import { DashboardHomeComponent } from './app/dashboard/home.component';
import { PropertiesComponent } from './app/properties/properties.component';
import { PnLComponent } from './app/pnl/pnl.component';
import { ChannelManagerComponent } from './app/channel-manager/channel-manager.component';
import { StaffComponent } from './app/staff/staff.component';
import { MultiCalendarComponent } from './app/multi-calendar/multi-calendar.component';
import { ClientsComponent } from './app/clients/clients.component';
import { SettingsComponent } from './app/settings/settings.component';
import { CommunicationsComponent } from './app/communications/communications.component';
import { ChannelSimulatorComponent } from './app/channel-simulator/channel-simulator.component';
import { SuperbaseComponent } from './app/superbase/superbase.component';
import { InventoryComponent } from './app/inventory/inventory.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    children: [
      { path: '', component: DashboardHomeComponent },
      { path: 'properties', component: PropertiesComponent },
      { path: 'calendar', component: MultiCalendarComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'communications', component: CommunicationsComponent },
      { path: 'channel-simulator', component: ChannelSimulatorComponent },
      { path: 'superbase', component: SuperbaseComponent },
      { path: 'inventory', component: InventoryComponent },
      { path: 'pnl', component: PnLComponent },
      { path: 'channel-manager', component: ChannelManagerComponent },
      { path: 'staff', component: StaffComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];