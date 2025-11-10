// src/app/core/services/appointment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/enviroment';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  statusCode: number;
}

export interface TimeSlotResponse {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface BookAppointmentRequest {
  carId: string;
  userId: string;
  appointmentDate: string;
  appointmentTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string;
}

export interface AppointmentResponse {
  id: string;
  carId: string;
  userId: string;
  dealerId: string;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes: string;
  status: number;
  statusText: string;
}

export interface DealerScheduleRequest {
  dealerId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
}

export interface DealerScheduleResponse {
  id: string;
  dealerId: string;
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  // Lấy khung giờ có sẵn
  getAvailableTimeSlots(carId: string, date: string): Observable<TimeSlotResponse[]> {
    const params = new HttpParams()
      .set('carId', carId)
      .set('date', date);
    return this.http.get<TimeSlotResponse[]>(`${this.apiUrl}/available-slots`, { params });
  }

  // Đặt lịch hẹn
  bookAppointment(request: BookAppointmentRequest): Observable<AppointmentResponse> {
    return this.http.post<AppointmentResponse>(`${this.apiUrl}/book`, request);
  }

  // Lấy lịch hẹn của người dùng
  getUserAppointments(userId: string): Observable<AppointmentResponse[]> {
    return this.http.get<AppointmentResponse[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Hủy lịch hẹn
  cancelAppointment(appointmentId: string, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${appointmentId}/cancel`, null, {
      params: { userId }
    });
  }

  // Lấy lịch hẹn của đại lý
  getDealerAppointments(dealerId: string, date: string): Observable<AppointmentResponse[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<AppointmentResponse[]>(`${this.apiUrl}/dealer/${dealerId}/appointments`, { params });
  }

  // Xác nhận lịch hẹn
  confirmAppointment(appointmentId: string, dealerId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${appointmentId}/confirm`, null, {
      params: { dealerId }
    });
  }

  // Quản lý lịch làm việc
  getDealerSchedules(dealerId: string): Observable<DealerScheduleResponse[]> {
  return this.http.get<ApiResponse<DealerScheduleResponse[]>>(
    `${this.apiUrl}/dealer/${dealerId}/schedules`
  ).pipe(
    map(response => response.data || [])
  );
}

  getDealerScheduleByDay(dealerId: string, dayOfWeek: number): Observable<DealerScheduleResponse> {
    return this.http.get<DealerScheduleResponse>(`${this.apiUrl}/dealer/${dealerId}/schedules/${dayOfWeek}`);
  }

  createDealerSchedule(request: DealerScheduleRequest): Observable<DealerScheduleResponse> {
  return this.http.post<ApiResponse<DealerScheduleResponse>>(
    `${this.apiUrl}/dealer/schedules`, 
    request
  ).pipe(
    map(response => response.data)
  );
}

  updateDealerSchedule(scheduleId: string, request: DealerScheduleRequest): Observable<DealerScheduleResponse> {
  return this.http.put<ApiResponse<DealerScheduleResponse>>(
    `${this.apiUrl}/dealer/schedules/${scheduleId}`, 
    request
  ).pipe(
    map(response => response.data)
  );
}

  updateDealerSchedules(requests: DealerScheduleRequest[]): Observable<DealerScheduleResponse[]> {
  return this.http.put<ApiResponse<DealerScheduleResponse[]>>(
    `${this.apiUrl}/dealer/schedules/batch`, 
    requests
  ).pipe(
    map(response => response.data || [])
  );
}

  deleteDealerSchedule(scheduleId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/dealer/schedules/${scheduleId}`);
  }
}