import { Component, OnInit } from '@angular/core';
import { Brand, BrandService, CreateBrandRequest, UpdateBrandRequest } from '../../../../core/services/brand.service';

@Component({
  selector: 'app-brand',
  standalone: false,
  templateUrl: './brand.component.html',
  styleUrl: './brand.component.scss'
})
export class BrandComponent implements OnInit {
  brands: Brand[] = [];
  currentBrand: Brand = { id: '', brandName: '', dealerId: '' };
  isEditing = false;
  showForm = false;
  brandName = '';
  searchBrandName = '';
  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;

  constructor(private brandService: BrandService) { }

  ngOnInit(): void {
    this.loadBrands();
  }

  loadBrands(): void {
    this.brandService.getAllBrands(this.searchBrandName, this.page, this.size).subscribe({
      next: (response) => {
        if (response.success) {
          this.brands = response.data.content;
          this.totalElements = response.data.totalElements;
          this.totalPages = response.data.totalPages;
        } else {
          console.error('Failed to load brands', response);
        }
      },
      error: (error) => {
        console.error('Error loading brands', error);
      }
    });
  }

  onSearch(): void {
    this.page = 0;
    this.loadBrands();
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.loadBrands();
  }

  onSubmit(): void {
    if (this.isEditing) {
      const request: UpdateBrandRequest = {
        brandName: this.brandName
      };
      this.brandService.updateBrand(this.currentBrand.id, request).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadBrands();
            this.resetForm();
          } else {
            console.error('Failed to update brand', response);
          }
        },
        error: (error) => {
          console.error('Error updating brand', error);
        }
      });
    } else {
      const request: CreateBrandRequest = {
        brandName: this.brandName
      };
      this.brandService.createBrand(request).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadBrands();
            this.resetForm();
          } else {
            console.error('Failed to create brand', response);
          }
        },
        error: (error) => {
          console.error('Error creating brand', error);
        }
      });
    }
  }

  editBrand(brand: Brand): void {
    this.isEditing = true;
    this.currentBrand = { ...brand };
    this.brandName = brand.brandName;
    this.showForm = true;
  }

  deleteBrand(brand: Brand): void {
    if (confirm(`Bạn có chắc chắn muốn xóa nhãn hàng "${brand.brandName}"?`)) {
      this.brandService.deleteBrand(brand.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadBrands();
          } else {
            console.error('Failed to delete brand', response);
          }
        },
        error: (error) => {
          console.error('Error deleting brand', error);
        }
      });
    }
  }

  resetForm(): void {
    this.isEditing = false;
    this.showForm = false;
    this.currentBrand = { id: '', brandName: '', dealerId: '' };
    this.brandName = '';
  }

  addBrand(): void {
    this.resetForm();
    this.showForm = true;
  }
}