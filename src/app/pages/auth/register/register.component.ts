import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // 👈 Import Router
import { AuthService } from '../../../core/services/auth.service';

// Định nghĩa kiểu cho response API để dễ quản lý (giống bên login)
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
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit { // 👈 Thêm OnInit
  registerForm!: FormGroup;
  
  // 🔑 Biến để quản lý Toast Notification
  toastMessage: string = ''; 
  toastType: 'success' | 'error' | 'warning' | 'info' = 'error'; 
  showToast: boolean = false; 

  // 🔑 Inject AuthService và Router
  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private router: Router // 👈 Router
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      userName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]], 
      phone: ['', Validators.required]
    });
  }

  onSubmit() {
    // Reset trạng thái toast
    this.toastMessage = '';
    this.showToast = false;
    
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: (response: ApiResponse) => { 
          if (response.code === 200 || response.success) { // Kiểm tra thành công
            this.toastMessage = response.message || 'Đăng ký thành công!';
            this.toastType = 'success';
            this.showToast = true;

            setTimeout(() => {
              this.router.navigate(['/login']); 
            }, 2000); 
          } 
          else {
            this.toastMessage = response.message || 'Đăng ký thất bại. Vui lòng thử lại.'; 
            this.toastType = 'error'; 
            this.showToast = true; 
          }
        },
        error: (error) => {
          console.error('Lỗi khi gọi API đăng ký:', error);
          this.toastMessage = 'Lỗi kết nối. Vui lòng kiểm tra lại đường truyền.';
          this.toastType = 'error';
          this.showToast = true;
        }
      });
    } else {
      this.registerForm.markAllAsTouched(); 
      this.toastMessage = 'Vui lòng nhập đầy đủ và đúng định dạng các trường.';
      this.toastType = 'warning'; 
      this.showToast = true;
    }
  }
  
  onToastClosed(): void {
    this.showToast = false;
    this.toastMessage = '';
    this.toastType = 'error'; 
  }
}