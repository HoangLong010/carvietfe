import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(ChartDataLabels);

interface StoreGeneralResponse {
  totalCar: number;
  totalCarSold: number;
  totalCarNotSold: number;
  totalSchedule: number;
  totalFavourite: number;
}

interface BookingStatusResponse {
  status: number;
  percentage: number;
}

interface TotalCarByBrandResponse {
  brandName: string;
  totalCar: number;
}

interface RevenueByBrandResponse {
  brandName: string;
  total: number;
}

interface Top5BestCarBrandResponse {
  brandName: string;
  total: number;
}

interface RevenueByTimeResponse {
  time: number; // timestamp
  price: number;
}

@Component({
  selector: 'app-report',
  standalone: false,
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

  // Form data
  startDate: string = '2025-01-01';
  endDate: string = '2025-12-31';
  
  // Lấy storeId từ localStorage
  selectedStore: string = '';

  // API base URL
  private apiUrl = 'http://localhost:8080/api/v1/dashboard/store';

  // Charts storage
  private charts: { [key: string]: Chart } = {};

  // Data
  generalData: StoreGeneralResponse | null = null;
  bookingStatusData: BookingStatusResponse[] = [];

  // Loading states
  isLoading = false;

  // Thêm storeName để hiển thị
  storeName: string = 'Cửa hàng của tôi';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    // Set default dates
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    this.startDate = this.formatDate(firstDayOfYear);
    this.endDate = this.formatDate(today);

    // Lấy storeId từ localStorage
    this.getStoreIdFromLocalStorage();

    // Load dashboard data after view is ready
    setTimeout(() => {
      this.loadDashboardData();
    }, 100);
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getStoreIdFromLocalStorage(): void {
    try {
      // Lấy userId từ localStorage (theo AuthService bạn đã cung cấp)
      const userId = localStorage.getItem('userId');
      
      if (userId) {
        this.selectedStore = userId;
        console.log('Store ID từ localStorage:', this.selectedStore);
      } else {
        console.warn('Không tìm thấy storeId trong localStorage');
        // Có thể thử lấy từ userProfile nếu cần
        this.tryGetStoreIdFromUserProfile();
      }
    } catch (error) {
      console.error('Lỗi khi lấy storeId từ localStorage:', error);
    }
  }

  tryGetStoreIdFromUserProfile(): void {
    try {
      const userProfileString = localStorage.getItem('userProfile');
      if (userProfileString) {
        const userProfile = JSON.parse(userProfileString);
        // Tuỳ thuộc vào cấu trúc userProfile, có thể storeId nằm ở đây
        if (userProfile.data?.userId) {
          this.selectedStore = userProfile.data.userId;
        } else if (userProfile.data?.storeId) {
          this.selectedStore = userProfile.data.storeId;
        } else if (userProfile.storeId) {
          this.selectedStore = userProfile.storeId;
        }
      }
    } catch (error) {
      console.error('Lỗi khi lấy storeId từ userProfile:', error);
    }
  }

  onSearch(): void {
    console.log('Search params:', {
      startDate: this.startDate,
      endDate: this.endDate,
      storeId: this.selectedStore
    });
    this.loadDashboardData();
  }

  private getParams(): any {
    const params: any = {
      startDate: this.startDate,
      endDate: this.endDate
    };
    // Luôn gửi storeId từ localStorage
    if (this.selectedStore) {
      params.storeId = this.selectedStore;
    }
    return params;
  }

  loadDashboardData(): void {
    this.isLoading = true;
    const params = this.getParams();

    console.log('Loading dashboard data with params:', params);

    // Load all data
    this.loadGeneralData(params);
    this.loadBookingStatus(params);
    this.loadCarByBrand(params);
    this.loadRevenueByBrand(params);
    this.loadTop5Brands(params);
    this.loadRevenueByTime(params);
  }

  loadGeneralData(params: any): void {
    this.http.get<any>(`${this.apiUrl}/general`, { params }).subscribe({
      next: (response) => {
        console.log('General data response:', response);
        if (response && response.data) {
          this.generalData = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading general data:', error);
        this.generalData = {
          totalCar: 0,
          totalCarSold: 0,
          totalCarNotSold: 0,
          totalSchedule: 0,
          totalFavourite: 0
        };
      }
    });
  }

  loadBookingStatus(params: any): void {
    this.http.get<any>(`${this.apiUrl}/booking-status`, { params }).subscribe({
      next: (response) => {
        console.log('Booking status response:', response);
        if (response && response.data) {
          this.bookingStatusData = response.data;
          this.initBookingStatusChart(response.data);
          this.updateBookingStatusLegend(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading booking status:', error);
        this.initBookingStatusChart([]);
      }
    });
  }

  loadCarByBrand(params: any): void {
    this.http.get<any>(`${this.apiUrl}/car-by-brand`, { params }).subscribe({
      next: (response) => {
        console.log('Car by brand response:', response);
        if (response && response.data) {
          this.initCarByBrandChart(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading car by brand:', error);
        this.initCarByBrandChart([]);
      }
    });
  }

  loadRevenueByBrand(params: any): void {
    this.http.get<any>(`${this.apiUrl}/revenue-by-brand`, { params }).subscribe({
      next: (response) => {
        console.log('Revenue by brand response:', response);
        if (response && response.data) {
          this.initRevenueByBrandChart(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading revenue by brand:', error);
        this.initRevenueByBrandChart([]);
      }
    });
  }

  loadTop5Brands(params: any): void {
    this.http.get<any>(`${this.apiUrl}/top5-brands`, { params }).subscribe({
      next: (response) => {
        console.log('Top 5 brands response:', response);
        if (response && response.data) {
          this.initTop5BrandsChart(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading top 5 brands:', error);
        this.initTop5BrandsChart([]);
      }
    });
  }

  loadRevenueByTime(params: any): void {
    this.http.get<any>(`${this.apiUrl}/revenue-by-time`, { params }).subscribe({
      next: (response) => {
        console.log('Revenue by time response:', response);
        if (response && response.data) {
          this.initRevenueByTimeChart(response.data);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading revenue by time:', error);
        this.initRevenueByTimeChart([]);
        this.isLoading = false;
      }
    });
  }

  // ==================== CHART METHODS ====================

  updateBookingStatusLegend(data: BookingStatusResponse[]): void {
    const statusMap: { [key: number]: string } = {
      0: 'pending-percent',
      1: 'confirmed-percent',
      2: 'completed-percent',
      3: 'cancelled-percent'
    };

    // Reset all to 0%
    Object.values(statusMap).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '0%';
    });

    // Update with actual data
    data.forEach(item => {
      const elementId = statusMap[item.status];
      if (elementId) {
        const el = document.getElementById(elementId);
        if (el) el.textContent = `${item.percentage.toFixed(1)}%`;
      }
    });
  }

  initBookingStatusChart(data: BookingStatusResponse[]): void {
    const canvas = document.getElementById('inventory-ratio-chart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas inventory-ratio-chart not found');
      return;
    }

    if (this.charts['booking-status']) {
      this.charts['booking-status'].destroy();
    }

    const statusLabels = ['Chờ xác nhận', 'Đã xác nhận', 'Đã hoàn thành', 'Đã hủy'];
    const colors = ['#f0f2f5', '#00bcd4', '#4caf50', '#f44336'];

    // Create full dataset with all 4 statuses
    const fullData = [0, 0, 0, 0];
    data.forEach(d => {
      if (d.status >= 0 && d.status <= 3) {
        fullData[d.status] = d.percentage;
      }
    });

    this.charts['booking-status'] = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: statusLabels,
        datasets: [{
          data: fullData,
          backgroundColor: colors,
          hoverOffset: 4,
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${ctx.parsed}%`
            }
          },
          datalabels: { display: false }
        },
        cutout: '70%'
      }
    });
  }

  initCarByBrandChart(data: TotalCarByBrandResponse[]): void {
    const canvas = document.getElementById('inventory-by-channel-chart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas inventory-by-channel-chart not found');
      return;
    }

    if (this.charts['car-by-brand']) {
      this.charts['car-by-brand'].destroy();
    }

    this.charts['car-by-brand'] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.map(d => d.brandName || 'Unknown'),
        datasets: [{
          data: data.map(d => d.totalCar),
          backgroundColor: '#667eea',
          barPercentage: 0.5,
          categoryPercentage: 0.6,
          borderRadius: 5,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#777', font: { size: 10 } }
          },
          y: {
            grid: { display: false },
            ticks: { display: false },
            beginAtZero: true
          }
        }
      }
    });
  }

  initRevenueByBrandChart(data: RevenueByBrandResponse[]): void {
    const canvas = document.getElementById('revenue-by-channel-chart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas revenue-by-channel-chart not found');
      return;
    }

    if (this.charts['revenue-by-brand']) {
      this.charts['revenue-by-brand'].destroy();
    }

    this.charts['revenue-by-brand'] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.map(d => d.brandName || 'Unknown'),
        datasets: [{
          data: data.map(d => d.total),
          backgroundColor: '#667eea',
          barPercentage: 0.7,
          categoryPercentage: 0.8,
          borderRadius: 5,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => this.formatCurrency(ctx.parsed.y ?? 0)
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#777' }
          },
          y: {
            grid: { color: '#eee' },
            ticks: {
              color: '#777',
              callback: (value) => this.formatShortCurrency(Number(value))
            },
            beginAtZero: true
          }
        }
      }
    });
  }

  initTop5BrandsChart(data: Top5BestCarBrandResponse[]): void {
    const canvas = document.getElementById('fill-rate-chart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas fill-rate-chart not found');
      return;
    }

    if (this.charts['top5-brands']) {
      this.charts['top5-brands'].destroy();
    }

    // Đổi sang bar chart horizontal cho Top 5
    this.charts['top5-brands'] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.map(d => d.brandName || 'Unknown'),
        datasets: [{
          data: data.map(d => d.total),
          backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'],
          borderRadius: 5,
          barPercentage: 0.6,
        }]
      },
      options: {
        indexAxis: 'y', // Horizontal bar
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: { display: false }
        },
        scales: {
          x: {
            grid: { color: '#eee' },
            ticks: { color: '#777' },
            beginAtZero: true
          },
          y: {
            grid: { display: false },
            ticks: { color: '#777' }
          }
        }
      }
    });
  }

  initRevenueByTimeChart(data: RevenueByTimeResponse[]): void {
    const canvas = document.getElementById('revenue-by-time-chart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas revenue-by-time-chart not found');
      return;
    }

    if (this.charts['revenue-by-time']) {
      this.charts['revenue-by-time'].destroy();
    }

    // Convert timestamp to readable date
    const labels = data.map(d => {
      const date = new Date(d.time);
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    });

    this.charts['revenue-by-time'] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: data.map(d => d.price),
          backgroundColor: '#667eea',
          barPercentage: 0.7,
          categoryPercentage: 0.8,
          borderRadius: 5,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => this.formatCurrency(ctx.parsed.y ?? 0)
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#777' }
          },
          y: {
            grid: { color: '#eee' },
            ticks: {
              color: '#777',
              callback: (value) => this.formatShortCurrency(Number(value))
            },
            beginAtZero: true
          }
        }
      }
    });
  }

  // ==================== HELPER METHODS ====================

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  }

  formatShortCurrency(value: number): string {
    if (value >= 1000000000) {
      return (value / 1000000000).toFixed(1) + ' tỷ';
    } else if (value >= 1000000) {
      return (value / 1000000).toFixed(0) + ' tr';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(0) + 'k';
    }
    return value.toString();
  }
}