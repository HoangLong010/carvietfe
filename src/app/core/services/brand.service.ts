// src/app/services/brand.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/enviroment';
import { AuthService } from './auth.service';

export interface Brand {
  id: string;
  brandName: string;
  dealerId: string;
  // Có thể thêm các trường khác nếu API trả về
}

export interface CreateBrandRequest {
  brandName: string;
  // Các trường khác nếu có
}

export interface UpdateBrandRequest {
  brandName: string;
  // Các trường khác nếu có
}

export interface ListBrandResponse {
  content: Brand[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class BrandService {

  private apiUrl = `${environment.apiUrl}/dealer-brand`;

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Lấy danh sách brand
  getAllBrands(brandName?: string, page: number = 0, size: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (brandName) {
      params = params.set('brandName', brandName);
    }

    const dealerId = this.authService.getUserId(); // Lấy dealerId từ localStorage

    return this.http.get<any>(`${this.apiUrl}/get-all`, {
      headers: this.getHeaders().set('dealerId', dealerId || ''),
      params
    });
  }

  // Tạo brand mới
  createBrand(request: CreateBrandRequest): Observable<any> {
    const dealerId = this.authService.getUserId();
    return this.http.post(`${this.apiUrl}/create`, request, {
      headers: this.getHeaders().set('dealerId', dealerId || '')
    });
  }

  // Cập nhật brand
  updateBrand(brandId: string, request: UpdateBrandRequest): Observable<any> {
    const dealerId = this.authService.getUserId();
    return this.http.post(`${this.apiUrl}/update/${brandId}`, request, {
      headers: this.getHeaders().set('dealerId', dealerId || '')
    });
  }

  // Xóa brand
  deleteBrand(brandId: string): Observable<any> {
    const dealerId = this.authService.getUserId();
    return this.http.post(`${this.apiUrl}/delete/${brandId}`, {}, {
      headers: this.getHeaders().set('dealerId', dealerId || '')
    });
  }
}