import { Injectable, signal } from '@angular/core';
import { Application, Appointment, AuditEntry, ApplicationStatus } from '../models/app.models';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private nextId = 10;
  
  private applications = signal<Application[]>([
    { id: 'APP001', buildingName: 'อาคารสมาร์ทไลฟ์', ownerName: 'สมชาย ใจดี', address: '123 ถ.สุขุมวิท กรุงเทพฯ', submittedDate: new Date('2024-07-10'), status: 'อนุมัติ', coordinates: { lat: 13.7563, lng: 100.5018 }, completedDate: new Date('2024-07-15'), processingDays: 5 },
    { id: 'APP002', buildingName: 'คอนโดริมน้ำ', ownerName: 'สมหญิง มีสุข', address: '456 ถ.พระราม 4 กรุงเทพฯ', submittedDate: new Date('2024-07-12'), status: 'กำลังตรวจสอบ', coordinates: { lat: 13.7308, lng: 100.5232 } },
    { id: 'APP003', buildingName: 'โกดังสินค้าใหญ่', ownerName: 'วิชัย รุ่งเรือง', address: '789 ถ.บางนา-ตราด สมุทรปราการ', submittedDate: new Date('2024-07-15'), status: 'ยื่นเรื่องแล้ว', coordinates: { lat: 13.6685, lng: 100.6335 } },
    { id: 'APP004', buildingName: 'สำนักงานล้ำสมัย', ownerName: 'อารี แสงสว่าง', address: '101 ถ.สาทร กรุงเทพฯ', submittedDate: new Date('2024-07-18'), status: 'ปฏิเสธ', coordinates: { lat: 13.7218, lng: 100.5283 }, completedDate: new Date('2024-07-22'), processingDays: 4 },
    { id: 'APP005', buildingName: 'บ้านเดี่ยวในฝัน', ownerName: 'มานะ อดทน', address: '222 หมู่บ้านสุขใจ นนทบุรี', submittedDate: new Date('2024-07-20'), status: 'ยื่นเรื่องแล้ว', coordinates: { lat: 13.8569, lng: 100.4821 } }
  ]);
  
  private appointments = signal<Appointment[]>([
    { id: 'APT001', applicationId: 'APP001', buildingName: 'อาคารสมาร์ทไลฟ์', appointmentDate: new Date('2024-07-25T10:00:00'), inspectorName: 'เจ้าหน้าที่ ก.' },
    { id: 'APT002', applicationId: 'APP002', buildingName: 'คอนโดริมน้ำ', appointmentDate: new Date('2024-07-28T14:00:00'), inspectorName: 'เจ้าหน้าที่ ข.' },
  ]);

  private auditLog = signal<AuditEntry[]>([
    { id: 'LOG001', timestamp: new Date(), user: 'ระบบ', action: 'System Start', details: 'แพลตฟอร์มเริ่มทำงาน' }
  ]);
  
  private createAuditLog(user: string, action: string, details: string) {
    const newEntry: AuditEntry = {
      id: `LOG${Date.now()}`,
      timestamp: new Date(),
      user,
      action,
      details,
    };
    this.auditLog.update(log => [newEntry, ...log]);
  }

  // Public Signals for components to consume
  public applications$ = this.applications.asReadonly();
  public appointments$ = this.appointments.asReadonly();
  public auditLog$ = this.auditLog.asReadonly();

  constructor() {
    this.createAuditLog('ระบบ', 'ข้อมูลเริ่มต้น', 'โหลดข้อมูลตัวอย่างเรียบร้อย');
  }

  // Simulate async operations
  async addAppointment(appointmentData: { buildingName: string; appointmentDate: Date; applicantName: string }): Promise<Appointment> {
    return new Promise(resolve => {
      setTimeout(() => {
        const newAppointment: Appointment = {
          id: `APT${this.nextId++}`,
          applicationId: 'N/A',
          buildingName: appointmentData.buildingName,
          appointmentDate: appointmentData.appointmentDate,
          inspectorName: 'รอการจัดสรร',
        };
        this.appointments.update(appointments => [...appointments, newAppointment]);
        this.createAuditLog(appointmentData.applicantName, 'นัดหมายใหม่', `นัดหมายสำหรับอาคาร: ${appointmentData.buildingName}`);
        resolve(newAppointment);
      }, 500);
    });
  }

  async updateApplicationStatus(applicationId: string, status: ApplicationStatus): Promise<Application | undefined> {
     return new Promise(resolve => {
        setTimeout(() => {
            let updatedApp: Application | undefined;
            this.applications.update(apps => {
                return apps.map(app => {
                    if (app.id === applicationId) {
                        const isCompleted = status === 'อนุมัติ' || status === 'ปฏิเสธ';
                        updatedApp = { 
                            ...app, 
                            status,
                            completedDate: isCompleted ? new Date() : app.completedDate,
                            processingDays: isCompleted ? Math.ceil((new Date().getTime() - app.submittedDate.getTime()) / (1000 * 3600 * 24)) : app.processingDays
                        };
                        return updatedApp;
                    }
                    return app;
                });
            });
            if (updatedApp) {
                this.createAuditLog('เจ้าหน้าที่', 'อัปเดตสถานะ', `เปลี่ยนสถานะของ ${applicationId} เป็น ${status}`);
            }
            resolve(updatedApp);
        }, 300);
    });
  }
}
