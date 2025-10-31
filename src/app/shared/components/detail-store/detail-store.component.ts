
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DetailStore, CarDetail, StoreService } from '../../../core/services/store.service';
import { Observable, switchMap, of } from 'rxjs';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common'; 


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

  constructor(
    private route: ActivatedRoute,
    private storeService: StoreService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.storeId = params.get('id');
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
          
          // ********** XỬ LÝ DỮ LIỆU ẢNH VÀ THỜI GIAN ĐĂNG **********
          const processCarList = (list: CarDetail[], isSold: boolean) => {
            list.forEach((car, index) => {
              // Lấy ảnh đầu tiên trong mảng images
              car.imageUrl = car.images && car.images.length > 0 
                             ? car.images[0].imageUrl 
                             : 'https://via.placeholder.com/300x150?text=Khong+co+anh'; 
              
              // Gán thời gian đăng giả lập hoặc logic tính toán thực tế
              car.postedTime = isSold 
                               ? `Đã bán ${index + 1} tháng trước` 
                               : `${index + 1} tháng trước`;
            });
          };

          processCarList(this.storeDetail.carAvailableList, false);
          processCarList(this.storeDetail.carSoldList, true);
          // *******************************************************
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

  goToDetail(id: string, status?: number) {
    this.router.navigate(['/detail-car'], { queryParams: { id } }).then(() => window.scrollTo(0, 0));
  }
  // ... (các phương thức setActiveTab, getCarList, formatPrice, getInstallmentInfo giữ nguyên)
  setActiveTab(tab: 'available' | 'sold'): void {
    this.activeTab = tab;
  }

  getCarList(): CarDetail[] {
    if (!this.storeDetail) return [];
    return this.activeTab === 'available' ? this.storeDetail.carAvailableList : this.storeDetail.carSoldList;
  }

  formatPrice(price: number): string {
    return price.toLocaleString('vi-VN') + ' đ';
  }

  getInstallmentInfo(price: number): string {
    const loanAmount = price * 0.7;
    const monthlyInterestRate = 0.008;
    const months = 60;
    
    if (price < 100000000) return 'Giá trị nhỏ, không cần trả góp';

    const installment = loanAmount * monthlyInterestRate / (1 - Math.pow(1 + monthlyInterestRate, -months));
    
    if (isNaN(installment) || installment <= 0) {
        return 'Liên hệ để có mức trả góp tốt nhất';
    }
    const roundedInstallment = Math.ceil(installment / 100000) * 100000;
    
    return `chỉ từ ${(roundedInstallment / 1000000).toFixed(1).replace('.0', '')} triệu/tháng`;
  }
}