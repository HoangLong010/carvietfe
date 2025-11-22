import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/enviroment';

// Interface cho dữ liệu cửa hàng trong quản lý
export interface StoreManagement {
  id: string;
  userId: string;
  storeName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  createdDate: string;
  carSold: number;
  carAvailable: number;
  totalCars: number;
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  totalFavorites: number;
}

// Interface cho phản hồi API
export interface StoreManagementApiResponse {
  content: StoreManagement[];
  currentPage: number;
  pageSize: number;
  currentTotalElementsCount: number;
  pagesCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  sumTotalBill: number;
  sumTotalTransferMoney: number;
}

// Interface cho payload cập nhật cửa hàng
export interface StoreUpdatePayload {
  storeName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
}

// Interface cho response API thông thường
interface ApiResponse {
  data?: any;
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
export class StoreManagementService {

  constructor(private http: HttpClient) { }

  /**
   * Lấy danh sách tất cả cửa hàng cho quản lý (Admin)
   */
  getAllStoresForManagement(
    storeName: string = '',
    address: string = '',
    page: number = 0,
    size: number = 10
  ): Observable<StoreManagementApiResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (storeName) {
      params = params.set('storeName', storeName);
    }
    if (address) {
      params = params.set('address', address);
    }

    return this.http.get<StoreManagementApiResponse>(
      `${environment.apiUrl}/admin/store-management`,
      { params }
    );
  }

  /**
   * Cập nhật thông tin cửa hàng
   */
  updateStore(storeId: string, payload: StoreUpdatePayload): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(
      `${environment.apiUrl}/admin/store-management/${storeId}`,
      payload
    );
  }

  /**
   * Xóa cửa hàng (soft delete)
   */
  deleteStore(storeId: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(
      `${environment.apiUrl}/admin/store-management/${storeId}`
    );
  }
}