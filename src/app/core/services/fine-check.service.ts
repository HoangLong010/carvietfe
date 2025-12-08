import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/enviroment';

export interface TrafficCheckRequest {
  plateNumber: string;
  plateColor?: string;
  vehicleType?: string;
  type?: number;
  registrationStamp?: string;
}

export interface ViolationDetail {
  date: string;
  time?: string;
  location: string;
  violation: string;
  amount: number;
  status?: string;
  imageUrl?: string;
  decisionNumber?: string;
}

export interface TrafficCheckResponse {
  plateNumber: string;
  hasFines: boolean;
  totalFines: number;
  totalAmount: number;
  lastUpdate: string;
  source: string;
  violations: ViolationDetail[];
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  code: number;
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FineCheckService {
  private apiUrl = `${environment.apiUrl}/traffic`; // Thay bằng URL thật

  constructor(private http: HttpClient) {}

  checkTrafficViolation(request: TrafficCheckRequest): Observable<ApiResponse<TrafficCheckResponse>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<ApiResponse<TrafficCheckResponse>>(
      `${this.apiUrl}/check`,
      request,
      { headers }
    );
  }
}