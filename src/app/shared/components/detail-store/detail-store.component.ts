import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DetailStore, CarDetail, StoreService } from '../../../core/services/store.service';
import { ChatService } from '../../../core/services/chat.service';
import { switchMap, of } from 'rxjs';

@Component({
  selector: 'app-detail-store',
  standalone: false,
  templateUrl: './detail-store.component.html',
  styleUrls: ['./detail-store.component.scss']
})
export class DetailStoreComponent implements OnInit {
  storeId: string | null = null;
  storeDetail: DetailStore | null = null;
  loading: boolean = true;
  activeTab: 'available' | 'sold' = 'available';

  toastMessage: string = '';
  toastType: 'success' | 'error' | 'warning' | 'info' = 'error';
  showToast: boolean = false;

  // Thông tin user hiện tại
  currentUserId: string = '';
  isLoggedIn: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private storeService: StoreService,
    private chatService: ChatService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Load thông tin user từ localStorage
    this.loadCurrentUser();

    this.route.paramMap.pipe(
      switchMap(params => {
        this.storeId = params.get('userId');
        this.loading = true;
        if (this.storeId) {
          return this.storeService.getStoreDetail(this.storeId);
        }
        this.loading = false;
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.storeDetail = response.data;

          const processCarList = (list: CarDetail[], isSold: boolean) => {
            list.forEach((car, index) => {
              car.imageUrl = car.images && car.images.length > 0
                ? car.images[0].imageUrl
                : 'https://via.placeholder.com/300x150?text=Khong+co+anh';

              car.postedTime = isSold
                ? `Đã bán ${index + 1} tháng trước`
                : `${index + 1} tháng trước`;
            });
          };

          processCarList(this.storeDetail.carAvailableList, false);
          processCarList(this.storeDetail.carSoldList, true);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi khi lấy chi tiết cửa hàng:', err);
        this.loading = false;
        this.storeDetail = null;
      }
    });
  }

  /**
   * Load thông tin user hiện tại từ localStorage
   */
  loadCurrentUser(): void {
    try {
      const userProfile = localStorage.getItem('userProfile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        const data = typeof profile.data === 'string'
          ? JSON.parse(profile.data)
          : profile.data;

        this.currentUserId = data.userId;
        this.isLoggedIn = true;
      } else {
        this.isLoggedIn = false;
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.isLoggedIn = false;
    }
  }

  onToastClosed(): void {
    this.showToast = false;
    this.toastMessage = '';
  }


  /**
   * Chuyển sang trang chat với cửa hàng
   */
  openChatWithStore(): void {
    if (!this.isLoggedIn) {
      this.toastMessage = 'Vui lòng đăng nhập để sử dụng tính năng này.';
      this.toastType = 'warning';
      this.showToast = true;
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }

    if (!this.storeId) {
      console.error('Store ID not found');
      return;
    }

    // Kiểm tra không tự nhắn tin với chính mình
    if (this.currentUserId === this.storeId) {
      this.toastMessage = 'Bạn không thể nhắn tin với chính mình.';
      this.toastType = 'info';
      this.showToast = true;
      return;
    }

    // Chuyển sang trang chat với storeId
    this.router.navigate(['/chat'], {
      queryParams: {
        receiverId: this.storeId,
        receiverName: this.storeDetail?.storeName || 'Cửa hàng'
      }
    });
  }

  /**
   * Gọi điện thoại (mở app gọi điện)
   */
  callStore(): void {
    if (this.storeDetail?.phone) {
      window.location.href = `tel:${this.storeDetail.phone}`;
    }
  }

  goToDetail(id: string, status?: number): void {
    this.router.navigate(['/detail-car'], { queryParams: { id } })
      .then(() => window.scrollTo(0, 0));
  }

  setActiveTab(tab: 'available' | 'sold'): void {
    this.activeTab = tab;
  }

  getCarList(): CarDetail[] {
    if (!this.storeDetail) return [];
    return this.activeTab === 'available'
      ? this.storeDetail.carAvailableList
      : this.storeDetail.carSoldList;
  }

  formatPrice(price: number): string {
    return price.toLocaleString('vi-VN') + ' đ';
  }

  getInstallmentInfo(price: number): string {
    const loanAmount = price * 0.7;
    const monthlyInterestRate = 0.008;
    const months = 60;

    if (price < 100000000) return 'Giá trị nhỏ, không cần trả góp';

    const installment = loanAmount * monthlyInterestRate /
      (1 - Math.pow(1 + monthlyInterestRate, -months));

    if (isNaN(installment) || installment <= 0) {
      return 'Liên hệ để có mức trả góp tốt nhất';
    }

    const roundedInstallment = Math.ceil(installment / 100000) * 100000;
    return `chỉ từ ${(roundedInstallment / 1000000).toFixed(1).replace('.0', '')} triệu/tháng`;
  }
}