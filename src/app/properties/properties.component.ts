import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import * as XLSX from 'xlsx';
import { ApiService } from '../shared/api.service';
import { PortfolioService, PropertyGroup, PropertyUnit, Booking } from '../shared/portfolio.service';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './properties.component.html',
})
export class PropertiesComponent implements OnInit {
  private apiService = inject(ApiService);
  private portfolioService = inject(PortfolioService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  portfolio = this.portfolioService.portfolio;
  allBookings = this.portfolioService.bookings;
  tenant = this.portfolioService.tenant;

  importPreview = signal<PropertyGroup[] | null>(null);
  selectedUnitId = signal<string | null>('u1');
  activeTab = signal<string>('Basic Info');

  isNewModalOpen = signal(false);
  newEntryType = signal<'group' | 'unit'>('unit');
  newEntryName = signal('');
  newEntryGroupId = signal('');

  editForm = signal<PropertyUnit | null>(null);
  isSaving = signal(false);

  tabs = ['Basic Info', 'Guest History', 'Photos', 'Inventory', 'Settings'];

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const unitId = params['unitId'] || this.selectedUnitId();
      if (unitId) {
        const exists = this.portfolio().some(g => g.units.some(u => u.id === unitId));
        if (exists) {
          this.selectUnit(unitId);
          this.portfolio.update(groups =>
            groups.map(g => {
              if (g.units.some(u => u.id === unitId)) {
                return { ...g, expanded: true };
              }
              return g;
            })
          );
        } else if (this.selectedUnitId()) {
          this.selectUnit(this.selectedUnitId()!);
        }
      } else if (this.selectedUnitId()) {
        this.selectUnit(this.selectedUnitId()!);
      }
    });
  }

  selectedUnit = computed(() => {
    const id = this.selectedUnitId();
    if (!id) return null;
    for (const group of this.portfolio()) {
      const unit = group.units.find(u => u.id === id);
      if (unit) return unit;
    }
    return null;
  });

  unitBookings = computed(() => {
    const uid = this.selectedUnitId();
    if (!uid) return [];
    return this.allBookings()
      .filter(b => b.unitId === uid)
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  });

  navigateToClient(booking: Booking) {
    if (booking.guestPhone) {
      this.router.navigate(['/dashboard/clients'], { queryParams: { phone: booking.guestPhone } });
    } else {
      alert('No phone number available for this booking.');
    }
  }

  toggleGroup(groupId: string) {
    this.portfolio.update(groups =>
      groups.map(g => g.id === groupId ? { ...g, expanded: !g.expanded } : g)
    );
  }

  deleteGroup(event: Event, groupId: string) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this group and all its units?')) {
      const groupToDelete = this.portfolio().find(g => g.id === groupId);
      const selectedId = this.selectedUnitId();

      this.portfolio.update(groups => groups.filter(g => g.id !== groupId));
      this.apiService.updatePortfolio(this.portfolioService.portfolio()).subscribe();
      if (selectedId && groupToDelete?.units.some(u => u.id === selectedId)) {
        this.selectedUnitId.set(null);
      }
    }
  }

  deleteCurrentUnit() {
    const unitId = this.selectedUnitId();
    const unitName = this.selectedUnit()?.name;
    if (!unitId) return;

    if (confirm(`Are you sure you want to delete "${unitName}"? This will also archive its future availability.`)) {
      this.apiService.deleteUnit(unitId);
      this.selectedUnitId.set(null);
    }
  }

  updateUnitStatus(unitId: string, status: 'Active' | 'Maintenance') {
    this.portfolio.update(groups =>
      groups.map(g => ({
        ...g,
        units: g.units.map(u => (u.id === unitId ? { ...u, status } : u))
      }))
    );
    this.apiService.updatePortfolio(this.portfolioService.portfolio()).subscribe();
  }

  removePreviewGroup(groupId: string) {
    this.importPreview.update(groups => {
      if (!groups) return null;
      return groups.filter(g => g.id !== groupId);
    });
    if (this.importPreview()?.length === 0) {
      this.importPreview.set(null);
    }
  }

  removePreviewUnit(groupId: string, unitId: string) {
    this.importPreview.update(groups => {
      if (!groups) return null;
      return groups.map(g => {
        if (g.id === groupId) {
          return { ...g, units: g.units.filter(u => u.id !== unitId) };
        }
        return g;
      }).filter(g => g.units.length > 0 || !g.isMerge);
    });

    if (this.importPreview()?.length === 0) {
      this.importPreview.set(null);
    }
  }

  selectUnit(unitId: string) {
    this.selectedUnitId.set(unitId);
    // Find unit directly to be safe and synchronous
    let foundUnit: PropertyUnit | null = null;
    for (const group of this.portfolio()) {
      const u = group.units.find(un => un.id === unitId);
      if (u) {
        foundUnit = u;
        break;
      }
    }
    if (foundUnit) {
      this.editForm.set({ ...foundUnit });
    }
  }

  saveUnitInfo() {
    const updatedUnit = this.editForm();
    if (!updatedUnit) return;

    this.isSaving.set(true);

    this.portfolio.update(groups => groups.map(g => ({
      ...g,
      units: g.units.map(u => u.id === updatedUnit.id ? { ...updatedUnit } : u)
    })));

    this.apiService.updatePortfolio(this.portfolio()).subscribe({
      next: (success) => {
        this.isSaving.set(false);
        if (!success) {
          alert('Failed to save changes.');
        }
      },
      error: () => {
        this.isSaving.set(false);
        alert('An error occurred while saving.');
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab.set(tab);
  }

  openNewModal() {
    // 1. Check Limits before opening
    const currentUnits = this.portfolio().reduce((acc, g) => acc + g.units.length, 0);
    const limit = this.tenant().maxUnits;

    if (currentUnits >= limit) {
      this.portfolioService.triggerUpgrade(`You have reached the limit of ${limit} unit(s) on your current plan.`);
      return;
    }

    this.newEntryName.set('');
    this.newEntryType.set('unit');
    const groups = this.portfolio();
    if (groups.length > 0) {
      this.newEntryGroupId.set(groups[0].id);
    }
    this.isNewModalOpen.set(true);
  }

  createEntry() {
    const name = this.newEntryName().trim();
    if (!name) return;

    if (this.newEntryType() === 'group') {
      const newGroup: PropertyGroup = {
        id: `g-new-${Date.now()}`,
        name: name,
        units: [],
        expanded: true
      };
      this.portfolio.update(p => [...p, newGroup]);
      this.apiService.updatePortfolio(this.portfolioService.portfolio()).subscribe();
    } else {
      const groupId = this.newEntryGroupId();
      if (!groupId) return;

      const newUnit: PropertyUnit = {
        id: `u-new-${Date.now()}`,
        name: name,
        internalName: name,
        officialAddress: '',
        basePrice: 0,
        cleaningFee: 0,
        wifiSsid: '',
        wifiPassword: '',
        accessCodes: '',
        status: 'Active'
      };

      this.portfolio.update(groups => groups.map(g => {
        if (g.id === groupId) {
          return { ...g, units: [...g.units, newUnit], expanded: true };
        }
        return g;
      }));
      this.apiService.updatePortfolio(this.portfolioService.portfolio()).subscribe();
      this.selectUnit(newUnit.id);
    }
    this.isNewModalOpen.set(false);
  }

  exportPortfolio() {
    const data: any[] = [];

    // Header Row
    data.push(['Group Name', 'Unit Name', 'Internal Name', 'Status']);

    // Data Rows
    for (const group of this.portfolio()) {
      // Add Group Row (Optional, or just list units with their group)
      if (group.units.length === 0) {
        data.push([group.name, '', '', '']);
      }

      for (const unit of group.units) {
        data.push([
          group.name,
          unit.name,
          unit.internalName || '',
          unit.status
        ]);
      }
    }

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Portfolio');

    XLSX.writeFile(wb, 'ApartEl_Portfolio.xlsx');
  }

  handleImport(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        if (jsonData && jsonData.length > 0) {
          this.parseExcelData(jsonData);
        }
      };
      reader.readAsArrayBuffer(file);
    }
    target.value = '';
  }

  private parseExcelData(rows: any[][]) {
    const rawGroups: PropertyGroup[] = [];
    let currentRawGroup: PropertyGroup | null = null;
    const startIndex = rows.length > 0 && typeof rows[0][1] === 'string' && rows[0][1].includes('Appartment') ? 1 : 0;

    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const groupName = row[1];
      const unitName = row[2];

      if (groupName && typeof groupName === 'string' && groupName.trim() !== '') {
        currentRawGroup = {
          id: `g-temp-${Date.now()}-${rawGroups.length}`,
          name: groupName.trim(),
          expanded: true,
          units: []
        };
        rawGroups.push(currentRawGroup);
      }

      if (unitName && typeof unitName === 'string' && unitName.trim() !== '') {
        if (!currentRawGroup) {
          currentRawGroup = {
            id: `g-temp-uncat-${Date.now()}`,
            name: 'Uncategorized Import',
            expanded: true,
            units: []
          };
          rawGroups.push(currentRawGroup);
        }

        const newUnit: PropertyUnit = {
          id: `u-imp-${Date.now()}-${currentRawGroup.units.length}-${Math.random().toString(36).substr(2, 5)}`,
          name: unitName.trim(),
          internalName: unitName.trim(),
          officialAddress: '',
          basePrice: 0,
          cleaningFee: 0,
          wifiSsid: '',
          wifiPassword: '',
          accessCodes: '',
          status: 'Active'
        };
        currentRawGroup.units.push(newUnit);
      }
    }

    const currentPortfolio = this.portfolio();
    const uniqueImport: PropertyGroup[] = [];

    rawGroups.forEach(importedGroup => {
      const existingGroup = currentPortfolio.find(g => g.name.toLowerCase() === importedGroup.name.toLowerCase());
      if (existingGroup) {
        const newUnits = importedGroup.units.filter(u =>
          !existingGroup.units.some(eu => eu.name.toLowerCase() === u.name.toLowerCase())
        );
        if (newUnits.length > 0) {
          uniqueImport.push({ ...importedGroup, id: existingGroup.id, units: newUnits, isMerge: true });
        }
      } else {
        if (importedGroup.units.length > 0) {
          uniqueImport.push({ ...importedGroup, isMerge: false });
        }
      }
    });

    if (uniqueImport.length > 0) {
      this.importPreview.set(uniqueImport);
    } else {
      alert('No new properties found in file.');
    }
  }

  confirmImport() {
    const dataToImport = this.importPreview();
    if (dataToImport) {
      // 1. Check Limits (Total units after import)
      const currentUnits = this.portfolio().reduce((acc, g) => acc + g.units.length, 0);
      const newUnitsCount = dataToImport.reduce((acc, g) => acc + g.units.length, 0);
      const limit = this.tenant().maxUnits;

      if (currentUnits + newUnitsCount > limit) {
        this.portfolioService.triggerUpgrade(`Importing these units would exceed your limit of ${limit} units. Please upgrade your plan.`);
        return;
      }

      this.portfolio.update(current => {
        const updatedPortfolio = [...current];
        dataToImport.forEach(importGroup => {
          if (importGroup.isMerge) {
            const index = updatedPortfolio.findIndex(g => g.id === importGroup.id);
            if (index !== -1) {
              updatedPortfolio[index] = {
                ...updatedPortfolio[index],
                units: [...updatedPortfolio[index].units, ...importGroup.units]
              };
            }
          } else {
            const newGroup = { ...importGroup, id: `g-${Date.now()}-${Math.random().toString(36).substr(2, 5)}` };
            updatedPortfolio.push(newGroup);
          }
        });
        return updatedPortfolio;
      });

      this.apiService.updatePortfolio(this.portfolioService.portfolio()).subscribe(success => {
        if (success) {
          alert('Properties imported and saved successfully!');
          if (dataToImport.length > 0 && dataToImport[0].units.length > 0) {
            this.selectedUnitId.set(dataToImport[0].units[0].id);
          }
          this.importPreview.set(null);
        } else {
          alert('Failed to save imported properties to the database. Please try again.');
        }
      });
    }
  }

  cancelImport() {
    this.importPreview.set(null);
  }
}