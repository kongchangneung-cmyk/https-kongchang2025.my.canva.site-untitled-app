import { Component, ChangeDetectionStrategy, inject, afterNextRender, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import * as d3 from 'd3';
import { Application } from '../../models/app.models';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapViewComponent {
    dataService = inject(DataService);
    applications = this.dataService.applications$;
    private mapContainer = viewChild<ElementRef>('mapContainer');

    constructor() {
      afterNextRender(() => {
        this.createMap();
      });
    }

    private createMap(): void {
      const applications = this.applications();
      const element = this.mapContainer()?.nativeElement;

      if (!element || applications.length === 0) {
        return;
      }

      d3.select(element).select('svg').remove();
      d3.select(element).select('.tooltip').remove();

      const margin = { top: 10, right: 10, bottom: 10, left: 10 };
      const width = element.clientWidth - margin.left - margin.right;
      const height = element.clientHeight - margin.top - margin.bottom;

      const svg = d3.select(element)
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);
      
      svg.append('rect')
          .attr('width', width)
          .attr('height', height)
          .attr('fill', '#f3f4f6')
          .attr('rx', 8);

      const lngExtent = d3.extent(applications, d => d.coordinates.lng) as [number, number];
      const latExtent = d3.extent(applications, d => d.coordinates.lat) as [number, number];

      const lngPadding = (lngExtent[1] - lngExtent[0]) * 0.1 || 0.1;
      const latPadding = (latExtent[1] - latExtent[0]) * 0.1 || 0.1;

      const x = d3.scaleLinear()
          .domain([lngExtent[0] - lngPadding, lngExtent[1] + lngPadding])
          .range([0, width]);

      const y = d3.scaleLinear()
          .domain([latExtent[0] - latPadding, latExtent[1] + latPadding])
          .range([height, 0]);

      const colorScale = d3.scaleOrdinal<string>()
          .domain(['อนุมัติ', 'ปฏิเสธ', 'กำลังตรวจสอบ', 'ยื่นเรื่องแล้ว'])
          .range(['#22c55e', '#ef4444', '#3b82f6', '#f59e0b']);
      
      const tooltip = d3.select(element)
          .append('div')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.75)')
          .style('color', 'white')
          .style('padding', '6px 12px')
          .style('border-radius', '6px')
          .style('pointer-events', 'none')
          .style('opacity', 0)
          .style('transition', 'opacity 0.2s ease-in-out')
          .style('font-size', '12px');

      svg.selectAll('circle')
          .data(applications)
          .enter()
          .append('circle')
          .attr('cx', d => x(d.coordinates.lng))
          .attr('cy', d => y(d.coordinates.lat))
          .attr('r', 8)
          .attr('fill', d => colorScale(d.status))
          .attr('stroke', 'white')
          .attr('stroke-width', 2)
          .style('cursor', 'pointer')
          .style('transition', 'transform 0.2s ease')
          .on('mouseover', function(event, d: Application) {
              d3.select(this).raise().attr('transform', 'scale(1.5)');
              tooltip.transition().style('opacity', 1);
              tooltip.html(d.buildingName)
                  .style('left', `${x(d.coordinates.lng) + 20}px`)
                  .style('top', `${y(d.coordinates.lat) - 15}px`);
          })
          .on('mouseout', function() {
              d3.select(this).attr('transform', 'scale(1)');
              tooltip.transition().style('opacity', 0);
          })
          .on('click', function(event, d: Application) {
              // Clicking also shows tooltip via mouseover
              d3.selectAll('circle').attr('stroke-width', 2);
              d3.select(this).attr('stroke-width', 3).attr('stroke', 'black');
          });
    }
}
