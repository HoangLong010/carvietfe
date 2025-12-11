// src/app/core/services/appointment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/enviroment';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  code: number;
  error_code: number;
  message: string;
  description: string;
  timestamp: number;
}

export interface TimeSlotResponse {
  startTime: string; // [hour, minute]
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
  appointmentDate: number[]; // [year, month, day]
  appointmentTime: number[]; // [hour, minute]
  durationMinutes: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes: string;
  status: number;
  statusText: string;
  carModel: string;
  carYear: number;
  carPrice: number;
  carImageUrl: string;
  dealerName: string;
  dealerAddress: string;
  dealerPhone: string;
}

export interface AppointmentStatistics {
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  total: number;
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

  // ===== API NGƯỜI DÙNG =====

  // Lấy khung giờ có sẵn - FIX: Unwrap ApiResponse
  // Trong appointment.service.ts
  getAllDealerAppointments(dealerId: string): Observable<AppointmentResponse[]> {
    return this.http.get<ApiResponse<AppointmentResponse[]>>(
      `${this.apiUrl}/dealer/${dealerId}/appointments/all`
    ).pipe(
      map(response => {
        // Chuyển đổi dữ liệu ngày và giờ từ array sang string
        return response.data.map(appointment => this.transformAppointmentData(appointment));
      })
    );
  }

  // Lấy thống kê lịch hẹn
  getAppointmentStatistics(dealerId: string): Observable<AppointmentStatistics> {
    return this.http.get<ApiResponse<AppointmentStatistics>>(
      `${this.apiUrl}/dealer/${dealerId}/statistics`
    ).pipe(
      map(response => response.data)
    );
  }
  // Lấy lịch hẹn của dealer theo trạng thái
  getDealerAppointmentsByStatus(dealerId: string, status: number): Observable<AppointmentResponse[]> {
    let params = new HttpParams().set('status', status.toString());
    return this.http.get<ApiResponse<AppointmentResponse[]>>(
      `${this.apiUrl}/dealer/${dealerId}/appointments/status`,
      { params }
    ).pipe(
      map(response => response.data.map(appointment => this.transformAppointmentData(appointment)))
    );
  }

  // Từ chối lịch hẹn
  rejectAppointment(appointmentId: string, dealerId: string, reason: string): Observable<any> {
    let params = new HttpParams()
      .set('dealerId', dealerId)
      .set('reason', reason);

    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/${appointmentId}/reject`,
      {},
      { params }
    ).pipe(
      map(response => response.data)
    );
  }

  // Hoàn thành lịch hẹn
  completeAppointment(appointmentId: string, dealerId: string): Observable<any> {
    let params = new HttpParams().set('dealerId', dealerId);
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/${appointmentId}/complete`,
      {},
      { params }
    ).pipe(
      map(response => response.data)
    );
  }

  getAvailableTimeSlots(carId: string, date: string): Observable<TimeSlotResponse[]> {
    return this.http.get<any>(`${this.apiUrl}/available-slots`, {
      params: { carId, date }
    }).pipe(
      map(response => {
        // Convert từ number[] sang string
        return response.data.map((slot: any) => ({
          ...slot,
          startTime: this.formatTimeArrayToString(slot.startTime),
          endTime: this.formatTimeArrayToString(slot.endTime)
        }));
      })
    );
  }

  private transformAppointmentData(appointment: any): AppointmentResponse {
    // Chuyển đổi appointmentDate từ [2025, 11, 12] thành "2025-11-12"
    let appointmentDate = appointment.appointmentDate;
    if (Array.isArray(appointmentDate)) {
      const [year, month, day] = appointmentDate;
      appointmentDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }

    // Chuyển đổi appointmentTime từ [8, 0] thành "08:00"
    let appointmentTime = appointment.appointmentTime;
    if (Array.isArray(appointmentTime)) {
      const [hours, minutes] = appointmentTime;
      appointmentTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    return {
      ...appointment,
      appointmentDate,
      appointmentTime
    };
  }

  private formatTimeArrayToString(timeArray: any): string {
    if (Array.isArray(timeArray) && timeArray.length >= 2) {
      const hour = timeArray[0].toString().padStart(2, '0');
      const minute = timeArray[1].toString().padStart(2, '0');
      return `${hour}:${minute}`;
    }
    return timeArray || ''; // Trả về nguyên gốc nếu nó đã là string
  }

  // Đặt lịch hẹn - FIX: Unwrap ApiResponse
  bookAppointment(request: BookAppointmentRequest): Observable<AppointmentResponse> {
    return this.http.post<ApiResponse<AppointmentResponse>>(
      `${this.apiUrl}/book`,
      request
    ).pipe(
      map(response => response.data)
    );
  }

  // Lấy lịch hẹn của người dùng - FIX: Unwrap ApiResponse
  getUserAppointments(userId: string): Observable<AppointmentResponse[]> {
    return this.http.get<ApiResponse<AppointmentResponse[]>>(
      `${this.apiUrl}/user/${userId}`
    ).pipe(
      map(response => response.data || [])
    );
  }

  // Hủy lịch hẹn - FIX: Unwrap ApiResponse
  cancelAppointment(appointmentId: string, userId: string): Observable<string> {
    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/${appointmentId}/cancel`,
      null,
      { params: { userId } }
    ).pipe(
      map(response => response.data)
    );
  }

  // ===== API CỬA HÀNG =====

  // Lấy lịch hẹn của đại lý - FIX: Unwrap ApiResponse
  getDealerAppointments(dealerId: string, date: string): Observable<AppointmentResponse[]> {
    let params = new HttpParams().set('date', date);
    return this.http.get<ApiResponse<AppointmentResponse[]>>(
      `${this.apiUrl}/dealer/${dealerId}/appointments`,
      { params }
    ).pipe(
      map(response => response.data.map(appointment => this.transformAppointmentData(appointment)))
    );
  }

  // Xác nhận lịch hẹn - FIX: Unwrap ApiResponse
  confirmAppointment(appointmentId: string, dealerId: string): Observable<any> {
    let params = new HttpParams().set('dealerId', dealerId);
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/${appointmentId}/confirm`,
      {},
      { params }
    ).pipe(
      map(response => response.data)
    );
  }

  // ===== QUẢN LÝ LỊCH LÀM VIỆC =====

  getDealerSchedules(dealerId: string): Observable<DealerScheduleResponse[]> {
    return this.http.get<ApiResponse<DealerScheduleResponse[]>>(
      `${this.apiUrl}/dealer/${dealerId}/schedules`
    ).pipe(
      map(response => {
        if (!response.data) return [];
        // Map qua từng phần tử để convert time
        return response.data.map(schedule => ({
          ...schedule,
          startTime: this.formatTimeArrayToString(schedule.startTime),
          endTime: this.formatTimeArrayToString(schedule.endTime)
        }));
      })
    );
  }

  getDealerScheduleByDay(dealerId: string, dayOfWeek: number): Observable<DealerScheduleResponse> {
    return this.http.get<ApiResponse<DealerScheduleResponse>>(
      `${this.apiUrl}/dealer/${dealerId}/schedules/${dayOfWeek}`
    ).pipe(
      map(response => response.data)
    );
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
      map(response => {
        if (!response.data) return [];
        return response.data.map(schedule => ({
          ...schedule,
          startTime: this.formatTimeArrayToString(schedule.startTime),
          endTime: this.formatTimeArrayToString(schedule.endTime)
        }));
      })
    );
  }

  deleteDealerSchedule(scheduleId: string): Observable<string> {
    return this.http.delete<ApiResponse<string>>(
      `${this.apiUrl}/dealer/schedules/${scheduleId}`
    ).pipe(
      map(response => response.data)
    );
  }
}