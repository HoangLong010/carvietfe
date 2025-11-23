import { Component, OnInit } from '@angular/core';
import {
  StoreManagementService,
  StoreManagement,
  StoreUpdatePayload
} from '../../../../core/services/store-management.service';

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
  selector: 'app-store-management',
  standalone: false,
  templateUrl: './store-management.component.html',
  styleUrl: './store-management.component.scss'
})
export class StoreManagementComponent implements OnInit {

  // Trạng thái phân trang
  currentPage = 0;
  pageSize = 10;
  totalElementsCount = 0;
  pagesCount = 0;
  hasPreviousPage = false;
  hasNextPage = false;

  // Bộ lọc tìm kiếm
  filter: {
    storeName: string;
    address: string;
  } = {
      storeName: '',
      address: ''
    };

  stores: StoreManagement[] = [];

  // Trạng thái modal chỉnh sửa
  isEditModalOpen = false;
  selectedStore: StoreManagement = {} as StoreManagement;

  // Toast notification
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'warning' | 'info' = 'info';
  showToast: boolean = false;

  constructor(private storeManagementService: StoreManagementService) { }

  ngOnInit(): void {
    this.performSearch();
  }

  performSearch(): void {
    this.storeManagementService.getAllStoresForManagement(
      this.filter.storeName,
      this.filter.address,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (response) => {
        this.stores = response.content;
        this.totalElementsCount = response.currentTotalElementsCount;
        this.pagesCount = response.pagesCount;
        this.currentPage = response.currentPage;
        this.pageSize = response.pageSize;
        this.hasPreviousPage = response.hasPrevious;
        this.hasNextPage = response.hasNext;
      },
      error: (error) => {
        console.error('Lỗi khi tìm kiếm cửa hàng:', error);
        this.toastMessage = 'Có lỗi xảy ra khi tải dữ liệu cửa hàng';
        this.toastType = 'error';
        this.showToast = true;
      }
    });
  }

  getStatus(status: number | null | undefined): string {
    switch (status) {
      case 0: return 'Chưa kích hoạt';
      case 1: return 'Hoạt động';
      default: return 'Không xác định';
    }
  }

  openEditModal(store: StoreManagement): void {
    this.selectedStore = { ...store };
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
  }

  saveEdit(): void {
    this.resetToast();

    const storeId = this.selectedStore.id;
    const payload: StoreUpdatePayload = {
      storeName: this.selectedStore.storeName,
      address: this.selectedStore.address,
      phone: this.selectedStore.phone,
      email: this.selectedStore.email,
      website: this.selectedStore.website,
      description: this.selectedStore.description
    };

    this.storeManagementService.updateStore(storeId, payload).subscribe({
      next: (response: ApiResponse) => {
        if (response.success && response.code === 200) {
          this.toastMessage = response.message || 'Cập nhật cửa hàng thành công!';
          this.toastType = 'success';
          this.showToast = true;
          this.closeEditModal();
          this.performSearch();
        } else {
          this.toastMessage = response.message || 'Cập nhật cửa hàng thất bại';
          this.toastType = 'error';
          this.showToast = true;
          console.error('Cập nhật thất bại:', response);
        }
      },
      error: (error) => {
        this.toastMessage = error.error?.message || 'Đã có lỗi xảy ra khi cập nhật cửa hàng';
        this.toastType = 'error';
        this.showToast = true;
        this.closeEditModal();
      }
    });
  }

  handleDeleteStore(storeId: string): void {
    this.resetToast();

    console.warn('CHỨC NĂNG XÓA CỬA HÀNG - CẦN THÊM MODAL XÁC NHẬN');

    if (storeId) {
      this.storeManagementService.deleteStore(storeId).subscribe({
        next: (response: ApiResponse) => {
          if (response.success && response.code === 200) {
            this.toastMessage = response.message || 'Xóa cửa hàng thành công!';
            this.toastType = 'success';
            this.showToast = true;
            this.performSearch();
          } else {
            this.toastMessage = response.message || 'Xóa cửa hàng thất bại';
            this.toastType = 'error';
            this.showToast = true;
            console.error('Xóa thất bại:', response);
          }
        },
        error: (error) => {
          console.error('Lỗi khi gọi API xóa cửa hàng:', error);
          this.toastMessage = error.error?.message || 'Đã có lỗi xảy ra khi xóa cửa hàng';
          this.toastType = 'error';
          this.showToast = true;
        }
      });
    }
  }

  toggleStoreStatus(store: StoreManagement): void {
    this.resetToast();

    const newStatus = store.status === 1 ? 0 : 1;
    const actionName = newStatus === 1 ? 'kích hoạt' : 'vô hiệu hóa';

    // Xác nhận với người dùng
    if (confirm(`Bạn có chắc muốn ${actionName} cửa hàng "${store.storeName}"?`)) {
      this.storeManagementService.updateStoreStatus(store.id, newStatus).subscribe({
        next: (response: ApiResponse) => {
          if (response.success) {
            // Cập nhật trạng thái ngay lập tức trong giao diện
            store.status = newStatus;

            this.toastMessage = `Đã ${actionName} cửa hàng "${store.storeName}" thành công`;
            this.toastType = 'success';
            this.showToast = true;
          } else {
            this.toastMessage = response.message || `${actionName} cửa hàng thất bại`;
            this.toastType = 'error';
            this.showToast = true;
          }
        },
        error: (error) => {
          console.error('Lỗi khi cập nhật trạng thái cửa hàng:', error);
          this.toastMessage = error.error?.message || `Đã có lỗi xảy ra khi ${actionName} cửa hàng`;
          this.toastType = 'error';
          this.showToast = true;
        }
      });
    }
  }

  handleBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeEditModal();
    }
  }

  goToPreviousPage(): void {
    if (this.hasPreviousPage) {
      this.currentPage--;
      this.performSearch();
    }
  }

  goToNextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      this.performSearch();
    }
  }

  onToastClosed(): void {
    this.resetToast();
  }

  private resetToast(): void {
    this.showToast = false;
    this.toastMessage = '';
    this.toastType = 'info';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  }

  formatNumber(num: number | null | undefined): string {
    return num === null || num === undefined ? '0' : num.toLocaleString('vi-VN');
  }
}