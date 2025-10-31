import { Component, OnInit } from '@angular/core';
import { CarService, CarResponseItem } from '../../../core/services/car.service';
import { Router } from '@angular/router';

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

  // Thêm biến filter
  filter: any = { 
    title: '',
    location: '',
    year: null, // Dùng null hoặc number
    status: null, // Dùng null hoặc number
    minPrice: null,
    maxPrice: null,
    bodyStyle: '', // Đã sửa tên biến để khớp với API (bodyStyle)
    seats: null,
    brandId: null,
    color: null,
    origin: null,
    fuelType: null,
  };

  searchInput: string = '';

  constructor(private carService: CarService, private router: Router) {}

  goToDetail(id: string, status?: number) {
    this.router.navigate(['/detail-car'], { queryParams: { id } }).then(() => window.scrollTo(0, 0));
  }

  ngOnInit(): void {
    this.loadCars();
  }

  // Sửa hàm loadCars để truyền tất cả 14 tham số vị trí
  loadCars(page: number = 0): void {
    this.currentPage = page;

    // Ánh xạ và chuẩn bị các giá trị filter
    const titleParam = this.filter.title || undefined;
    const statusParam = (this.filter.status !== null && this.filter.status !== '') ? Number(this.filter.status) : undefined;
    const locationParam = this.filter.location || undefined;
    
    // Các tham số Query khác
    const minPriceParam = this.filter.minPrice || undefined;
    const maxPriceParam = this.filter.maxPrice || undefined;
    const yearParam = this.filter.year ? Number(this.filter.year) : undefined;
    const bodyStyleParam = this.filter.bodyStyle || undefined; 
    const seatsParam = this.filter.seats || undefined;
    
    const brandIdParam = this.filter.brandId || undefined;
    const colorParam = this.filter.color || undefined;
    const originParam = this.filter.origin || undefined;
    const fuelTypeParam = this.filter.fuelType || undefined;
    
    // GỌI SERVICE VỚI DANH SÁCH THAM SỐ VỊ TRÍ (14 tham số)
    this.carService.getCars(
      page,
      this.pageSize,
      undefined,         // 1. dealerId (Header - KHÔNG CÓ TRONG FILTER NÀY)
      titleParam,        // 2. title (RequestParam)
      statusParam,       // 3. status (RequestParam)
      minPriceParam,     // 4. minPrice (RequestParam)
      maxPriceParam,     // 5. maxPrice (RequestParam)
      yearParam,         // 6. year (RequestParam)
      brandIdParam,      // 7. brandId (RequestParam)
      colorParam,        // 8. color (RequestParam)
      bodyStyleParam,    // 9. bodyStyle (RequestParam)
      originParam,       // 10. origin (RequestParam)
      fuelTypeParam,     // 11. fuelType (RequestParam)
      seatsParam,        // 12. seats (RequestParam)
      locationParam      // 13. location (RequestParam)
    ).subscribe(res => {
      if (res && res.data && res.data.content) {
        this.cars = res.data.content;
        this.currentPage = res.data.currentPage;
        this.pagesCount = res.data.pagesCount || 1;
      } else {
         this.cars = []; 
      }
    }, error => {
        console.error('Lỗi khi tải danh sách xe:', error);
        this.cars = [];
    });
  }

  // Các hàm lọc
  onSearchTitle() {
    this.filter.title = this.searchInput;
    this.loadCars(0);
  }

  onSelectLocation(location: string) {
    this.filter.location = location;
    this.loadCars(0);
  }

  onSelectYear(year: string) {
    this.filter.year = year ? Number(year) : null; 
    this.loadCars(0);
  }

  onSelectStatus(status: string) {
    this.filter.status = status ? Number(status) : null; 
    this.loadCars(0);
  }

  onSelectPrice(min: number|null, max: number|null) {
    this.filter.minPrice = min;
    this.filter.maxPrice = max;
    this.loadCars(0);
  }

  onSelectBodyStyle(style: string) {
    // Đảm bảo đồng bộ với filter.bodyStyle ở trên
    this.filter.bodyStyle = style; 
    this.loadCars(0);
  }

  onSelectSeats(seats: number|null) {
    this.filter.seats = seats;
    this.loadCars(0);
  }
}
