// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/enviroment';
import { ChatService } from './chat.service';

interface RegisterUser {
  fullName: string;
  userName: string;
  password: any;
  phone: string;
}

interface RegisterDealer {
  userName: string;
  storeName: string;
  phone: string;
  email: string;
  address: string;
  password: string;
}

export interface ResetPasswordRequest {
  oldPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiLogin = `${environment.apiUrl}/auth/login`;
  private apiRegister = `${environment.apiUrl}/register/user`;
  private apiRegisterDealer = `${environment.apiUrl}/register/dealer`;
  private apiGetProfile = `${environment.apiUrl}/profile`;
  private apiSelectListDealer = `${environment.apiUrl}/dealer/select`;
  private apiResetPassword = `${environment.apiUrl}/reset-password`;
  
  constructor(private http: HttpClient, private chatService: ChatService) { }

  register(userData: RegisterUser): Observable<any> {
    return this.http.post<any>(this.apiRegister, userData);
  }

  registerDealer(dealerData: RegisterDealer): Observable<any> {
    return this.http.post<any>(this.apiRegisterDealer, dealerData);
  }

  changePassword(data: ResetPasswordRequest): Observable<any> {
    const token = this.getAccessToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(this.apiResetPassword, data, { headers });
  }

  login(credentials: { username: string, password: string }): Observable<any> {
    return this.http.post<any>(this.apiLogin, credentials).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Lưu tokens
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          
          // QUAN TRỌNG: Parse và lưu userProfile + userId
          if (response.data.userProfile) {
            try {
              // userProfile có thể là string JSON, cần parse
              const userProfile = typeof response.data.userProfile === 'string' 
                ? JSON.parse(response.data.userProfile) 
                : response.data.userProfile;
              
              localStorage.setItem('userProfile', JSON.stringify(userProfile));
              
              // Lưu userId riêng để dễ truy cập
              if (userProfile.data?.userId) {
                localStorage.setItem('userId', userProfile.data.userId);
              }
            } catch (e) {
              alert("Gặp lỗi trong quá trình xử lý")
            }
          }
        }
      })
    );
  }

  logout(): void {
    // Xóa tất cả thông tin khi đăng xuất
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userId');
    this.chatService.disconnect(); // Chỉ ngắt kết nối khi đăng xuất hẳn
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  getUserId(): string | null {
    try {
      // Lấy chuỗi userProfile từ localStorage
      const userProfileString = localStorage.getItem('userProfile');

      if (!userProfileString) {
        return null;
      }

      // Phân tích chuỗi JSON lớn
      const userProfile = JSON.parse(userProfileString);

      // Kiểm tra cấu trúc và lấy userId
      if (
        userProfile &&
        userProfile.data &&
        userProfile.data.userId 
        // userProfile.data.accountType === 2 
      ) {
        return userProfile.data.userId;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  getUserProfile(): Observable<any> {
    debugger
    const token = localStorage.getItem('accessToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<any>(this.apiGetProfile, { headers });
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken() && !!this.getUserId();
  }

  // Gọi API để lấy profile mới (nếu cần)
  fetchUserProfile(): Observable<any> {
    const token = this.getAccessToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<any>(this.apiGetProfile, { headers }).pipe(
      tap(response => {
        if (response.success && response.data) {
          // Cập nhật localStorage với profile mới
          localStorage.setItem('userProfile', JSON.stringify(response.data));
          if (response.data.userId) {
            localStorage.setItem('userId', response.data.userId);
          }
        }
      })
    );
  }
}