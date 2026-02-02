
import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortfolioService } from '../shared/portfolio.service';

@Component({
  selector: 'app-db-simulator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './db-simulator.component.html',
})
export class DbSimulatorComponent {
  private portfolioService = inject(PortfolioService);

  // Module State
  activeModule = signal<'database' | 'auth'>('database');

  // --- Database Module State ---
  activeView = signal<'table' | 'sql'>('table');
  activeTable = signal<string>('tenants');
  sqlQuery = signal('SELECT * FROM users WHERE tenant_id = \'t-001\'');
  sqlResult = signal<any[] | null>(null);


  // --- Auth Module State ---
  activeAuthSection = signal<'users' | 'policies'>('users');
  searchUserQuery = signal('');

  // Tables Mapping (Prisma Schema)
  tables = [
    { name: 'tenants', label: 'Prisma.Tenant', icon: 'domain' },
    { name: 'staff', label: 'Prisma.Staff', icon: 'shield_person' },
    { name: 'portfolio', label: 'Prisma.Unit', icon: 'apartment' },
    { name: 'bookings', label: 'Prisma.Booking', icon: 'book_online' },
    { name: 'transactions', label: 'Prisma.Transaction', icon: 'payments' },
    { name: 'clients', label: 'Prisma.Client', icon: 'groups' },
    { name: 'messages', label: 'Prisma.Message', icon: 'forum' },
    { name: 'inventory', label: 'Prisma.InventoryItem', icon: 'inventory_2' },
    { name: 'channels', label: 'Prisma.ChannelMapping', icon: 'hub' },
    { name: 'settings', label: 'Prisma.Tenant (Settings)', icon: 'settings' },
  ];

  // Computed Table Data
  tableData = computed(() => {
    const tenantId = this.portfolioService.tenant().id;
    switch (this.activeTable()) {
      case 'tenants':
        const t = this.portfolioService.tenant();
        return [{ id: t.id, name: t.name, plan: t.plan, status: t.status, maxUnits: t.maxUnits }];
      case 'bookings': return this.portfolioService.bookings().map(b => ({ ...b, tenantId: tenantId }));
      case 'staff':
        return this.portfolioService.staff().map(s => ({
          id: s.id,
          tenantId: tenantId,
          name: s.name,
          email: s.email,
          role: s.role,
          status: s.status,
          online: s.online,
          lastActive: s.lastActive
        }));
      case 'transactions': return this.portfolioService.transactions().map(t => ({ ...t, tenantId: tenantId }));
      case 'clients': return this.portfolioService.clients().map(c => ({
        id: c.id,
        tenantId: tenantId,
        phoneNumber: c.phoneNumber,
        name: c.name,
        email: c.email,
        platform: c.platform,
        status: c.status
      }));
      case 'messages':
        const allMsgs: any[] = [];
        this.portfolioService.clients().forEach(c => {
          c.messages.forEach(m => allMsgs.push({ ...m, clientId: c.id, clientPhone: c.phoneNumber }));
        });
        return allMsgs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      case 'portfolio':
        const flat: any[] = [];
        this.portfolioService.portfolio().forEach(g => {
          g.units.forEach(u => flat.push({ ...u, groupId: g.id, tenantId: tenantId }));
        });
        return flat;
      case 'inventory':
        const invItems: any[] = [];
        this.portfolioService.inventory().forEach(cat => {
          cat.items.forEach(i => invItems.push({ id: i.id, categoryId: cat.id, name: i.name, quantity: i.quantity }));
        });
        return invItems;
      case 'channels': return this.portfolioService.channelMappings().map(m => ({ ...m, unitId: m.unitId }));
      case 'settings':
        return [{ ...this.portfolioService.appSettings(), tenantId: tenantId }];
      default: return [];
    }
  });

  // Computed Auth Users (Simulated)
  authUsers = computed(() => {
    const staffUsers = this.portfolioService.staff().map(s => ({
      uid: s.id,
      email: s.email,
      phone: s.phone,
      provider: 'email',
      created_at: new Date('2023-01-15T09:00:00'),
      last_sign_in: s.lastActive,
      role: 'authenticated',
      app_metadata: { tenant_id: this.portfolioService.tenant().id, role: s.role === 'Manager' ? 'owner' : 'staff' }, // Multi-tenant metadata
      metadata: { name: s.name, avatar: s.avatar }
    }));

    const all = [...staffUsers];

    const q = this.searchUserQuery().toLowerCase();
    if (!q) return all;
    return all.filter(u =>
      u.email.toLowerCase().includes(q) ||
      (u.metadata.name as string).toLowerCase().includes(q)
    );
  });

  // Get headers from first item
  tableHeaders = computed(() => {
    const data = this.tableData();
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]).filter(k => typeof (data[0] as any)[k] !== 'object' || (data[0] as any)[k] instanceof Date);
  });

  constructor() {

  }

  // --- Actions ---

  setActiveTable(name: string) {
    this.activeTable.set(name);
    this.activeView.set('table');

  }

  runSql() {
    const query = this.sqlQuery().toLowerCase();

    // Destructive Commands Check
    if (query.includes('drop database') || query.includes('truncate')) {
      this.portfolioService.clearData().subscribe(() => {

        this.sqlResult.set([{ status: 'SUCCESS', message: 'Data cleared successfully.' }]);
      });
      return;
    }

    // Handle Selects
    let data: any[] = [];
    if (query.includes('inventory')) {
      this.portfolioService.inventory().forEach(cat => cat.items.forEach(i => data.push({ ...i, category: cat.name })));
    } else if (query.includes('settings')) {
      data = [this.portfolioService.appSettings()];
    } else {
      // Default fallback to current table data if parsing fails
      data = this.tableData();
    }

    if (query.includes('where')) data = data.slice(0, 1);

    this.sqlResult.set(data);

  }

  saveToDisk() {

    alert('Data is synced with the server.');
  }

  createMockData() {
    if (confirm('This will RESET all data to default demo values. Continue?')) {
      this.portfolioService.resetData().subscribe(() => {

      });
    }
  }

  deleteAllData() {
    if (confirm('This will DELETE ALL data. Continue?')) {
      this.portfolioService.clearData().subscribe(() => {

      });
    }
  }

  // --- Auth Actions ---

  inviteUser() {
    const email = prompt('Enter email address to invite:');
    if (email) {
      alert(`Invitation sent to ${email} (Simulated)`);

    }
  }

  sendMagicLink(email: string) {
    if (email === '-' || !email) return;
    alert(`Magic Link sent to ${email}`);

  }

  deleteUser(uid: string) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {

      alert('User deleted (Simulated)');
    }
  }

  // --- Helpers ---



  formatValue(val: any): string {
    if (val instanceof Date) return val.toLocaleDateString();
    return String(val);
  }
}
