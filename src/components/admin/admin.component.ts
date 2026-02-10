
import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Application, ApplicationStatus } from '../../models/app.models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent {
  private dataService = inject(DataService);
  applications = this.dataService.applications$;

  sortedApplications = computed(() => {
    return [...this.applications()].sort((a, b) => b.submittedDate.getTime() - a.submittedDate.getTime());
  });

  async changeStatus(appId: string, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const newStatus = selectElement.value as ApplicationStatus;
    await this.dataService.updateApplicationStatus(appId, newStatus);
  }

  getFormattedDate(date: Date): string {
    return formatDate(date, 'd MMM yyyy', 'th-TH');
  }

  getStatusColor(status: ApplicationStatus): string {
    switch (status) {
      case 'อนุมัติ': return 'bg-green-100 text-green-800';
      case 'ปฏิเสธ': return 'bg-red-100 text-red-800';
      case 'กำลังตรวจสอบ': return 'bg-blue-100 text-blue-800';
      case 'ยื่นเรื่องแล้ว': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
