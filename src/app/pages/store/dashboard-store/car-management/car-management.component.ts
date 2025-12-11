import { Component, OnInit } from '@angular/core';
import {
  CarService,
  CarResponseItem,
  DealerItem
  // CarUpdatePayload đã được loại bỏ vì chúng ta dùng FormData
} from '../../../../core/services/car.service';
import { BrandItem, MasterDataService } from '../../../../core/services/masterdata.service';

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
    status: number | null; 
    dealerId: string | null;
  } = {
      title: '',
      status: null,
      dealerId: null
    };

  cars: CarResponseItem[] = [];
  dealers: DealerItem[] = [];
  brands: BrandItem[] = [];

  isEditModalOpen = false;
  selectedCar: CarResponseItem = {} as CarResponseItem;

  isCreateModalOpen = false;
  newCar: CarResponseItem = this.getEmptyCar();
  keepImageIds: string[] = [];
  newImages: File[] = [];
  newImageUrls: string[] = [];

  toastMessage: string = '';
  toastType: 'success' | 'error' | 'warning' | 'info' = 'info';
  showToast: boolean = false;

  constructor(private carService: CarService, private masterDataService: MasterDataService) { }

  ngOnInit(): void {
    this.loadDealers();
    this.performSearch();
    this.loadBrands();
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
  loadBrands(): void {
  const currentDealerId = this.getCurrentDealerId();
  if (currentDealerId) {
    this.masterDataService.getBrandsForSelection(currentDealerId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          console.log('RAW brands:', response.data); 
          this.brands = response.data.map((b: any) => ({
            id: String(b.id ?? b._id ?? b.brandId ?? ''),
            name: b.name ?? b.brandName ?? b.displayName ?? ''
          })).filter((b: any) => b.id); // loại bỏ item không có id
        }
      },
      error: (error) => console.error('Lỗi khi tải danh sách hãng xe (Brand):', error)
    });
  } else {
  }
}

  private getEmptyCar(): CarResponseItem {
    const currentDealerId = this.getCurrentDealerId();

    return {
      carId: '', 
      dealerId: currentDealerId || '', 
      title: '',
      description: '',
      brandId: null as any,
      brandName: '',
      model: '',
      variant: '',
      year: new Date().getFullYear(),
      price: 0,
      status: 1, 
      location: '',
      mileage: 0,
      color: '',
      fuelType: '',
      transmission: '',
      bodyStyle: '',
      origin: '',
      seats: 5,
      horsepower: 0,
      torque: 0,
      drivetrain: '',
      engineCapacity: 0,
      engineType: '',
      fuelConsumption: 0,
      airbags: 0,
      registeredUntil: new Date().toISOString().substring(0, 10),
      images: [],
      store: null,
      sellStatus: 0
    } as CarResponseItem;
  }

  openCreateModal(): void {
    this.newCar = this.getEmptyCar(); // Reset form
    this.cleanupNewImageUrls(); // Dọn dẹp ảnh cũ
    this.newImages = [];
    this.isCreateModalOpen = true;
  }

 
  closeCreateModal(): void {
    this.isCreateModalOpen = false;
    this.cleanupNewImageUrls();
    this.newImages = [];
  }


  saveNewCar(): void {
    this.resetToast();

    const dealerIdForHeader = this.newCar.dealerId;
    if (!dealerIdForHeader) {
      this.toastMessage = 'Lỗi: Không thể xác định Dealer ID để tạo xe.';
      this.toastType = 'error';
      this.showToast = true;
      return;
    }

    const formData = new FormData();
    debugger

    formData.append('title', this.newCar.title);
    formData.append('description', this.newCar.description);
    const brandIdString = String(this.newCar.brandId || '').trim(); 
    if (brandIdString) {
      formData.append('brandId', brandIdString);
    } else {
    }
    formData.append('model', this.newCar.model);
    formData.append('variant', this.newCar.variant);
    formData.append('year', this.newCar.year.toString());
    formData.append('price', this.newCar.price.toString());
    formData.append('status', this.newCar.status.toString());
    formData.append('location', this.newCar.location);
    formData.append('mileage', this.newCar.mileage.toString());
    formData.append('color', this.newCar.color);
    formData.append('fuelType', this.newCar.fuelType);
    formData.append('transmission', this.newCar.transmission);
    formData.append('bodyStyle', this.newCar.bodyStyle);
    formData.append('origin', this.newCar.origin);
    formData.append('seats', this.newCar.seats.toString());
    formData.append('horsepower', this.newCar.horsepower.toString());
    formData.append('torque', this.newCar.torque.toString());
    formData.append('drivetrain', this.newCar.drivetrain);
    formData.append('engineCapacity', this.newCar.engineCapacity.toString());
    formData.append('engineType', this.newCar.engineType);
    formData.append('fuelConsumption', this.newCar.fuelConsumption.toString());
    formData.append('airbags', this.newCar.airbags.toString());
    formData.append('registeredUntil', this.newCar.registeredUntil);

    this.newImages.forEach(file => {
      formData.append('images', file, file.name);
    });

    this.carService.createCar(formData, dealerIdForHeader).subscribe({
      next: (response: ApiResponse) => {
        if (response.success && response.code === 201) { // 201 Created
          this.toastMessage = response.message || 'Thêm xe mới thành công!';
          this.toastType = 'success';
          this.showToast = true;
          this.closeCreateModal(); // Đóng modal tạo mới
          this.performSearch(); // Tải lại danh sách
        } else {
          this.toastMessage = response.message || 'Thêm xe thất bại. Vui lòng thử lại.';
          this.toastType = 'error';
          this.showToast = true;
        }
      },
      error: (error) => {
        this.toastMessage = error.error?.message || 'Đã có lỗi xảy ra khi thêm xe mới. Vui lòng thử lại sau.';
        this.toastType = 'error';
        this.showToast = true;
      }
    });
  }

  getCurrentDealerId(): string | null {
    try {
      const userProfileString = localStorage.getItem('userProfile');

      if (!userProfileString) {
        return null;
      }
      const userProfile = JSON.parse(userProfileString);

      if (
        userProfile &&
        userProfile.data &&
        userProfile.data.userId &&
        userProfile.data.accountType === 3 
      ) {
        return userProfile.data.userId;
      }

      return null;
    } catch (error) {
      console.error('Lỗi khi lấy Dealer ID từ localStorage:', error);
      return null;
    }
  }

  performSearch(): void {
    let apiStatus: number | undefined;
    if (this.filter.status === 1) { // Lọc theo Xe mới
      apiStatus = 1;
    } else if (this.filter.status === 0) { // Lọc theo Xe cũ
      apiStatus = 2;
    } else {
      apiStatus = undefined; // Tất cả
    }

    const titleParam = this.filter.title || undefined;
    let dealerIdForHeader = this.filter.dealerId || this.getCurrentDealerId() || undefined;


    this.carService.getCars(
      this.currentPage,
      this.pageSize,
      dealerIdForHeader, 
      titleParam,        
      apiStatus,         
      undefined,         
      undefined,         
      undefined,             
      undefined,         
      undefined,       
      undefined,        
      undefined,         
      undefined,         
      undefined      
    ).subscribe({
      next: (response) => {
        this.cars = response.data.content;
        this.totalElementsCount = response.data.currentTotalElementsCount;
        this.pagesCount = response.data.pagesCount;
        this.currentPage = response.data.currentPage;
        this.pageSize = response.data.pageSize;
        this.hasPreviousPage = response.data.hasPrevious;
        this.hasNextPage = response.data.hasNext;

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

  getCarStatusSell(sellStatus: number | null | undefined): string {
    switch (sellStatus) {
      case 0: return 'Chưa bán';
      case 1: return 'Đã bán';  
      default: return 'Không xác định';
    }
  }

  getDealerNameById(dealerId: string | null | undefined): string {
    const dealer = this.dealers.find(d => d.id === dealerId);
    return dealer ? dealer.username : 'Không xác định';
  }

  openEditModal(car: CarResponseItem): void {
    this.selectedCar = { ...car };

    this.keepImageIds = car.images ? car.images.map(img => img.id) : [];
    this.newImages = []; // Đảm bảo danh sách ảnh mới trống
    this.newImageUrls = []; // Đảm bảo danh sách URL preview trống

    this.isEditModalOpen = true;
  }

  private cleanupNewImageUrls(): void {
    this.newImageUrls.forEach(url => URL.revokeObjectURL(url));
    this.newImageUrls = [];
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.keepImageIds = [];
    this.newImages = [];

    this.cleanupNewImageUrls(); 
  }


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
  toggleSellStatus(car: CarResponseItem): void {
    this.resetToast();
    
    const newSellStatus = car.sellStatus === 0 ? 1 : 0;
    const dealerId = car.dealerId || this.getCurrentDealerId() || undefined;

    this.carService.updateSellStatus(car.carId, newSellStatus, dealerId).subscribe({
      next: (response: any) => {
        if (response.success) {
          // Cập nhật trạng thái ngay lập tức trong giao diện
          car.sellStatus = newSellStatus;
          
          this.toastMessage = `Đã ${newSellStatus === 1 ? 'đánh dấu đã bán' : 'đánh dấu chưa bán'} cho xe "${car.title}"`;
          this.toastType = 'success';
          this.showToast = true;
        } else {
          this.toastMessage = response.message || 'Cập nhật trạng thái bán thất bại';
          this.toastType = 'error';
          this.showToast = true;
        }
      },
      error: (error) => {
        console.error('Lỗi khi cập nhật trạng thái bán:', error);
        this.toastMessage = error.error?.message || 'Đã có lỗi xảy ra khi cập nhật trạng thái bán';
        this.toastType = 'error';
        this.showToast = true;
      }
    });
  }

  saveEdit(): void {
    debugger
    // Reset trạng thái toast trước mỗi lần submit
    this.resetToast();

    const carId = this.selectedCar.carId;
    const dealerIdForHeader = this.selectedCar.dealerId || this.getCurrentDealerId();
    if (!dealerIdForHeader) {
    this.toastMessage = 'Lỗi: Không thể xác định Dealer ID để cập nhật xe.';
    this.toastType = 'error';
    this.showToast = true;
    return;
  }
    // === TẠO FORM DATA để gửi dữ liệu multipart/form-data ===
    const formData = new FormData();

    // 1. Thêm các trường dữ liệu text (phải là string)
    formData.append('title', this.selectedCar.title);
    formData.append('description', this.selectedCar.description);
    const brandIdString = String(this.selectedCar.brandId || '').trim();
    
    if (brandIdString) {
      formData.append('brandId', brandIdString);
    } else {
      console.warn('Brand ID không được chọn hoặc là rỗng. Kiểm tra form validation.');
      // Nếu đây là lỗi, nên ngăn API call và hiển thị lỗi.
    }
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

  // Thay thế hàm handleBackdropClick hiện tại bằng hàm này

  handleBackdropClick(event: MouseEvent): void {
    // Kiểm tra xem phần tử được click có phải là overlay không
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      // Nếu Modal Edit đang mở, đóng nó
      if (this.isEditModalOpen) {
        this.closeEditModal();
      }
      // Nếu Modal Create đang mở, đóng nó
      if (this.isCreateModalOpen) {
        this.closeCreateModal();
      }
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
