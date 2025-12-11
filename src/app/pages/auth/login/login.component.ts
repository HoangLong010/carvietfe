// src/app/components/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

// Định nghĩa kiểu cho response API để dễ quản lý
interface ApiResponse {
  data?: any;
  success: boolean;
  code: number;
  error_code: number;
  message: string;
  description: string;
  timestamp: number;
}

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  toastMessage: string = ''; 
  toastType: 'success' | 'error' | 'warning' | 'info' = 'error';
  showToast: boolean = false; 

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    // Reset trạng thái toast trước mỗi lần submit để không hiển thị thông báo cũ
    this.toastMessage = '';
    this.showToast = false;

    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response: ApiResponse) => { // Ép kiểu response về ApiResponse
          if (response.code === 200) {
          this.toastMessage = response.message;
          this.toastType = 'success';
          this.showToast = true;

          // Lấy accessToken từ localStorage
          const token = localStorage.getItem('accessToken');
          if (token) {
            // Parse token để lấy accountType
            const payload = JSON.parse(atob(token.split('.')[1]));
            const accountType = payload.accountType;

            // Lấy profile và điều hướng theo accountType
            this.authService.getUserProfile().subscribe({
              next: (profileData) => {
                localStorage.setItem('userProfile', JSON.stringify(profileData));
                if (accountType === 1) {
                  this.router.navigate(['/admin/dashboard-admin']);
                } else if (accountType === 3) {
                  this.router.navigate(['/stores/dashboard-store']);
                } else {
                  this.router.navigate(['/home']);
                }
              },
              error: (error) => {
                this.toastMessage = 'Lấy thông tin người dùng thất bại.';
                this.toastType = 'warning';
                this.showToast = true;
              }
            });
          } else {
            this.toastMessage = 'Không tìm thấy accessToken.';
            this.toastType = 'error';
            this.showToast = true;
          }
        }
          else if (response.code === 400) {
            this.toastMessage = response.message || 'Đăng nhập thất bại.'; // Lấy message từ backend, hoặc dùng mặc định
            this.toastType = 'error';
            this.showToast = true; // Hiển thị toast
          } else {
            this.toastMessage = response.message || 'Đã xảy ra lỗi không xác định.';
            this.toastType = 'warning'; // Có thể dùng 'warning' cho các lỗi không mong đợi
            this.showToast = true;
          }
        },
        error: (error) => {
          if (error.error && error.error.message) {
            this.toastMessage = error.error.message; // Lấy message từ error.error nếu có
          } else {
            this.toastMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
          }
          this.toastType = 'error'; // Luôn là màu đỏ cho lỗi hệ thống/mạng
          this.showToast = true; // Hiển thị toast
        }
      });
    } else {
      this.loginForm.markAllAsTouched(); 
      this.toastMessage = 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.';
      this.toastType = 'warning'; 
      this.showToast = true;
    }
  }


  onToastClosed(): void {
    this.showToast = false;
    this.toastMessage = '';
    this.toastType = 'error'; 
  }

   navigateToRegister() {
    this.router.navigate(['/register']);
  }

  navigateToRegisterStore() {
    this.router.navigate(['/register-store']);
  }
}
