import { Component } from '@angular/core';
import { StoreService, UpdateStoreRequest } from '../../../../core/services/store.service';

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
  constructor(private storeService: StoreService) {}

  ngOnInit(): void {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      this.userInfo = JSON.parse(profile).data;
    }
  }

  openStoreUpdateModal() {
    this.isEditStoreModalOpen = true;
    if(!this.storeUpdateData.address) this.storeUpdateData.address = this.userInfo?.address || '';
    if(!this.storeUpdateData.phone) this.storeUpdateData.phone = this.userInfo?.phoneNumber || '';
  }

  // Đóng Modal
  closeStoreUpdateModal() {
    this.isEditStoreModalOpen = false;
  }
  // Submit Form
  onSubmitUpdateStore() {
    if (!this.userInfo || !this.userInfo.id) {
      alert('Không tìm thấy thông tin Dealer ID!');
      return;
    }

    const dealerId = this.userInfo.id; // Lấy ID từ localStorage như yêu cầu

    this.storeService.updateStore(dealerId, this.storeUpdateData).subscribe({
      next: (res) => {
        alert('Cập nhật thông tin cửa hàng thành công!');
        this.closeStoreUpdateModal();
      },
      error: (err) => {
        console.error(err);
        alert('Cập nhật thất bại: ' + (err.error?.message || 'Lỗi hệ thống'));
      }
    });
  }
}
