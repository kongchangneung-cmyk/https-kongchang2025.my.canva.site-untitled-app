export type ApplicationStatus = 'ยื่นเรื่องแล้ว' | 'กำลังตรวจสอบ' | 'อนุมัติ' | 'ปฏิเสธ';

export interface Application {
  id: string;
  buildingName: string;
  ownerName: string;
  address: string;
  submittedDate: Date;
  status: ApplicationStatus;
  coordinates: { lat: number; lng: number };
  completedDate?: Date;
  processingDays?: number;
}

export interface Appointment {
  id: string;
  applicationId: string;
  buildingName: string;
  appointmentDate: Date;
  inspectorName: string;
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  details: string;
}
