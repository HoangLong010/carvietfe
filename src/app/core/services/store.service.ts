import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/enviroment';

export interface Store {
  id: string;
  storeName: string;
  address: string;
  carSold: number | null;
  carAvailable: number | null;
  bannerUrl: string;
  logoUrl: string;
}

// store.service.ts (Phần cập nhật)

export interface CarImage {
    id: string;
    carId: string;
    imageUrl: string;
}

export interface CarDetail {
    id: string;
    storeId: string;
    name: string;
    price: number;
    seat: number;
    mileage: number;
    transmission: string; // Hộp số
    fuelType: string; // Nhiên liệu
    origin: string;
    airbags: number;
    images: CarImage[]; // Trường mới từ API mẫu
    
    // Trường ảo (virtual property) để hiển thị, sẽ được gán trong component
    imageUrl?: string; 
    postedTime?: string; // Giữ lại để gán logic thời gian đăng
}

// ... (Các interfaces khác như DetailStore, DetailStoreApiResponse giữ nguyên)

// Interface cho chi tiết cửa hàng (Phần data trong response chi tiết)
export interface DetailStore {
    id: string;
    createdDate: string;
    storeName: string;
    address: string;
    phone: string;
    carSold: number;
    carAvailable: number;
    carSoldList: CarDetail[];
    carAvailableList: CarDetail[];
    // Thêm các trường thiếu để hiển thị:
    bannerUrl: string; // Banner
    logoUrl: string; // Logo
    // Thêm các thông tin chính sách, mô tả nếu có trong API thật
    policies?: string[];
}

// Interface cho toàn bộ phản hồi API chi tiết cửa hàng
export interface DetailStoreApiResponse {
    data: DetailStore;
    success: boolean;
    code: number;
    message: string;
}

// 2. Định nghĩa Interface cho toàn bộ phản hồi API
export interface StoreApiResponse {
  content: Store[];
  currentPage: number;
  pageSize: number;
  currentTotalElementsCount: number;
  pagesCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  sumTotalBill: number;
  sumTotalTransferMoney: number;
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {
//   private apiUrl = 'localhost:8080/api/v1/store/get-all'; // Giả sử chạy qua proxy hoặc URL đầy đủ

  constructor(private http: HttpClient) { }

  /**
   * Lấy danh sách cửa hàng. Hỗ trợ tham số tìm kiếm theo địa chỉ (address).
   * @param address Chuỗi tìm kiếm địa chỉ. Mặc định là 'null' theo yêu cầu curl.
   * @returns Observable<StoreApiResponse>
   */
  getAllStores(address: string = '', page: number = 0): Observable<StoreApiResponse> {
    let params = new HttpParams();
    // Thêm tham số address
    params = params.set('address', address); 
    // Thêm tham số page (sử dụng 'page' làm tên tham số API)
    params = params.set('page', page.toString()); 
    // Bạn có thể thêm tham số kích thước trang (pageSize) nếu cần
    // params = params.set('size', '10'); 

    return this.http.get<StoreApiResponse>(`${environment.apiUrl}/store/get-all`, { params });
  }

  getStoreDetail(storeId: string): Observable<DetailStoreApiResponse> {
        const url = `${environment.apiUrl}/store/detail/${storeId}`;
        return this.http.get<DetailStoreApiResponse>(url);
    }
}