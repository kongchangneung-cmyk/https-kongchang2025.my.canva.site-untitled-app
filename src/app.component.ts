import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AppointmentsComponent } from './components/appointments/appointments.component';
import { AdminComponent } from './components/admin/admin.component';
import { MapViewComponent } from './components/map-view/map-view.component';
import { AuditLogComponent } from './components/audit-log/audit-log.component';
import { DataAnalyticsComponent } from './components/data-analytics/data-analytics.component';
import { DataService } from './services/data.service';

type View = 'dashboard' | 'appointments' | 'map' | 'admin' | 'audit' | 'analytics';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    DashboardComponent,
    AppointmentsComponent,
    AdminComponent,
    MapViewComponent,
    AuditLogComponent,
    DataAnalyticsComponent
  ]
})
export class AppComponent {
  dataService = inject(DataService);
  currentView = signal<View>('dashboard');

  setView(view: View) {
    this.currentView.set(view);
  }
}
