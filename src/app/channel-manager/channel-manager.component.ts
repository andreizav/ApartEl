
import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../shared/api.service';
import { PortfolioService, ChannelMapping, ICalConnection, OtaConfig } from '../shared/portfolio.service';

@Component({
  selector: 'app-channel-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './channel-manager.component.html',
})
export class ChannelManagerComponent implements OnInit {
  private apiService = inject(ApiService);
  private portfolioService = inject(PortfolioService);

  activeTab = signal<'api' | 'ical'>('api');
  isSyncing = signal(false);

  // Configuration Modal State
  configuringChannel = signal<'airbnb' | 'booking' | 'expedia' | null>(null);
  tempConfig = signal<OtaConfig>({ isEnabled: false });

  // Consuming Shared State
  otaConfigs = this.portfolioService.otaConfigs;
  mappings = this.portfolioService.channelMappings;
  icalConnections = this.portfolioService.icalConnections;

  // Stats computed from mappings/configs
  stats = computed(() => {
    const maps = this.mappings();
    return {
        airbnb: { connected: maps.filter(m => m.airbnbId && m.isMapped).length },
        booking: { connected: maps.filter(m => m.bookingId && m.isMapped).length },
        expedia: { connected: 0 }
    };
  });

  // Computed grouping
  groupedMappings = computed(() => {
    const groups: { [key: string]: ChannelMapping[] } = {};
    this.mappings().forEach(m => {
      if (!groups[m.groupName]) groups[m.groupName] = [];
      groups[m.groupName].push(m);
    });
    return Object.entries(groups);
  });

  ngOnInit() {
    this.apiService.syncChannels();
  }

  setActiveTab(tab: 'api' | 'ical') {
    this.activeTab.set(tab);
  }

  toggleMap(id: string) {
    this.mappings.update(items => items.map(item => {
      if (item.id === id) {
        return { ...item, isMapped: !item.isMapped, status: !item.isMapped ? 'Active' : 'Inactive' };
      }
      return item;
    }));
    this.apiService.updateChannelMappings(this.portfolioService.channelMappings());
  }

  forceSync() {
    this.isSyncing.set(true);
    // Sync Properties with Mappings & iCal
    this.apiService.syncChannels();
    
    setTimeout(() => {
      this.isSyncing.set(false);
      alert('Synchronization completed successfully across all channels and properties.');
    }, 2000);
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  // --- Configuration Modal Actions ---

  openConfig(channel: 'airbnb' | 'booking' | 'expedia') {
    this.configuringChannel.set(channel);
    this.tempConfig.set(JSON.parse(JSON.stringify(this.otaConfigs()[channel])));
  }

  saveConfig() {
    const channel = this.configuringChannel();
    if (channel) {
      this.otaConfigs.update(current => ({
        ...current,
        [channel]: this.tempConfig()
      }));
      this.apiService.updateOtaConfigs(this.portfolioService.otaConfigs());
    }
    this.closeConfig();
  }

  closeConfig() {
    this.configuringChannel.set(null);
  }

  updateTempConfig(field: keyof OtaConfig, value: any) {
    this.tempConfig.update(c => ({ ...c, [field]: value }));
  }
}
