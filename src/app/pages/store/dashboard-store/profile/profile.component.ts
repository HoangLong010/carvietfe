import { Component } from '@angular/core';
import { StoreService, UpdateStoreRequest } from '../../../../core/services/store.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  userInfo: any;
  isEditStoreModalOpen: boolean = false;
  
  // Dữ liệu form cập nhật
  storeUpdateData: UpdateStoreRequest = {
    storeName: '',
    address: '',
    phone: '',
    email: '',
    province: '',
    description: '',
    website: ''
  };

  selectedLogoFile: File | null = null;
  selectedBannerFile: File | null = null;
  logoPreview: string | null = null;
  bannerPreview: string | null = null;
  isSubmitting: boolean = false;
  constructor(private storeService: StoreService, private authService: AuthService) {}

  ngOnInit(): void {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      this.userInfo = JSON.parse(profile).data;
      // Load ảnh hiện tại nếu có
      if (this.userInfo.logoUrl) {
        this.logoPreview = this.userInfo.logoUrl;
      }
      if (this.userInfo.bannerUrl) {
        this.bannerPreview = this.userInfo.bannerUrl;
      }
    }
  }

  openStoreUpdateModal() {
    this.isEditStoreModalOpen = true;
    // Pre-fill data từ userInfo
    this.storeUpdateData = {
      storeName: this.userInfo?.storeName || '',
      address: this.userInfo?.address || '',
      phone: this.userInfo?.phoneNumber || '',
      email: this.userInfo?.email || '',
      province: this.userInfo?.province || '',
      description: this.userInfo?.description || '',
      website: this.userInfo?.website || ''
    };
  }

  // Đóng Modal
  closeStoreUpdateModal() {
    this.isEditStoreModalOpen = false;
    // Reset preview và file khi đóng modal
    this.selectedLogoFile = null;
    this.selectedBannerFile = null;
    this.logoPreview = this.userInfo?.logoUrl || null;
    this.bannerPreview = this.userInfo?.bannerUrl || null;
    this.isSubmitting = false;
  }

  onLogoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Kiểm tra loại file
      if (!file.type.match('image.*')) {
        alert('Chỉ chấp nhận file ảnh');
        return;
      }
      
      // Kiểm tra kích thước file (ví dụ: max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB');
        return;
      }
      
      this.selectedLogoFile = file;
      
      // Tạo preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Xử lý chọn banner
  onBannerSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Kiểm tra loại file
      if (!file.type.match('image.*')) {
        alert('Chỉ chấp nhận file ảnh');
        return;
      }
      
      // Kiểm tra kích thước file (ví dụ: max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB');
        return;
      }
      
      this.selectedBannerFile = file;
      
      // Tạo preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.bannerPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeSelectedLogo(): void {
    this.selectedLogoFile = null;
    this.logoPreview = this.userInfo?.logoUrl || null;
  }

  // Xóa banner đã chọn
  removeSelectedBanner(): void {
    this.selectedBannerFile = null;
    this.bannerPreview = this.userInfo?.bannerUrl || null;
  }
  // Submit Form
  onSubmitUpdateStore() {
    if (this.isSubmitting) return;
    
    this.isSubmitting = true;
    const dealerId = this.authService.getUserId();

    this.storeService.updateStore(
      dealerId ?? '', 
      this.storeUpdateData, 
      this.selectedLogoFile || undefined, 
      this.selectedBannerFile || undefined
    ).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          alert('Cập nhật thông tin cửa hàng thành công!');
          this.closeStoreUpdateModal();
          this.updateUserProfile();
        } else {
          alert('Cập nhật thất bại: ' + (res.message || 'Lỗi không xác định'));
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error(err);
        alert('Cập nhật thất bại: ' + (err.error?.message || 'Lỗi hệ thống'));
      }
    });
  }

  private updateUserProfile(): void {
    // Cập nhật thông tin user trong localStorage sau khi update thành công
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      const userProfile = JSON.parse(profile);
      userProfile.data = { 
        ...userProfile.data, 
        ...this.storeUpdateData,
        // Cập nhật URL ảnh mới nếu có
        logoUrl: this.logoPreview?.startsWith('http') ? this.logoPreview : userProfile.data.logoUrl,
        bannerUrl: this.bannerPreview?.startsWith('http') ? this.bannerPreview : userProfile.data.bannerUrl
      };
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      this.userInfo = userProfile.data;
    }
  }
}
