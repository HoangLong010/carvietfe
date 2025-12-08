// profile.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AccountUserService } from '../../../core/services/accout-user.service';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  activeTab: 'info' | 'password' = 'info';

  // User data
  userProfile: any = {
    userId: '',
    fullName: '',
    phoneNumber: '',
    address: '',
    email: '',
    avatar: '',
    cccd: '',
    issuedDate: '',
    birthDate: '',
    gender: '',
    taxCode: '',
    invoiceInfo: ''
  };

  // Avatar upload
  selectedAvatarFile: File | null = null;
  avatarPreview: string | null = null;

  // Loading states
  isLoading = false;
  isSaving = false;

  // Reset password data
  passwordData = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  isChangingPassword = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: AccountUserService
  ) { }

  ngOnInit() {
    this.loadUserProfile();
  }

  // profile.component.ts

  loadUserProfile() {
    const userStr = localStorage.getItem('userProfile');
    if (userStr) {
      try {
        const parsedJSON = JSON.parse(userStr);

        const userData = parsedJSON.data ? parsedJSON.data : parsedJSON;
        this.userProfile = {
          userId: userData.userId || '',
          fullName: userData.fullName || '',
          phoneNumber: userData.phoneNumber || '',
          address: userData.address || '',
          email: userData.email || '',
          avatar: userData.avatar || '',
          cccd: userData.cccd || '',
          issuedDate: userData.issuedDate || '',
          birthDate: userData.birthDate || '',
          gender: userData.gender || '',
          taxCode: userData.taxCode || '',
          invoiceInfo: userData.invoiceInfo || ''
        };

        this.avatarPreview = this.userProfile.avatar;
      } catch (e) {
        console.error('Lỗi parse userProfile từ localStorage', e);
      }
    }
  }

  changePassword() {
    // 1. Validate dữ liệu
    if (!this.passwordData.oldPassword || !this.passwordData.newPassword || !this.passwordData.confirmPassword) {
      alert('Vui lòng nhập đầy đủ thông tin mật khẩu');
      return;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      alert('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    if (this.passwordData.newPassword.length < 6) { // Ví dụ validate độ dài
      alert('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    // 2. Gọi API
    this.isChangingPassword = true;

    const requestData = {
      oldPassword: this.passwordData.oldPassword,
      newPassword: this.passwordData.newPassword
    };

    this.authService.changePassword(requestData).subscribe({
      next: (res) => {
        this.isChangingPassword = false;
        if (res.success || res.code === 201 || res.code === 200) {
          alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
          this.logout(); // Đăng xuất để user đăng nhập lại bằng pass mới (Security best practice)
        } else {
          alert(res.message || 'Có lỗi xảy ra');
        }
      },
      error: (err) => {
        this.isChangingPassword = false;
        console.error(err);
        // Hiển thị lỗi từ backend (ví dụ: Mật khẩu cũ không trùng khớp)
        const message = err.error?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.';
        alert(message);
      }
    });
  }

  onAvatarSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB');
        return;
      }

      this.selectedAvatarFile = file;

      // Preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeAvatar() {
    this.selectedAvatarFile = null;
    this.avatarPreview = this.userProfile.avatar || null;
  }

  saveProfile() {
    if (!this.userProfile.fullName) {
      alert('Vui lòng nhập họ và tên');
      return;
    }
    debugger
    this.isSaving = true;

    const updateData = {
      fullName: this.userProfile.fullName,
      address: this.userProfile.address,
      phoneNumber: this.userProfile.phoneNumber,
      email: this.userProfile.email
    };

    this.userService.updateUserWithAvatar(
      this.authService.getUserId()!,
      updateData,
      this.selectedAvatarFile || undefined
    ).subscribe({
      next: (response) => {
        this.isSaving = false;
        alert('Cập nhật thông tin thành công!');

        // Update localStorage
        const currentUser = JSON.parse(localStorage.getItem('userProfile') || '{}');
        currentUser.fullName = this.userProfile.fullName;
        currentUser.address = this.userProfile.address;
        currentUser.email = this.userProfile.email;
        if (response.data?.avatar) {
          currentUser.avatar = response.data.avatar;
          this.userProfile.avatar = response.data.avatar;
        }
        localStorage.setItem('userProfile', JSON.stringify(currentUser));

        this.selectedAvatarFile = null;
      },
      error: (error) => {
        this.isSaving = false;
        alert('Cập nhật thất bại: ' + (error.error?.message || 'Lỗi không xác định'));
      }
    });
  }

  logout() {
    this.authService.logout();
    localStorage.removeItem('userProfile');
    this.router.navigate(['/auth/login']);
  }
}