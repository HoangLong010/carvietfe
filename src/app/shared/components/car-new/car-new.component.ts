import { Component, OnInit } from '@angular/core';
import { CarService, CarResponseItem } from '../../../core/services/car.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-car-new',
  standalone: false,
  templateUrl: './car-new.component.html',
  styleUrl: './car-new.component.scss'
})
export class CarNewComponent implements OnInit {
  cars: CarResponseItem[] = [];
  currentPage: number = 0;
  pageSize: number = 10;
  pagesCount: number = 1;

  constructor(private carService: CarService, private router: Router) {}

  ngOnInit(): void {
    this.loadCars();
  }

  loadCars(page: number = 0): void {
    // FIX: Gửi undefined cho dealerId (Arg 3) và title (Arg 4)
    // để giá trị 1 (status) nằm đúng ở Arg 5.
    this.carService.getCars(
      page, 
      this.pageSize, 
      undefined, // dealerId (string)
      undefined, // title (string)
      1          // status (number) - Xe mới
    ).subscribe(res => {
      if (res && res.data && res.data.content) {
        this.cars = res.data.content;
        this.currentPage = res.data.currentPage;
        this.pagesCount = res.data.pagesCount || 1;
      }
    });
  }

  goToDetail(id: string, status?: number) {
    this.router.navigate(['/detail-car'], { queryParams: { id } }).then(() => window.scrollTo(0, 0));
  }
}
