
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-log.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditLogComponent {
  private dataService = inject(DataService);
  auditLog = this.dataService.auditLog$;

  getFormattedTimestamp(date: Date): string {
    return formatDate(date, 'd MMM yyyy, HH:mm:ss', 'th-TH');
  }
}
