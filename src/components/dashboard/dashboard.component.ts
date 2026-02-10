
import { Component, ChangeDetectionStrategy, inject, computed, ElementRef, viewChild, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private dataService = inject(DataService);
  private chartContainer = viewChild<ElementRef>('chartContainer');

  applications = this.dataService.applications$;
  
  totalApps = computed(() => this.applications().length);
  pendingApps = computed(() => this.applications().filter(a => a.status === 'กำลังตรวจสอบ' || a.status === 'ยื่นเรื่องแล้ว').length);
  approvedApps = computed(() => this.applications().filter(a => a.status === 'อนุมัติ').length);
  rejectedApps = computed(() => this.applications().filter(a => a.status === 'ปฏิเสธ').length);
  
  statusSummary = computed(() => {
      const counts = this.applications().reduce((acc, app) => {
          acc[app.status] = (acc[app.status] || 0) + 1;
          return acc;
      }, {} as Record<string, number>);

      return Object.entries(counts).map(([name, value]) => ({ name, value }));
  });


  constructor() {
    afterNextRender(() => {
        this.createChart();
    });
  }

  private createChart(): void {
    const data = this.statusSummary();
    const element = this.chartContainer()?.nativeElement;
    if (!element || !data.length) return;

    d3.select(element).select('svg').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, width])
      .padding(0.4);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 10])
      .nice()
      .range([height, 0]);

    svg.append('g')
      .attr('class', 'grid-lines')
      .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(() => ''))
      .selectAll('line')
      .attr('stroke', '#e5e7eb');

    const colorScale = d3.scaleOrdinal<string>()
        .domain(data.map(d => d.name))
        .range(['#fbbf24', '#3b82f6', '#22c55e', '#ef4444']);

    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.name)!)
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.value))
      .attr('fill', d => colorScale(d.name))
      .attr('rx', 4);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('font-size', '12px');

    svg.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .style('font-size', '12px');
  }
}
