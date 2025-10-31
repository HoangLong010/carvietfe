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

  // Các biến để quản lý toast notification
  toastMessage: string = ''; // Nội dung thông báo hiển thị trên toast
  toastType: 'success' | 'error' | 'warning' | 'info' = 'error'; // Loại thông báo (quyết định màu sắc)
  showToast: boolean = false; // Biến kiểm soát việc hiển thị/ẩn toast

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
      // Gọi service đăng nhập với giá trị từ form
      this.authService.login(this.loginForm.value).subscribe({
        next: (response: ApiResponse) => { // Ép kiểu response về ApiResponse
          // Dựa vào 'code' trong response để xác định loại thông báo và nội dung
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
            this.toastType = 'error'; // Đặt loại là 'error' (màu đỏ)
            this.showToast = true; // Hiển thị toast
            console.error('Đăng nhập thất bại:', response.message);
          } else {
            // Xử lý các mã lỗi khác nếu có (ví dụ: 500 Internal Server Error)
            this.toastMessage = response.message || 'Đã xảy ra lỗi không xác định.';
            this.toastType = 'warning'; // Có thể dùng 'warning' cho các lỗi không mong đợi
            this.showToast = true;
            console.warn('Response không xác định:', response);
          }
        },
        error: (error) => {
          console.error('Lỗi khi gọi API đăng nhập:', error);
          // Xử lý lỗi từ HTTP (ví dụ: lỗi mạng, server không phản hồi, status code khác 2xx)
          // Kiểm tra cấu trúc lỗi từ backend, ví dụ error.error.message
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
      // Hiển thị lỗi validation của form nếu form không hợp lệ
      this.loginForm.markAllAsTouched(); // Đánh dấu tất cả các trường đã chạm để hiển thị lỗi
      this.toastMessage = 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.';
      this.toastType = 'warning'; // Có thể dùng màu vàng cho lỗi validation form
      this.showToast = true;
    }
  }

  /**
   * Xử lý sự kiện khi toast notification đóng.
   * Ẩn toast và xóa message để chuẩn bị cho thông báo tiếp theo.
   */
  onToastClosed(): void {
    this.showToast = false;
    this.toastMessage = '';
    this.toastType = 'error'; // Đặt lại về mặc định hoặc theo logic của bạn
  }
}
