import { Component, ChangeDetectionStrategy, inject, signal, computed, ElementRef, viewChild, effect } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { DataService } from '../../services/data.service';
import { ApplicationStatus } from '../../models/app.models';
import * as d3 from 'd3';

@Component({
  selector: 'app-data-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-analytics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataAnalyticsComponent {
  private dataService = inject(DataService);

  private donutChartContainer = viewChild<ElementRef>('donutChartContainer');
  private lineChartContainer = viewChild<ElementRef>('lineChartContainer');

  // Filter signals
  startDate = signal<string>('');
  endDate = signal<string>('');
  selectedStatus = signal<string>('all');

  // Reactive data filtering
  filteredApplications = computed(() => {
    const apps = this.dataService.applications$();
    const start = this.startDate() ? new Date(this.startDate()) : null;
    const end = this.endDate() ? new Date(this.endDate()) : null;
    const status = this.selectedStatus();

    if (start) start.setHours(0, 0, 0, 0);
    if (end) end.setHours(23, 59, 59, 999);

    return apps.filter(app => {
      const dateMatch = (!start || app.submittedDate >= start) && (!end || app.submittedDate <= end);
      const statusMatch = (status === 'all' || app.status === status);
      return dateMatch && statusMatch;
    });
  });

  // KPI computations
  totalFilteredApps = computed(() => this.filteredApplications().length);
  
  pendingFilteredApps = computed(() => 
    this.filteredApplications().filter(a => a.status === 'กำลังตรวจสอบ' || a.status === 'ยื่นเรื่องแล้ว').length
  );
  
  approvalRate = computed(() => {
    const completedApps = this.filteredApplications().filter(a => a.status === 'อนุมัติ' || a.status === 'ปฏิเสธ');
    if (completedApps.length === 0) return 0;
    const approvedCount = completedApps.filter(a => a.status === 'อนุมัติ').length;
    return (approvedCount / completedApps.length) * 100;
  });

  avgProcessingTime = computed(() => {
    const appsWithTime = this.filteredApplications().filter(a => typeof a.processingDays === 'number');
    if (appsWithTime.length === 0) return 0;
    const totalDays = appsWithTime.reduce((sum, a) => sum + a.processingDays!, 0);
    return totalDays / appsWithTime.length;
  });

  // Data for charts
  approvalRateData = computed(() => {
      const approved = this.filteredApplications().filter(a => a.status === 'อนุมัติ').length;
      const rejected = this.filteredApplications().filter(a => a.status === 'ปฏิเสธ').length;
      if (approved === 0 && rejected === 0) return [];
      return [{label: 'อนุมัติ', value: approved}, {label: 'ปฏิเสธ', value: rejected}];
  });

  applicationsOverTimeData = computed(() => {
    const grouped = d3.group(this.filteredApplications(), d => formatDate(d.submittedDate, 'MMM yyyy', 'en-US'));
    const data = Array.from(grouped, ([date, apps]) => ({ date: d3.timeParse('%b %Y')(date)!, value: apps.length }));
    return data.sort((a,b) => a.date.getTime() - b.date.getTime());
  });


  constructor() {
    effect(() => {
      this.createDonutChart();
      this.createLineChart();
    });
  }

  onFilterChange(event: Event, filterType: 'startDate' | 'endDate' | 'status') {
    const value = (event.target as HTMLInputElement).value;
    this[filterType].set(value);
  }

  private createDonutChart(): void {
    const data = this.approvalRateData();
    const element = this.donutChartContainer()?.nativeElement;
    if (!element) return;
    
    d3.select(element).select('svg').remove();

    if (data.length === 0) {
        d3.select(element).append('div')
            .attr('class', 'flex items-center justify-center h-full text-gray-500')
            .text('ไม่มีข้อมูลสำหรับแสดงผล');
        return;
    }

    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = 280 - margin.left - margin.right;
    const height = 280 - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${width / 2 + margin.left}, ${height / 2 + margin.top})`);
      
    const color = d3.scaleOrdinal<string>()
        .domain(data.map(d => d.label))
        .range(['#22c55e', '#ef4444']);

    const pie = d3.pie<{label: string, value: number}>().value(d => d.value).sort(null);
    const arc = d3.arc<any>().innerRadius(radius * 0.6).outerRadius(radius);

    svg.selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.label))
      .attr('stroke', 'white')
      .style('stroke-width', '2px');
  }

  private createLineChart(): void {
    const data = this.applicationsOverTimeData();
    const element = this.lineChartContainer()?.nativeElement;
     if (!element) return;

    d3.select(element).select('svg').remove();
    d3.select(element).select('div').remove();

     if (data.length < 2) {
        d3.select(element).append('div')
            .attr('class', 'flex items-center justify-center h-full text-gray-500')
            .text('ต้องการข้อมูลอย่างน้อย 2 จุดเพื่อวาดกราฟเส้น');
        return;
    }

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    
    const svg = d3.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
      
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 10])
      .nice()
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat('%b %y')));

    svg.append('g').call(d3.axisLeft(y));

    const line = d3.line<{date: Date, value: number}>()
        .x(d => x(d.date))
        .y(d => y(d.value))
        .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#4f46e5')
      .attr('stroke-width', 2.5)
      .attr('d', line);
  }
}
