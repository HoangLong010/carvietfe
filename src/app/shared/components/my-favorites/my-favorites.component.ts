import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CarFavoriteInfo, FavoriteService } from '../../../core/services/favorite.service';
import { AuthService } from '../../../core/services/auth.service';

interface FavoriteCar {
  carId: string;
  carName?: string;
  carImage?: string;
  price?: number;
  year?: number;
  brand?: string;
}

@Component({
  selector: 'app-my-favorites',
  standalone: false,
  templateUrl: './my-favorites.component.html',
  styleUrls: ['./my-favorites.component.scss']
})
export class MyFavoritesComponent implements OnInit {
  favoriteCars: CarFavoriteInfo[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  userId: string = '';

  // Biến để quản lý Toast Notification
  toastMessage: string = ''; 
  toastType: 'success' | 'error' | 'warning' | 'info' = 'error'; 
  showToast: boolean = false; 

  constructor(
    private favoriteService: FavoriteService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
    // this.loadUserId();
  }

  // loadUserId() {
  //   debugger;
  //   this.userId = this.authService.getUserId() || '';
  //   if (!this.userId) {
  //     debugger
  //     this.router.navigate(['/auth/login']);
  //   }
  // }

  loadFavorites(): void {
    debugger
    this.loading = true;
    this.favoriteService.getUserFavorites().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.favoriteCars = response.data.favoriteCars;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading favorites:', error);
        this.toastMessage = 'Không thể tải danh sách yêu thích';
        this.toastType = 'error';
        this.showToast = true;
        this.loading = false;
      }
    });
  }

  removeFavorite(carId: string): void {
    if (confirm('Bạn có chắc muốn xóa xe này khỏi danh sách yêu thích?')) {
      this.favoriteService.toggleFavorite(carId).subscribe({
        next: (response) => {
          if (response.success) {
            this.favoriteCars = this.favoriteCars.filter(car => car.carId !== carId);
            this.toastMessage = 'Đã xóa khỏi danh sách yêu thích';
            this.toastType = 'success';
            this.showToast = true;
          }
        },
        error: (error) => {
          console.error('Error removing favorite:', error);
          this.toastMessage = 'Có lỗi xảy ra khi xóa yêu thích';
          this.toastType = 'error';
          this.showToast = true;
        }
      });
    }
  }

  onToastClosed(): void {
    this.showToast = false;
    this.toastMessage = '';
  }

  goToCarDetail(carId: string) {
    this.router.navigate(['/detail-car'], { queryParams: { id: carId } });
  }

  // Hàm format giá tiền
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN').format(price);
  }

  // Hàm lấy ảnh mặc định nếu không có ảnh
  getCarImage(car: CarFavoriteInfo): string {
    return car.imageUrl || 'assets/images/default-car.jpg';
  }
}