import { Component, OnInit } from '@angular/core';
import { CarService, CarResponseItem } from '../../../core/services/car.service';
import { Router } from '@angular/router';
import { ApiResponse, FavoriteCarResponse, FavoriteService, UserFavoritesResponse } from '../../../core/services/favorite.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  cars: CarResponseItem[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  pagesCount: number = 1;
  currentTotalElementsCount: number = 0;

  // Biến filter với các thuộc tính khớp với API
  filter: any = {
    title: '',
    location: '',
    year: null,
    status: null,
    minPrice: null,
    maxPrice: null,
    bodyStyle: '',
    seats: null,
    brandId: null,
    color: null,
    origin: null,
    fuelType: null,
  };

  searchInput: string = '';

  // Các option cho dropdown và filter
  priceRanges = [
    { label: 'Dưới 300 triệu', min: null, max: 300000000 },
    { label: '300 - 500 triệu', min: 300000000, max: 500000000 },
    { label: '500 - 700 triệu', min: 500000000, max: 700000000 },
    { label: '700 triệu - 1 tỷ', min: 700000000, max: 1000000000 },
    { label: '1 tỷ - 2 tỷ', min: 1000000000, max: 2000000000 },
    { label: 'Trên 2 tỷ', min: 2000000000, max: null }
  ];
  showProvinceModal = false;
  showYearModal = false;

  toastMessage: string = '';
  toastType: 'success' | 'error' | 'warning' | 'info' = 'error';
  showToast: boolean = false;

  constructor(private carService: CarService,
    private router: Router,
    private favoriteService: FavoriteService,
    private authService: AuthService) { }

  goToDetail(id: string, status?: number) {
    this.router.navigate(['/detail-car'], { queryParams: { id } }).then(() => window.scrollTo(0, 0));
  }

  ngOnInit(): void {
    this.checkAuthStatus();
    this.loadCars();
    this.setupFilterListeners();
  }

  checkAuthStatus(): void {
    console.log('=== Auth Status ===');
    console.log('isLoggedIn:', this.authService.isLoggedIn());
    console.log('userId:', this.authService.getUserId());
    console.log('accessToken exists:', !!this.authService.getAccessToken());
    console.log('userProfile:', this.authService.getUserProfile());
    console.log('===================');
  }

  // Setup event listeners cho các filter trong giao diện
  setupFilterListeners(): void {
    // Lắng nghe sự kiện click trên các nút filter
    setTimeout(() => {
      this.attachLocationFilters();
      this.attachYearFilters();
      this.attachStatusFilters();
      this.attachPriceFilters();
      this.attachBodyStyleFilters();
      this.attachSeatsFilters();
    }, 100);
  }

  // Gắn sự kiện cho filter khu vực
  attachLocationFilters(): void {
    const locationButtons = document.querySelectorAll('.filter-section:first-of-type .filter-buttons button');
    const modalLocationButtons = document.querySelectorAll('.province-list button');

    locationButtons.forEach((btn: any) => {
      btn.addEventListener('click', () => {
        const location = btn.textContent.trim();
        this.onSelectLocation(location === 'Tất cả' ? '' : location);
        this.setActiveButton(locationButtons, btn);
      });
    });

    modalLocationButtons.forEach((btn: any) => {
      btn.addEventListener('click', () => {
        const location = btn.textContent.trim();
        this.onSelectLocation(location === 'Tất cả' ? '' : location);
        this.setActiveButton(modalLocationButtons, btn);
        // Đóng modal
        (document.getElementById('province-modal') as any).style.display = 'none';
      });
    });
  }

  timeSince(dateString?: string | null): string {
    const now = new Date();
    if (!dateString) {
      return 'Chưa xác định';
    }
    // Tạo đối tượng Date từ chuỗi, thay thế khoảng trắng bằng 'T' để hỗ trợ định dạng ISO
    const createdDate = new Date(dateString.replace(' ', 'T'));

    if (isNaN(createdDate.getTime())) {
      // Trả về ngày tháng nếu chuỗi không hợp lệ hoặc quá xa
      return createdDate.toLocaleDateString('vi-VN');
    }

    const seconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval >= 1) {
      return Math.floor(interval) + " năm trước";
    }
    interval = seconds / 2592000;
    if (interval >= 1) {
      return Math.floor(interval) + " tháng trước";
    }
    interval = seconds / 86400;
    if (interval >= 1) {
      return Math.floor(interval) + " ngày trước";
    }
    interval = seconds / 3600;
    if (interval >= 1) {
      return Math.floor(interval) + " giờ trước";
    }
    interval = seconds / 60;
    if (interval >= 1) {
      return Math.floor(interval) + " phút trước";
    }
    return Math.floor(seconds) <= 5 ? "Vừa xong" : Math.floor(seconds) + " giây trước";
  }

  // Gắn sự kiện cho filter năm sản xuất
  attachYearFilters(): void {
    const yearButtons = document.querySelectorAll('.filter-section:nth-of-type(2) .filter-buttons button:not(#show-year-modal)');
    const modalYearButtons = document.querySelectorAll('.year-list-grid button');

    yearButtons.forEach((btn: any) => {
      btn.addEventListener('click', () => {
        const year = btn.textContent.trim();
        this.onSelectYear(year === 'Tất cả' ? '' : year);
        this.setActiveButton(yearButtons, btn);
      });
    });

    modalYearButtons.forEach((btn: any) => {
      btn.addEventListener('click', () => {
        const year = btn.textContent.trim();
        this.onSelectYear(year === 'Tất cả' ? '' : year);
        this.setActiveButton(modalYearButtons, btn);
        // Đóng modal
        (document.getElementById('year-modal') as any).style.display = 'none';
      });
    });
  }

  // Gắn sự kiện cho filter trạng thái xe
  attachStatusFilters(): void {
    const statusRadios = document.querySelectorAll('input[name="status"]');
    statusRadios.forEach((radio: any, index: number) => {
      radio.addEventListener('change', () => {
        // 0: Xe cũ, 1: Xe mới (theo thứ tự trong HTML)
        this.onSelectStatus(index === 0 ? '2' : '1'); // API: 1=mới, 2=cũ
      });
    });
  }

  // Gắn sự kiện cho filter khoảng giá
  attachPriceFilters(): void {
    const priceRadios = document.querySelectorAll('input[name="price"]');
    priceRadios.forEach((radio: any, index: number) => {
      radio.addEventListener('change', () => {
        const range = this.priceRanges[index];
        this.onSelectPrice(range.min, range.max);
      });
    });
  }

  // Gắn sự kiện cho filter kiểu dáng
  attachBodyStyleFilters(): void {
    const bodyStyleRadios = document.querySelectorAll('input[name="body"]');
    bodyStyleRadios.forEach((radio: any) => {
      radio.addEventListener('change', () => {
        const label = radio.parentElement.textContent.trim();
        this.onSelectBodyStyle(label);
      });
    });
  }

  // Gắn sự kiện cho filter số chỗ ngồi
  attachSeatsFilters(): void {
    const seatsRadios = document.querySelectorAll('input[name="seat"]');
    seatsRadios.forEach((radio: any) => {
      radio.addEventListener('change', () => {
        const label = radio.parentElement.textContent.trim();
        const seats = parseInt(label);
        this.onSelectSeats(isNaN(seats) ? null : seats);
      });
    });
  }

  // Helper để set active button
  setActiveButton(buttons: any, activeBtn: any): void {
    buttons.forEach((b: any) => b.classList.remove('active'));
    activeBtn.classList.add('active');
  }

  // Load danh sách xe với filter
  loadCars(page: number = 0): void {
    this.currentPage = page;

    // Chuẩn bị các tham số
    const titleParam = this.filter.title || undefined;
    const statusParam = (this.filter.status !== null && this.filter.status !== '') ? Number(this.filter.status) : undefined;
    const locationParam = this.filter.location || undefined;
    const minPriceParam = this.filter.minPrice || undefined;
    const maxPriceParam = this.filter.maxPrice || undefined;
    const yearParam = this.filter.year ? Number(this.filter.year) : undefined;
    const bodyStyleParam = this.filter.bodyStyle || undefined;
    const seatsParam = this.filter.seats || undefined;
    const brandIdParam = this.filter.brandId || undefined;
    const colorParam = this.filter.color || undefined;
    const originParam = this.filter.origin || undefined;
    const fuelTypeParam = this.filter.fuelType || undefined;

    // Gọi API - KHÔNG truyền dealerId vào header để lấy tất cả
    this.carService.getCars(
      page,
      this.pageSize,
      undefined,         // dealerId = undefined để lấy tất cả
      titleParam,
      statusParam,
      minPriceParam,
      maxPriceParam,
      yearParam,
      brandIdParam,
      colorParam,
      bodyStyleParam,
      originParam,
      fuelTypeParam,
      seatsParam,
      locationParam
    ).subscribe(res => {
      if (res && res.data && res.data.content) {
        this.cars = res.data.content;
        this.currentPage = res.data.currentPage;
        this.pagesCount = res.data.pagesCount || 1;
        this.currentTotalElementsCount = res.data.currentTotalElementsCount || 0;
        this.pageSize = res.data.pageSize;
      } else {
        this.cars = [];
      }
    }, error => {
      console.error('Lỗi khi tải danh sách xe:', error);
      this.cars = [];
    });
  }

  // Các hàm xử lý filter
  onSearchTitle(): void {
    this.filter.title = this.searchInput;
    this.loadCars(0);
  }

  onSelectLocation(location: string): void {
    this.filter.location = location;
    this.loadCars(0);
  }

  onSelectYear(year: string): void {
    this.filter.year = year ? Number(year) : null;
    this.loadCars(0);
  }

  onSelectStatus(status: string): void {
    this.filter.status = status ? Number(status) : null;
    this.loadCars(0);
  }

  onSelectPrice(min: number | null, max: number | null): void {
    this.filter.minPrice = min;
    this.filter.maxPrice = max;
    this.loadCars(0);
  }

  onSelectBodyStyle(style: string): void {
    this.filter.bodyStyle = style;
    this.loadCars(0);
  }

  onSelectSeats(seats: number | null): void {
    this.filter.seats = seats;
    this.loadCars(0);
  }

  // Reset tất cả filter
  resetFilters(): void {
    this.filter = {
      title: '',
      location: '',
      year: null,
      status: null,
      minPrice: null,
      maxPrice: null,
      bodyStyle: '',
      seats: null,
      brandId: null,
      color: null,
      origin: null,
      fuelType: null,
    };
    this.searchInput = '';
    this.loadCars(0);
  }

  // Toggle yêu thích
  toggleFavorite(carId: string, event: Event): void {
    event.stopPropagation();

    if (!this.authService.isLoggedIn()) {
      this.toastMessage = 'Vui lòng đăng nhập để sử dụng tính năng yêu thích';
      this.toastType = 'warning';
      this.showToast = true;
      return;
    }

    this.favoriteService.toggleFavorite(carId).subscribe({
      next: (res: ApiResponse<FavoriteCarResponse>) => {
        if (res.success && res.data) {
          const car = this.cars.find(c => c.carId === carId);
          if (car) {
            car.isFavorite = res.data.favorite;
          }
          console.log('Toggle favorite:', res.data.message);
        }
      },
      error: (err) => {
        console.error('Lỗi khi toggle favorite:', err);
        this.toastMessage = 'Có lỗi xảy ra khi thực hiện thao tác';
        this.toastType = 'error';
        this.showToast = true;
      }
    });
  }

  onToastClosed(): void {
    this.showToast = false;
    this.toastMessage = '';
  }
}