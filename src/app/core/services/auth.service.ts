// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/enviroment';

interface RegisterUser {
  fullName: string;
  userName: string;
  password: any; // Lưu ý: Trong API curl, bạn đang dùng "password": 123 (number), nhưng trong form Angular nên là string. Tôi sẽ dùng 'any' để linh hoạt, nhưng **thực tế nên là string**.
  phone: string;
}

interface RegisterDealer {
  userName: string;
  storeName: string;
  phone: string;
  email: string;
  address: string; // Tương ứng với 'Thành phố hoạt động'
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiLogin = `${environment.apiUrl}/auth/login`; // Thay thế bằng API đăng nhập thực tế của bạn
  private apiRegister = `${environment.apiUrl}/register/user`;
  private apiRegisterDealer = `${environment.apiUrl}/register/dealer`;
  private apiGetProfile = `${environment.apiUrl}/profile`;
  private apiSelectListDealer = `${environment.apiUrl}/dealer/select`;
  constructor(private http: HttpClient) { }


  register(userData: RegisterUser): Observable<any> {
    // Cổng API đăng ký không cần gửi token, chỉ cần gửi body
    return this.http.post<any>(this.apiRegister, userData);
  }

  registerDealer(dealerData: RegisterDealer): Observable<any> {
    return this.http.post<any>(this.apiRegisterDealer, dealerData);
  }

  login(credentials: { username: string, password: string }): Observable<any> {
    return this.http.post<any>(this.apiLogin, credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Lưu token vào Local Storage hoặc Session Storage
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
      })
    );
  }


  logout(): void {
    // Xóa token khi đăng xuất
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Có thể điều hướng về trang đăng nhập hoặc trang chủ
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }


  getUserProfile(): Observable<any> {
    debugger
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<any>(this.apiGetProfile, { headers });
  }
}