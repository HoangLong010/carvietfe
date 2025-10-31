// store.component.ts

import { Component, OnInit } from '@angular/core';
import { Store, StoreApiResponse, StoreService } from '../../../core/services/store.service';

@Component({
  selector: 'app-store',
  standalone: false,
  templateUrl: './store.component.html',
  styleUrl: './store.component.scss'
})
export class StoreComponent implements OnInit {
  apiResponse: StoreApiResponse | null = null;
  stores: Store[] = [];
  totalStoresCount: number = 0;
  
  searchAddress: string = ''; // Chuỗi tìm kiếm địa chỉ
  currentPage: number = 0; // Thêm biến theo dõi trang hiện tại (API thường bắt đầu từ 0)

  constructor(private storeService: StoreService) { }

  ngOnInit(): void {
    // Giá trị ban đầu cho searchAddress để không bị null khi gọi API lần đầu
    // Nếu bạn muốn tìm kiếm tất cả khi không có input, hãy dùng chuỗi rỗng ''
    this.searchAddress = ''; 
    this.fetchStores();
  }

  fetchStores(): void {
    // Truyền thêm currentPage khi gọi service
    this.storeService.getAllStores(this.searchAddress, this.currentPage).subscribe({
      next: (response) => {
        this.apiResponse = response;
        this.stores = response.content;
        // API trả về totalElements là tổng số cửa hàng, dùng nó cho tiêu đề
        // currentTotalElementsCount có vẻ là số lượng cửa hàng trên trang hiện tại. 
        // Nếu API có trường tổng số lượng (totalElements) thì nên dùng nó. 
        // Tạm thời, tôi sẽ dùng currentTotalElementsCount nếu totalElements không có.
        // Giả định API bạn đang dùng trả về tổng số lượng là totalElements hoặc 
        // bạn chỉ muốn hiển thị số lượng cửa hàng trên trang hiện tại.
        // Tôi sẽ **giả định** API của bạn có tổng số phần tử (totalElements)
        // và bạn sẽ cần cập nhật interface `StoreApiResponse` để có trường đó.
        // Trong trường hợp này, tôi dùng tạm `currentTotalElementsCount` cho tổng số hiển thị
        // như trong template. Nếu API trả về tổng số phần tử, hãy thay bằng `response.totalElements`.
        this.totalStoresCount = response.currentTotalElementsCount; 
        console.log('Dữ liệu cửa hàng:', this.stores);
      },
      error: (error) => {
        console.error('Lỗi khi lấy dữ liệu cửa hàng:', error);
      }
    });
  }

  /**
   * Phương thức được gọi khi người dùng nhập vào ô tìm kiếm địa chỉ.
   * @param event Đối tượng sự kiện từ input.
   */
  onAddressSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchAddress = inputElement.value.trim() || 'null';
    this.currentPage = 0; // Khi tìm kiếm mới, luôn reset về trang 0
    this.fetchStores(); // Gọi lại API với tham số tìm kiếm mới
  }

  /**
   * Chuyển đến một trang cụ thể.
   * @param pageIndex Chỉ số trang mới (bắt đầu từ 0).
   */
  goToPage(pageIndex: number): void {
    // Kiểm tra giới hạn trang
    if (this.apiResponse && pageIndex >= 0 && pageIndex < this.apiResponse.pagesCount) {
      this.currentPage = pageIndex;
      this.fetchStores();
      // Cuộn lên đầu trang hoặc danh sách cửa hàng sau khi chuyển trang (tùy chọn)
      // window.scrollTo(0, 0); 
    }
  }

  /**
   * Chuyển đến trang trước.
   */
  previousPage(): void {
    if (this.apiResponse?.hasPrevious) {
      this.goToPage(this.currentPage - 1);
    }
  }

  /**
   * Chuyển đến trang kế tiếp.
   */
  nextPage(): void {
    if (this.apiResponse?.hasNext) {
      this.goToPage(this.currentPage + 1);
    }
  }

  /**
   * Tạo mảng số trang để hiển thị trong phân trang (ví dụ: [1, 2, 3, 4, 5])
   * Dùng `Array.from` để tạo mảng từ 1 đến `pagesCount`.
   */
  getPageNumbers(): number[] {
    if (!this.apiResponse) {
      return [];
    }
    // Tạo mảng [0, 1, 2, ..., pagesCount - 1]
    return Array.from({ length: this.apiResponse.pagesCount }, (_, i) => i);
  }

  formatNumber(num: number | null): string {
    return num === null ? 'Đang cập nhật' : num.toLocaleString('vi-VN');
  }
}