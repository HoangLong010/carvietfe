import { Component, OnInit } from '@angular/core';
import { CarService, CarResponseItem } from '../../../core/services/car.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-car-old',
  standalone: false,
  templateUrl: './car-old.component.html',
  styleUrl: './car-old.component.scss'
})
export class CarOldComponent implements OnInit {
  cars: CarResponseItem[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  pagesCount: number = 1;
  currentTotalElementsCount: number = 0;

  constructor(private carService: CarService, private router: Router) {}

  ngOnInit(): void {
    this.loadCars();
  }

  loadCars(page: number = 0): void {
    // FIX: Gửi undefined cho dealerId (Arg 3) và title (Arg 4)
    // để giá trị 2 (status) nằm đúng ở Arg 5.
    this.carService.getCars(
      page, 
      this.pageSize, 
      undefined, // dealerId (string)
      undefined, // title (string)
      2          // status (number) - Xe cũ
    ).subscribe(res => {
      if (res && res.data && res.data.content) {
        this.cars = res.data.content;
        this.currentPage = res.data.currentPage;
        this.pagesCount = res.data.pagesCount || 1;
        this.currentTotalElementsCount = res.data.currentTotalElementsCount || 0;
        this.pageSize = res.data.pageSize;
      }
    });
  }

  goToDetail(id: string, status?: number) {
    this.router.navigate(['/detail-car'], { queryParams: { id } }).then(() => window.scrollTo(0, 0));
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
}
