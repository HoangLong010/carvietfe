import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface FineResult {
  hasFines: boolean;
  fines?: Array<{
    date: string;
    location: string;
    violation: string;
    amount: number;
  }>;
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
  isLoading: boolean = false;
  errorMessage: string = '';
  searchResults: FineResult | null = null;

  constructor(private http: HttpClient) {}

  searchFines() {
    if (!this.licensePlate.trim()) {
      this.errorMessage = 'Vui lòng nhập biển số xe';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.searchResults = null;

    // API endpoint - thay thế bằng endpoint thực tế
    const apiUrl = this.activeTab === 'csgt' 
      ? 'https://api.example.com/csgt/check-fine'
      : 'https://api.example.com/registry/check-fine';

    const requestData = {
      licensePlate: this.licensePlate.trim().toUpperCase(),
      vehicleType: this.vehicleType
    };

    this.http.post<any>(apiUrl, requestData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.searchResults = this.mapApiResponse(response);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Có lỗi xảy ra khi tra cứu. Vui lòng thử lại sau.';
        console.error('API Error:', error);
        
        // Mock data for demo purposes
        this.showMockResult();
      }
    });
  }

  private mapApiResponse(response: any): FineResult {
    // Map API response to your interface
    return {
      hasFines: response.violations && response.violations.length > 0,
      fines: response.violations?.map((v: any) => ({
        date: v.violationDate,
        location: v.violationLocation,
        violation: v.violationType,
        amount: v.fineAmount
      })),
      lastUpdate: response.lastUpdateTime || new Date().toLocaleString('vi-VN'),
      source: response.dataSource || 'Cổng thông tin điện tử Cục CSGT'
    };
  }

  private showMockResult() {
    // Mock result for demonstration
    this.searchResults = {
      hasFines: false,
      lastUpdate: '23:22:20 | 03/11/2025',
      source: 'Cổng thông tin điện tử Cục CSGT'
    };
  }

  updateData() {
    this.searchFines();
  }

  checkOtherPlate() {
    this.licensePlate = '';
    this.searchResults = null;
    this.errorMessage = '';
  }
}