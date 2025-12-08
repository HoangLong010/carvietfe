import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CarFavoriteInfo, FavoriteService } from '../../../core/services/favorite.service';

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

  constructor(
    private favoriteService: FavoriteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
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
        this.errorMessage = 'Không thể tải danh sách yêu thích';
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
            alert('Đã xóa khỏi danh sách yêu thích');
          }
        },
        error: (error) => {
          console.error('Error removing favorite:', error);
          alert('Có lỗi xảy ra khi xóa yêu thích');
        }
      });
    }
  }

  viewCarDetail(carId: string): void {
    this.router.navigate(['/car-detail', carId]);
  }

  // Hàm format giá tiền
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN').format(price);
  }

  // // Hàm lấy ảnh mặc định nếu không có ảnh
  // getCarImage(car: CarFavoriteInfo): string {
  //   return car.imageUrl || 'assets/images/default-car.jpg';
  // }
}