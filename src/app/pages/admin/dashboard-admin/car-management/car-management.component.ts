import { Component, OnInit } from '@angular/core';
import {
  CarService,
  CarResponseItem,
  DealerItem
  // CarUpdatePayload đã được loại bỏ vì chúng ta dùng FormData
} from '../../../../core/services/car.service';

// Định nghĩa kiểu cho response API để dễ quản lý (nếu API trả về cấu trúc này cho update/delete)
interface ApiResponse {
  data?: any;
  success: boolean;
  code: number;
  error_code: number;
  message: string;
  description: string;
  timestamp: number;
}

@Component({
  selector: 'app-car-management',
  standalone: false,
  templateUrl: './car-management.component.html',
  styleUrls: ['./car-management.component.scss']
})
export class CarManagementComponent implements OnInit {
  // Trạng thái phân trang
  currentPage = 0;
  pageSize = 10;
  totalElementsCount = 0;
  pagesCount = 0;
  hasPreviousPage = false;
  hasNextPage = false;

  // Bộ lọc tìm kiếm
  filter: {
    title: string;
    status: number | null; // 1: Mới (tương ứng API status=1), 0: Cũ (tương ứng API status=2), null: Tất cả
    dealerId: string | null;
  } = {
    title: '',
    status: null,
    dealerId: null
  };

  cars: CarResponseItem[] = [];
  dealers: DealerItem[] = [];

  // Trạng thái modal chỉnh sửa
  isEditModalOpen = false;
  selectedCar: CarResponseItem = {} as CarResponseItem;

  // === BIẾN MỚI CHO QUẢN LÝ ẢNH ===
  /** Danh sách ID của các ảnh HIỆN TẠI mà người dùng muốn GIỮ LẠI (Không xóa). */
  keepImageIds: string[] = []; 
  /** Danh sách File mới người dùng chọn để TẢI LÊN. */
  newImages: File[] = [];
  /** Danh sách URL tạm thời (dùng cho preview) của ảnh mới. */
  newImageUrls: string[] = [];
  // ================================

  // === Các biến để quản lý toast notification ===
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'warning' | 'info' = 'info';
  showToast: boolean = false;
  // ===========================================

  constructor(private carService: CarService) {}

  ngOnInit(): void {
    this.loadDealers();
    this.performSearch();
  }

  loadDealers(): void {
    this.carService.getDealersForSelection().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.dealers = response.data;
        }
      },
      error: (error) => console.error('Lỗi khi tải danh sách đại lý:', error)
    });
  }

  performSearch(): void {
    // 1. Ánh xạ trạng thái filter component sang trạng thái API (1: mới, 2: cũ)
    let apiStatus: number | undefined;
    if (this.filter.status === 1) { // Lọc theo Xe mới
      apiStatus = 1;
    } else if (this.filter.status === 0) { // Lọc theo Xe cũ
      apiStatus = 2;
    } else {
      apiStatus = undefined; // Tất cả
    }

    // 2. Chuẩn bị các tham số cho hàm getCars
    const titleParam = this.filter.title || undefined;
    const dealerIdForHeader = this.filter.dealerId || undefined;

    // 3. GỌI SERVICE VỚI CHUỖI THAM SỐ VỊ TRÍ (khớp 1:1 với API)
    this.carService.getCars(
      this.currentPage,
      this.pageSize,
      dealerIdForHeader, // RequestHeader: dealerId
      titleParam,        // RequestParam: title
      apiStatus,         // RequestParam: status
      undefined,         // RequestParam: minPrice (Không sử dụng trong component này)
      undefined,         // RequestParam: maxPrice
      undefined,         // RequestParam: year
      undefined,         // RequestParam: brandId
      undefined,         // RequestParam: color
      undefined,         // RequestParam: bodyStyle
      undefined,         // RequestParam: origin
      undefined,         // RequestParam: fuelType
      undefined,         // RequestParam: seats
      undefined          // RequestParam: location
    ).subscribe({
      next: (response) => {
        this.cars = response.data.content;
        this.totalElementsCount = response.data.currentTotalElementsCount;
        this.pagesCount = response.data.pagesCount;
        this.currentPage = response.data.currentPage;
        this.pageSize = response.data.pageSize;
        this.hasPreviousPage = response.data.hasPrevious;
        this.hasNextPage = response.data.hasNext;

        // ⚠️ TÔI ĐÃ BỎ PHẦN RESET FILTER Ở ĐÂY để giữ tiêu chí tìm kiếm trên UI
      },
      error: (error) => console.error('Lỗi khi tìm kiếm xe:', error)
    });
  }

  getCarStatusLabel(status: number | null | undefined): string {
    switch (status) {
      case 1: return 'Xe mới';
      case 2: return 'Xe cũ';
      default: return 'Không xác định';
    }
  }

  getDealerNameById(dealerId: string | null | undefined): string {
    const dealer = this.dealers.find(d => d.id === dealerId);
    return dealer ? dealer.username : 'Không xác định';
  }

  openEditModal(car: CarResponseItem): void {
    this.selectedCar = { ...car };
    
    // === KHỞI TẠO TRẠNG THÁI ẢNH KHI MỞ MODAL ===
    // Mặc định là giữ lại TẤT CẢ các ảnh hiện có
    this.keepImageIds = car.images ? car.images.map(img => img.id) : [];
    this.newImages = []; // Đảm bảo danh sách ảnh mới trống
    this.newImageUrls = []; // Đảm bảo danh sách URL preview trống
    // ===========================================

    this.isEditModalOpen = true;
  }

  /**
   * Dọn dẹp các URL đối tượng tạm thời để ngăn rò rỉ bộ nhớ.
   */
  private cleanupNewImageUrls(): void {
    this.newImageUrls.forEach(url => URL.revokeObjectURL(url));
    this.newImageUrls = [];
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    // Reset trạng thái ảnh khi đóng modal
    this.keepImageIds = [];
    this.newImages = [];
    
    // === DỌN DẸP URL TẠM THỜI ===
    this.cleanupNewImageUrls(); // Gọi hàm dọn dẹp riêng
    // =============================
  }

  /**
   * Xử lý sự kiện khi người dùng chọn file ảnh mới, tạo URL preview.
   * Đây chính là cách để up ảnh tạm thời và hiện lên giao diện.
   */
  handleNewImagesChange(event: any): void {
    // 1. Dọn dẹp các URL cũ và reset biến
    this.cleanupNewImageUrls();
    this.newImages = [];

    const files = event.target.files;
    if (files) {
        this.newImages = Array.from(files);
        
        // 2. Tạo URL tạm thời cho mỗi file để hiển thị preview
        this.newImages.forEach(file => {
            const url = URL.createObjectURL(file);
            this.newImageUrls.push(url);
        });
    }
  }

  /**
   * Xử lý việc chọn/bỏ chọn một ảnh hiện tại để giữ lại (hoặc xóa).
   */
  toggleImageToKeep(imageId: string): void {
    const index = this.keepImageIds.indexOf(imageId);
    if (index > -1) {
      // Nếu ID đã có (người dùng BỎ chọn), thì xóa khỏi danh sách giữ lại
      this.keepImageIds.splice(index, 1);
    } else {
      // Nếu ID chưa có (người dùng CHỌN để giữ lại), thì thêm vào
      this.keepImageIds.push(imageId);
    }
  }

  saveEdit(): void {
    // Reset trạng thái toast trước mỗi lần submit
    this.resetToast();

    const carId = this.selectedCar.carId;
    const dealerIdForHeader = this.selectedCar.dealerId || undefined;

    // === TẠO FORM DATA để gửi dữ liệu multipart/form-data ===
    const formData = new FormData();
    
    // 1. Thêm các trường dữ liệu text (phải là string)
    formData.append('title', this.selectedCar.title);
    formData.append('description', this.selectedCar.description);
    formData.append('brandId', this.selectedCar.brandId);
    formData.append('model', this.selectedCar.model);
    formData.append('variant', this.selectedCar.variant);
    formData.append('year', this.selectedCar.year.toString());
    formData.append('price', this.selectedCar.price.toString());
    formData.append('status', this.selectedCar.status.toString()); 
    formData.append('location', this.selectedCar.location);
    formData.append('mileage', this.selectedCar.mileage.toString());
    formData.append('color', this.selectedCar.color);
    formData.append('fuelType', this.selectedCar.fuelType);
    formData.append('transmission', this.selectedCar.transmission);
    formData.append('bodyStyle', this.selectedCar.bodyStyle);
    formData.append('origin', this.selectedCar.origin);
    formData.append('seats', this.selectedCar.seats.toString());
    formData.append('horsepower', this.selectedCar.horsepower.toString());
    formData.append('torque', this.selectedCar.torque.toString());
    formData.append('drivetrain', this.selectedCar.drivetrain);
    formData.append('engineCapacity', this.selectedCar.engineCapacity.toString());
    formData.append('engineType', this.selectedCar.engineType);
    formData.append('fuelConsumption', this.selectedCar.fuelConsumption.toString());
    formData.append('airbags', this.selectedCar.airbags.toString());
    formData.append('registeredUntil', this.selectedCar.registeredUntil);

    // 2. Thêm danh sách keepImageIds (chuỗi phân cách bằng dấu phẩy)
    if (this.keepImageIds.length > 0) {
        formData.append('keepImageIds', this.keepImageIds.join(','));
    }

    // 3. Thêm các file ảnh mới (newImages)
    this.newImages.forEach(file => {
        // Tên trường phải khớp với @RequestPart("newImages") trong Spring
        formData.append('newImages', file, file.name); 
    });
    // =============================

    // Gọi service với FormData
    this.carService.updateCar(carId, formData, dealerIdForHeader).subscribe({
      next: (response: ApiResponse) => {
        if (response.success && response.code === 200) { 
          this.toastMessage = response.message || 'Cập nhật xe thành công!';
          this.toastType = 'success';
          this.showToast = true;
          this.closeEditModal();
          this.performSearch();
        } else {
          this.toastMessage = response.message || 'Cập nhật xe thất bại. Vui lòng thử lại.';
          this.toastType = 'error';
          this.showToast = true;
          this.closeEditModal();
          console.error('Cập nhật xe thất bại:', response);
        }
      },
      error: (error) => {
        this.toastMessage = error.error?.message || 'Đã có lỗi xảy ra khi cập nhật xe. Vui lòng thử lại sau.';
        this.toastType = 'error';
        this.showToast = true;
        this.closeEditModal();
      }
    });
  }

  handleDeleteCar(carId: string): void {
    this.resetToast();

    // ⚠️ KHẮC PHỤC LỖI: Không dùng confirm() trong môi trường iframe, thay bằng console.warn và logic tạm thời.
    console.warn('HÀM CONFIRM ĐÃ BỊ LOẠI BỎ. CẦN THÊM MODAL UI RIÊNG CHO CHỨC NĂNG NÀY.');

    // Giả sử đã qua bước xác nhận
    if (carId) {  
      const carToDelete = this.cars.find(car => car.carId === carId);
      const dealerIdToDelete = carToDelete ? carToDelete.dealerId : undefined;

      this.carService.deleteCar(carId, dealerIdToDelete).subscribe({
        next: (response: ApiResponse) => {
          if (response.success && response.code === 201) {
            this.toastMessage = response.message || 'Xóa xe thành công!';
            this.toastType = 'success';
            this.showToast = true;
            this.performSearch(); // Tải lại dữ liệu sau khi xóa
          } else {
            this.toastMessage = response.message || 'Xóa xe thất bại. Vui lòng thử lại.';
            this.toastType = 'error';
            this.showToast = true;
            console.error('Xóa xe thất bại:', response);
          }
        },
        error: (error) => {
          console.error('Lỗi khi gọi API xóa xe:', error);
          this.toastMessage = error.error?.message || 'Đã có lỗi xảy ra khi xóa xe. Vui lòng thử lại sau.';
          this.toastType = 'error';
          this.showToast = true;
        }
      });
    }
  }

  handleBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeEditModal();
    }
  }

  goToPreviousPage(): void {
    if (this.hasPreviousPage) {
      this.currentPage--;
      this.performSearch();
    }
  }

  goToNextPage(): void {
    if (this.hasNextPage) {
      this.currentPage++;
      this.performSearch();
    }
  }

  /**
   * Xử lý sự kiện khi toast notification đóng.
   * Ẩn toast và xóa message để chuẩn bị cho thông báo tiếp theo.
   */
  onToastClosed(): void {
    this.resetToast();
  }

  /**
   * Đặt lại trạng thái của toast notification về mặc định.
   */
  private resetToast(): void {
    this.showToast = false;
    this.toastMessage = '';
    this.toastType = 'info';
  }
}
