
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentsComponent {
  private dataService = inject(DataService);
  
  appointments = this.dataService.appointments$;
  isLoading = signal(false);
  showSuccess = signal(false);

  async scheduleAppointment(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const buildingName = formData.get('buildingName') as string;
    const applicantName = formData.get('applicantName') as string;
    const appointmentDateStr = formData.get('appointmentDate') as string;
    const appointmentTimeStr = formData.get('appointmentTime') as string;

    if (!buildingName || !applicantName || !appointmentDateStr || !appointmentTimeStr) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const appointmentDate = new Date(`${appointmentDateStr}T${appointmentTimeStr}`);

    this.isLoading.set(true);
    await this.dataService.addAppointment({ buildingName, applicantName, appointmentDate });
    this.isLoading.set(false);
    this.showSuccess.set(true);
    form.reset();
    setTimeout(() => this.showSuccess.set(false), 3000);
  }

  getFormattedDate(date: Date): string {
    return formatDate(date, 'd MMMM yyyy, HH:mm', 'th-TH');
  }

  getMinDate(): string {
    return formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
  }
}
