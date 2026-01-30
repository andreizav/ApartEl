import { Component, signal, computed, viewChild, ElementRef, AfterViewInit, OnDestroy, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioService } from '../shared/portfolio.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
})
export class DashboardHomeComponent implements AfterViewInit, OnDestroy {
  private portfolioService = inject(PortfolioService);

  filterMode = signal<'month' | 'year' | 'all'>('month');
  currentDate = signal(new Date());

  constructor() {
    effect(() => {
        this.filterMode();
        this.currentDate();
        this.portfolioService.transactions(); 
        this.scheduleRender();
    });
  }

  dateLabel = computed(() => {
    const date = this.currentDate();
    const mode = this.filterMode();
    if (mode === 'all') return 'All Time';
    if (mode === 'year') return date.getFullYear().toString();
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });
  
  kpis = computed(() => {
    const mode = this.filterMode();
    const current = this.currentDate();
    const txs = this.portfolioService.transactions();
    
    // Filter Transactions
    const filteredTxs = txs.filter(t => {
       const tDate = new Date(t.date);
       if (mode === 'all') return true;
       if (mode === 'year') return tDate.getFullYear() === current.getFullYear();
       return tDate.getFullYear() === current.getFullYear() && tDate.getMonth() === current.getMonth();
    });

    const revenue = filteredTxs
       .filter(t => t.type === 'income')
       .reduce((sum, t) => sum + this.portfolioService.convertAmount(t.amount, t.currency, 'USD'), 0);
    
    const bookings = this.portfolioService.bookings().filter(b => {
        const bDate = new Date(b.createdAt);
        if (mode === 'all') return true;
        if (mode === 'year') return bDate.getFullYear() === current.getFullYear();
        return bDate.getFullYear() === current.getFullYear() && bDate.getMonth() === current.getMonth();
    }).length;

    const changeMod = mode === 'month' ? 1 : 0.8; 

    return [
      { 
        title: 'Total Revenue', 
        value: '$' + revenue.toLocaleString(undefined, {maximumFractionDigits: 0}), 
        change: 12.5 * changeMod, 
        trend: 'up', 
        icon: 'payments', 
        color: 'text-green-500', 
        bg: 'bg-green-500/10' 
      },
      { 
        title: 'Occupancy Rate', 
        value: mode === 'month' ? '78%' : '72%', 
        change: 4.2 * changeMod, 
        trend: 'up', 
        icon: 'bed', 
        color: 'text-blue-500', 
        bg: 'bg-blue-500/10' 
      },
      { 
        title: 'Total Bookings', 
        value: bookings.toLocaleString(), 
        change: -1.5 * changeMod, 
        trend: 'down', 
        icon: 'calendar_month', 
        color: 'text-purple-500', 
        bg: 'bg-purple-500/10' 
      },
      { 
        title: 'Avg Rating', 
        value: '4.88', 
        change: 0.0, 
        trend: 'neutral', 
        icon: 'star', 
        color: 'text-yellow-500', 
        bg: 'bg-yellow-500/10' 
      },
    ];
  });

  todaysCheckIns = signal([
    { id: '1', guest: 'Alice Freeman', unit: 'Loft 101', time: '14:00', status: 'Pending', avatar: 'https://picsum.photos/seed/alice/50/50' },
    { id: '2', guest: 'Robert Fox', unit: 'River View A', time: '15:30', status: 'Confirmed', avatar: 'https://picsum.photos/seed/robert/50/50' },
    { id: '3', guest: 'Cody Fisher', unit: 'Studio 404', time: '16:00', status: 'Late', avatar: 'https://picsum.photos/seed/cody/50/50' },
  ]);

  todaysCheckOuts = signal([
    { id: '4', guest: 'Esther Howard', unit: 'Art Apt 1', time: '10:00', status: 'Completed', avatar: 'https://picsum.photos/seed/esther/50/50' },
    { id: '5', guest: 'Jenny Wilson', unit: 'Dragon Loft', time: '11:00', status: 'Pending', avatar: 'https://picsum.photos/seed/jenny/50/50' },
  ]);

  recentActivity = computed(() => {
    const bookings = this.portfolioService.bookings();
    const clients = this.portfolioService.clients();
    const portfolio = this.portfolioService.portfolio();

    const activities: any[] = [];
    const validSources = ['airbnb', 'booking', 'expedia'];
    const recentBookings = bookings.filter(b => validSources.includes(b.source));

    recentBookings.forEach(b => {
      let unitName = b.unitId;
      for (const g of portfolio) {
        const u = g.units.find(u => u.id === b.unitId);
        if (u) { unitName = u.name; break; }
      }

      activities.push({
        id: `act-b-${b.id}`,
        text: `New booking from ${this.capitalize(b.source)} for ${unitName}`,
        time: this.getRelativeTime(b.createdAt),
        rawTime: b.createdAt,
        type: 'booking'
      });
    });

    clients.forEach(c => {
      activities.push({
        id: `act-c-${c.phoneNumber}`,
        text: `New client registered: ${c.name}`,
        time: this.getRelativeTime(c.createdAt),
        rawTime: c.createdAt,
        type: 'client'
      });
    });

    return activities
      .sort((a, b) => b.rawTime.getTime() - a.rawTime.getTime())
      .slice(0, 10);
  });

  revenueChartRef = viewChild<ElementRef>('revenueChart');
  sourceChartRef = viewChild<ElementRef>('sourceChart');

  private resizeObserver: ResizeObserver | null = null;
  private renderTimeoutId: number | null = null;

  ngAfterViewInit() {
    this.scheduleRender();
    this.resizeObserver = new ResizeObserver(() => this.scheduleRender());
    const revEl = this.revenueChartRef()?.nativeElement;
    const srcEl = this.sourceChartRef()?.nativeElement;
    if (revEl) this.resizeObserver.observe(revEl);
    if (srcEl) this.resizeObserver.observe(srcEl);
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
    if (this.renderTimeoutId) clearTimeout(this.renderTimeoutId);
  }

  setFilterMode(mode: 'month' | 'year' | 'all') {
    this.filterMode.set(mode);
  }

  prevPeriod() {
    this.currentDate.update(d => {
      const newDate = new Date(d);
      if (this.filterMode() === 'year') newDate.setFullYear(d.getFullYear() - 1);
      else newDate.setMonth(d.getMonth() - 1);
      return newDate;
    });
  }

  nextPeriod() {
    this.currentDate.update(d => {
      const newDate = new Date(d);
      if (this.filterMode() === 'year') newDate.setFullYear(d.getFullYear() + 1);
      else newDate.setMonth(d.getMonth() + 1);
      return newDate;
    });
  }

  scheduleRender() {
    if (this.renderTimeoutId) clearTimeout(this.renderTimeoutId);
    this.renderTimeoutId = window.setTimeout(() => this.renderCharts(), 200);
  }

  renderCharts() {
    this.renderRevenueChart();
    this.renderSourceChart();
  }

  renderRevenueChart() {
    const el = this.revenueChartRef()?.nativeElement;
    if (!el) return;
    el.innerHTML = '';
    const width = el.clientWidth;
    const height = el.clientHeight || 300;
    if (width === 0 || height === 0) return;

    const margin = { top: 30, right: 20, bottom: 30, left: 40 };
    const svg = d3.select(el).append('svg').attr('width', '100%').attr('height', '100%').attr('viewBox', `0 0 ${width} ${height}`).attr('preserveAspectRatio', 'xMidYMid meet').style('display', 'block');

    const mode = this.filterMode();
    const current = this.currentDate();
    const txs = this.portfolioService.transactions();
    
    let data: { label: string, value: number }[] = [];

    if (mode === 'month') {
        data = [
            { label: 'Week 1', value: 0 },
            { label: 'Week 2', value: 0 },
            { label: 'Week 3', value: 0 },
            { label: 'Week 4', value: 0 },
        ];
        txs.forEach(t => {
            const d = new Date(t.date);
            if (t.type === 'income' && d.getMonth() === current.getMonth() && d.getFullYear() === current.getFullYear()) {
                const day = d.getDate();
                const weekIdx = Math.min(Math.floor((day - 1) / 7), 3);
                data[weekIdx].value += this.portfolioService.convertAmount(t.amount, t.currency, 'USD');
            }
        });
    } else if (mode === 'year') {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        data = months.map(m => ({ label: m, value: 0 }));
        txs.forEach(t => {
            const d = new Date(t.date);
            if (t.type === 'income' && d.getFullYear() === current.getFullYear()) {
                const mIdx = d.getMonth();
                data[mIdx].value += this.portfolioService.convertAmount(t.amount, t.currency, 'USD');
            }
        });
    } else {
        const yearMap = new Map<string, number>();
        txs.forEach(t => {
            if (t.type === 'income') {
                const y = new Date(t.date).getFullYear().toString();
                const val = this.portfolioService.convertAmount(t.amount, t.currency, 'USD');
                yearMap.set(y, (yearMap.get(y) || 0) + val);
            }
        });
        data = Array.from(yearMap.entries()).map(([k, v]) => ({ label: k, value: v })).sort((a,b) => a.label.localeCompare(b.label));
        if (data.length === 0) data = [{ label: current.getFullYear().toString(), value: 0 }];
    }

    const x = d3.scaleBand().domain(data.map(d => d.label)).range([margin.left, width - margin.right]).padding(0.4);
    const maxVal = d3.max(data, d => d.value) || 1000;
    const y = d3.scaleLinear().domain([0, maxVal * 1.1]).range([height - margin.bottom, margin.top]);

    svg.append('g').selectAll('rect').data(data).join('rect')
      .attr('x', d => x(d.label)!)
      .attr('y', d => y(d.value))
      .attr('height', d => y(0) - y(d.value))
      .attr('width', x.bandwidth())
      .attr('fill', '#3b82f6').attr('rx', mode === 'year' ? 2 : 6);

    svg.append('g').attr('transform', `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x).tickSize(0).tickPadding(10)).call(g => g.select('.domain').remove()).selectAll('text').style('fill', '#9ca3af').style('font-size', mode === 'year' ? '10px' : '12px').style('font-family', 'sans-serif').style('font-weight', '600');

    svg.append('g').selectAll('text').data(data).join('text')
        .text(d => d.value > 0 ? '$' + (d.value / 1000).toFixed(1) + 'k' : '')
        .attr('x', d => x(d.label)! + x.bandwidth() / 2)
        .attr('y', d => y(d.value) - 10)
        .attr('text-anchor', 'middle')
        .style('fill', '#6b7280').style('font-size', '11px').style('font-weight', 'bold').style('font-family', 'sans-serif');
  }

  renderSourceChart() {
    const el = this.sourceChartRef()?.nativeElement;
    if (!el) return;
    el.innerHTML = '';
    const width = el.clientWidth;
    const height = el.clientHeight || 200;
    if (width === 0 || height === 0) return;

    const radius = Math.min(width, height) / 2;
    const svg = d3.select(el).append('svg').attr('width', '100%').attr('height', '100%').attr('viewBox', `0 0 ${width} ${height}`).attr('preserveAspectRatio', 'xMidYMid meet').style('display', 'block').append('g').attr('transform', `translate(${width / 2},${height / 2})`);

    const data = [
      { label: 'Airbnb', value: 45, color: '#ff385c' },
      { label: 'Booking', value: 30, color: '#003580' },
      { label: 'Direct', value: 25, color: '#10b981' },
    ];

    const pie = d3.pie<any>().value(d => d.value).sort(null);
    const arc = d3.arc<any>().innerRadius(radius * 0.65).outerRadius(radius * 0.9);

    svg.selectAll('path').data(pie(data)).join('path').attr('d', arc).attr('fill', d => d.data.color).attr('stroke', 'white').style('stroke-width', '3px').style('transition', 'opacity 0.2s')
      .on('mouseover', function() { d3.select(this).style('opacity', 0.8); })
      .on('mouseout', function() { d3.select(this).style('opacity', 1); });

    svg.append('text').text('Source').attr('text-anchor', 'middle').attr('dy', '-0.5em').style('fill', '#9ca3af').style('font-size', '10px').style('font-weight', 'bold').style('text-transform', 'uppercase').style('font-family', 'sans-serif');
    svg.append('text').text('Mix').attr('text-anchor', 'middle').attr('dy', '0.8em').style('fill', '#111418').attr('class', 'dark:fill-white').style('font-size', '20px').style('font-weight', '800').style('font-family', 'sans-serif');
  }

  private capitalize(s: string) {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  private getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  }
}