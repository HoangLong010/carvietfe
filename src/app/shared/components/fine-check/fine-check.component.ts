import { Component } from '@angular/core';
import { FineCheckService, TrafficCheckRequest, ViolationDetail } from '../../../core/services/fine-check.service';

interface FineResult {
  hasFines: boolean;
  fines?: ViolationDetail[];
  totalFines?: number;
  totalAmount?: number;
  lastUpdate: string;
  source: string;
}

@Component({
  selector: 'app-fine-check',
  standalone: false,
  templateUrl: './fine-check.component.html',
  styleUrl: './fine-check.component.scss'
})
export class FineCheckComponent {
  activeTab: 'csgt' | 'registry' = 'csgt';
  vehicleType: 'car' | 'motorcycle' | 'electric' = 'car';
  licensePlate: string = '';
  registrationStamp: string = ''; // Cho Đăng kiểm
  plateColor: 'white' | 'yellow' | 'blue' = 'white';
  
  isLoading: boolean = false;
  errorMessage: string = '';
  searchResults: FineResult | null = null;

  constructor(
    private fineCheckService: FineCheckService
  ) {}

  searchFines() {
    // Validate input
    if (!this.licensePlate.trim()) {
      this.errorMessage = 'Vui lòng nhập biển số xe';
      return;
    }

    // Validate biển số format (optional)
    const platePattern = /^[0-9]{2}[A-Z]{1,2}[0-9]{4,6}$/;
    const cleanPlate = this.licensePlate.trim().toUpperCase().replace(/\s+/g, '');
    
    if (!platePattern.test(cleanPlate)) {
      this.errorMessage = 'Biển số không đúng định dạng (VD: 30A12345)';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.searchResults = null;

    // Chuẩn bị request
    const request: TrafficCheckRequest = {
      plateNumber: cleanPlate,
      vehicleType: this.vehicleType,
      plateColor: this.plateColor,
      type: this.activeTab === 'csgt' ? 1 : 2
    };

    // Nếu tra cứu từ Đăng kiểm và có tem
    if (this.activeTab === 'registry' && this.registrationStamp.trim()) {
      request.registrationStamp = this.registrationStamp.trim();
    }

    console.log('🔍 Gửi request:', request);

    // Call API
    this.fineCheckService.checkTrafficViolation(request).subscribe({
      next: (response) => {
        console.log('✅ Response:', response);
        this.isLoading = false;

        if (response.success && response.data) {
          this.searchResults = {
            hasFines: response.data.hasFines,
            fines: response.data.violations || [],
            totalFines: response.data.totalFines,
            totalAmount: response.data.totalAmount,
            lastUpdate: response.data.lastUpdate,
            source: response.data.source
          };
        } else {
          this.errorMessage = response.message || 'Không có dữ liệu trả về';
        }
      },
      error: (error) => {
        console.error('❌ Error:', error);
        this.isLoading = false;
        
        if (error.status === 0) {
          this.errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        } else if (error.status === 404) {
          this.errorMessage = 'API không tồn tại. Vui lòng kiểm tra lại đường dẫn.';
        } else if (error.status === 500) {
          this.errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
        } else {
          this.errorMessage = error.error?.message || 'Có lỗi xảy ra khi tra cứu. Vui lòng thử lại.';
        }

        // Show mock data for demo (remove in production)
        // this.showMockResult();
      }
    });
  }

  updateData() {
    this.searchFines();
  }

  checkOtherPlate() {
    this.licensePlate = '';
    this.registrationStamp = '';
    this.searchResults = null;
    this.errorMessage = '';
  }

  onTabChange(tab: 'csgt' | 'registry') {
    this.activeTab = tab;
    this.searchResults = null;
    this.errorMessage = '';
  }

  // Mock data for testing UI (remove in production)
  private showMockResult() {
    this.searchResults = {
      hasFines: true,
      totalFines: 2,
      totalAmount: 2000000,
      fines: [
        {
          date: '15/11/2024',
          time: '14:30',
          location: 'Đường Láng, Đống Đa, Hà Nội',
          violation: 'Vượt đèn đỏ',
          amount: 1000000,
          status: 'Chưa xử lý'
        },
        {
          date: '20/11/2024',
          time: '09:15',
          location: 'Đại lộ Thăng Long, Hà Nội',
          violation: 'Vượt quá tốc độ cho phép',
          amount: 1000000,
          status: 'Chưa xử lý'
        }
      ],
      lastUpdate: '23:22:20 | 08/12/2024',
      source: 'Cổng thông tin điện tử Cục CSGT'
    };
  }

  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }
}