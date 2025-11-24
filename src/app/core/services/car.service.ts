import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/enviroment';
import { AuthService } from './auth.service';

// Giao diện cho một đối tượng xe nhận được từ API
export interface CarResponseItem {
  isExpanded?: boolean;
  carId: string;
  dealerId: string;
  description: string;
  title: string;
  brandId: string; // Hãng xe
  brandName: string;
  model: string;
  variant: string; // Phiên bản
  year: number; // Năm sản xuất
  price: number;
  status: number; // 1: Xe mới, 2: Xe cũ
  location: string;
  mileage: number; // Số km đã đi
  color: string;
  fuelType: string; // Loại nhiên liệu
  transmission: string; // Hộp số
  bodyStyle: string; // Kiểu thân xe
  origin: string; // Xuất xứ
  seats: number; // Số ghế
  horsepower: number; // Mã lực
  torque: number; // Mô-men xoắn  
  drivetrain: string; // Hệ dẫn động
  engineCapacity: number; // Dung tích động cơ
  engineType: string; // Loại động cơ
  fuelConsumption: number; // Tiêu thụ nhiên liệu
  airbags: number; // Túi khí
  registeredUntil: string; // Đăng kiểm đến ngày
  createdDate?: string;
  images: CarImage[];
  store: Store | null
  isFavorite?: boolean; // Trạng thái yêu thích
  sellStatus: number;
}

export interface Store {
  id: string;
  storeName: string; // Tên cửa hàng
  address: string;    // Địa chỉ cửa hàng
  phone: string;      // Số điện thoại cửa hàng
}

export interface CarImage {
  id: string;
  carId: string;
  imageUrl: string; // Đây là URL ảnh mà bạn cần
}

// Giao diện cho phần phân trang của phản hồi API danh sách xe
export interface CarPagination {
  content: CarResponseItem[];
  currentPage: number;
  pageSize: number;
  currentTotalElementsCount: number;
  pagesCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  sumTotalBill: number;
  sumTotalTransferMoney: number;
}

// Giao diện chung cho phản hồi API danh sách xe (get-all)
export interface CarListResponse {
  data: CarPagination;
  success: boolean;
  code: number;
  error_code: number;
  message: string;
  description: string;
  timestamp: number;
}

// Giao diện cho payload cập nhật xe (đã có dealerId trong đây rồi)
export interface CarUpdatePayload {
  title: string;
  description: string;
  brandId: string;
  model: string;
  variant: string;
  year: number;
  price: number;
  status: number;
  location: string;
  mileage: number;
  color: string;
  fuelType: string;
  transmission: string;
  bodyStyle: string;
  origin: string;
  seats: number;
  horsepower: number;
  torque: number;
  drivetrain: string;
  engineCapacity: number;
  engineType: string;
  fuelConsumption: number;
  airbags: number;
  registeredUntil: string;
  dealerId: string;
}

// Giao diện cho payload xóa mềm (soft delete)
export interface CarSoftDeletePayload {
  carId: string;
  deleted: boolean;
}

// Giao diện cho một đối tượng đại lý (nhận được từ API select)
export interface DealerItem {
  id: string;
  username: string; // Tên đại lý
}

// Giao diện chung cho phản hồi API danh sách đại lý (select)
export interface DealerSelectResponse {
  data: DealerItem[];
  success: boolean;
  code: number;
  error_code: number;
  message: string;
  description: string;
  timestamp: number;
}

// GIAO DIỆN CARSERVICEPARAMS ĐÃ BỊ LOẠI BỎ THEO YÊU CẦU

@Injectable({
  providedIn: 'root'
})
export class CarService {

  constructor(private http: HttpClient, private authService: AuthService) { }

  /**
   * Lấy danh sách xe theo tham số vị trí, khớp với chữ ký của API backend.
   * Tham số page/size luôn được yêu cầu. Các tham số lọc là tùy chọn.
   */
  getCars(
    page: number,
    size: number,
    dealerId?: string,     // RequestHeader
    title?: string,        // RequestParam
    status?: number,       // RequestParam
    minPrice?: number,     // RequestParam
    maxPrice?: number,     // RequestParam
    year?: number,         // RequestParam
    brandId?: string,      // RequestParam
    color?: string,        // RequestParam
    bodyStyle?: string,    // RequestParam
    origin?: string,       // RequestParam
    fuelType?: string,     // RequestParam
    seats?: number,        // RequestParam
    location?: string      // RequestParam
  ): Observable<CarListResponse> {

    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('size', size.toString());
    const userId = this.authService.getUserId();
    if (userId) {
      params = params.append('userId', userId);
    }
    let headers = new HttpHeaders();
    if (dealerId) {
      // Thêm dealerId vào header (khớp với @RequestHeader)
      headers = headers.set('dealerId', dealerId);
    }

    // Hàm tiện ích để thêm tham số nếu có giá trị
    const appendParam = (key: string, value: any) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'object' && !(value instanceof Date) && !Array.isArray(value)) {
          // Ngăn chặn lỗi [object Object] khi có lỗi lập trình
          console.error(`Lỗi lập trình: Giá trị cho tham số '${key}' là một object và bị bỏ qua.`);
          return;
        }
        params = params.append(key, value.toString());
      }
    };

    // Thêm tất cả các tham số RequestParam
    appendParam('title', title);
    appendParam('status', status);
    appendParam('minPrice', minPrice);
    appendParam('maxPrice', maxPrice);
    appendParam('year', year);
    appendParam('brandId', brandId);
    appendParam('color', color);
    appendParam('bodyStyle', bodyStyle);
    appendParam('origin', origin);
    appendParam('fuelType', fuelType);
    appendParam('seats', seats);
    appendParam('location', location);

    return this.http.get<CarListResponse>(`${environment.apiUrl}/car/get-all`, { params: params, headers: headers });
  }

  createCar(formData: FormData, dealerId: string): Observable<any> {
    let headers = new HttpHeaders();
    // BẮT BUỘC phải có dealerId trong Header theo curl
    headers = headers.set('dealerId', dealerId);

    // Không cần set Content-Type: multipart/form-data, HttpClient tự làm việc này khi gửi FormData
    return this.http.post(`${environment.apiUrl}/car/create`, formData, { headers });
  }

  // --- CÁC HÀM KHÁC GIỮ NGUYÊN (updateCar, deleteCar, getDealersForSelection) ---

  /**
   * Cập nhật thông tin một chiếc xe. Sử dụng POST nếu API update là POST.
   */
  updateCar(carId: string, formData: FormData, dealerId?: string): Observable<any> {
    let headers = new HttpHeaders();
    if (dealerId) {
      headers = headers.set('dealerId', dealerId);
    }
    return this.http.post(`${environment.apiUrl}/car/update/${carId}`, formData, { headers });
  }

  // Cập nhật trạng thái bán xe
  updateSellStatus(carId: string, sellStatus: number, dealerId?: string): Observable<any> {
    let headers = new HttpHeaders();
    if (dealerId) {
      headers = headers.set('dealerId', dealerId);
    }

    const params = new HttpParams().set('sellStatus', sellStatus.toString());

    return this.http.post(
      `${environment.apiUrl}/car/update-sell-status/${carId}`,
      null,
      { headers, params }
    );
  }


  /**
   * Xóa mềm một chiếc xe (cập nhật trạng thái deleted thành true). Sử dụng POST.
   */
  deleteCar(carId: string, dealerId?: string): Observable<any> {
    let headers = new HttpHeaders();
    if (dealerId) {
      headers = headers.set('dealerId', dealerId);
    }
    const softDeletePayload: CarSoftDeletePayload = {
      carId: carId,
      deleted: true
    };
    return this.http.post(`${environment.apiUrl}/car/delete/${carId}`, softDeletePayload, { headers: headers });
  }

  /**
   * Lấy danh sách các đại lý để đổ vào dropdown (từ API /dealer/select).
   */
  getDealersForSelection(): Observable<DealerSelectResponse> {
    return this.http.get<DealerSelectResponse>(`${environment.apiUrl}/dealer/select`);
  }
}
