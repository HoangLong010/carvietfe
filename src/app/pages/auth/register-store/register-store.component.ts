import { Component, OnInit } from '@angular/core'; // 👈 Thêm OnInit
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms'; // 👈 Thêm FormBuilder, FormGroup, Validators
import { Router } from '@angular/router'; // 👈 Import Router
import { AuthService } from '../../../core/services/auth.service';

// Định nghĩa kiểu cho response API để dễ quản lý (giống bên login/register)
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
  selector: 'app-register-store',
  standalone: false,
  templateUrl: './register-store.component.html',
  styleUrl: './register-store.component.scss'
})
export class RegisterStoreComponent implements OnInit { // 👈 Triển khai OnInit
  registerStoreForm!: FormGroup;

  // Biến để quản lý Toast Notification
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'warning' | 'info' = 'error';
  showToast: boolean = false;

  // Inject FormBuilder, AuthService và Router
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerStoreForm = this.fb.group({
      storeName: ['', Validators.required], // Tên đại lý
      phone: ['', Validators.required], // Số điện thoại
      userName: ['', Validators.required], // Tên đăng nhập
      email: ['', [Validators.required, Validators.email]], // Email
      address: ['', Validators.required], // Thành phố hoạt động
      position: [''],
      notes: [''], // Ghi chú
      password: ['', [Validators.required, Validators.minLength(6)]], // Thêm độ dài tối thiểu cho an toàn
      confirmPassword: ['', Validators.required], // Thêm control xác nhận
      terms: [false, Validators.requiredTrue] // Điều khoản
    });
  }

  onSubmit(): void {
    this.toastMessage = '';
    this.showToast = false;

    if (this.registerStoreForm.valid) {
      const { userName, storeName, phone, email, address, password } = this.registerStoreForm.value;

      const dealerData = {
        userName,
        storeName,
        phone,
        email,
        address,
        password
      };

      this.authService.registerDealer(dealerData).subscribe({
        next: (response: ApiResponse) => {
          if (response.code === 200 || response.success) { // Kiểm tra thành công
            // 1. Hiển thị thông báo thành công
            this.toastMessage = response.message || 'Đăng ký cửa hàng thành công! Vui lòng chờ phê duyệt.';
            this.toastType = 'success';
            this.showToast = true;

            // 2. Chuyển hướng về trang đăng nhập sau 2 giây
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
          }
          else {
            // Xử lý lỗi từ backend
            this.toastMessage = response.message || 'Đăng ký thất bại. Vui lòng thử lại.';
            this.toastType = 'error';
            this.showToast = true;
          }
        },
        error: (error) => {
          console.error('Lỗi khi gọi API đăng ký Dealer:', error);
          this.toastMessage = 'Lỗi kết nối. Vui lòng kiểm tra lại đường truyền.';
          this.toastType = 'error';
          this.showToast = true;
        }
      });
    } else {
      // Form không hợp lệ
      this.registerStoreForm.markAllAsTouched();
      this.toastMessage = 'Vui lòng điền đầy đủ và chấp thuận các điều khoản.';
      this.toastType = 'warning';
      this.showToast = true;
    }
  }

  onToastClosed(): void {
    this.showToast = false;
    this.toastMessage = '';
  }

  scrollToRegisterForm(): void {
    if (typeof window !== 'undefined') {
      const el = document.getElementById('register-form');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    // Nếu cả 2 đều có giá trị mà khác nhau
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true }); // Gán lỗi vào ô nhập lại
      return { mismatch: true };
    } else {
      // Nếu khớp thì xóa lỗi mismatch (giữ lại các lỗi khác nếu có như required)
      if (confirmPassword?.hasError('mismatch')) {
        delete confirmPassword.errors?.['mismatch'];
        if (!Object.keys(confirmPassword.errors || {}).length) {
          confirmPassword.setErrors(null);
        }
      }
      return null;
    }
  }

}