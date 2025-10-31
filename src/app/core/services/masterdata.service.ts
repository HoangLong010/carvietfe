import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/enviroment';

// --- INTERFACES (Giữ nguyên) ---

/** Giao diện cho một đối tượng Hãng xe (Brand) */
export interface BrandItem {
  id: string;
  name: string;
}

/** Giao diện chung cho phản hồi API danh sách Hãng xe */
export interface BrandSelectResponse {
  data: BrandItem[];
  success: boolean;
  code: number;
  error_code: number;
  message: string;
  description: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class MasterDataService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Lấy danh sách Hãng xe theo Dealer ID (truyền qua Header).
   * API: GET /select/brand
   * @param dealerId ID Đại lý để lọc (Bắt buộc theo API curl).
   * @returns Observable chứa BrandSelectResponse.
   */
  getBrandsForSelection(dealerId: string): Observable<BrandSelectResponse> {
    // 1. Thiết lập Header để truyền dealerId
    let headers = new HttpHeaders();
    headers = headers.set('dealerId', dealerId);

    // 2. Thực hiện cuộc gọi API GET, truyền Header
    // GET không có body, nên ta chỉ truyền URL và cấu hình { headers }
    return this.http.get<BrandSelectResponse>(
      `${this.apiUrl}/select/brand`, 
      { headers: headers } // Truyền Header
    );
  }

  // Thêm các hàm lấy Master Data khác tại đây
}