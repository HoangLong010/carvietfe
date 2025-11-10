// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/enviroment';

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
  
  constructor(private http: HttpClient) { }

  register(userData: RegisterUser): Observable<any> {
    return this.http.post<any>(this.apiRegister, userData);
  }

  registerDealer(dealerData: RegisterDealer): Observable<any> {
    return this.http.post<any>(this.apiRegisterDealer, dealerData);
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
                console.log('Login successful - UserId:', userProfile.data.userId);
              }
            } catch (e) {
              console.error('Error parsing userProfile:', e);
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
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  getUserId(): string | null {
    try {
      debugger
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
      console.error('Lỗi khi lấy user ID từ localStorage:', error);
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