import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/enviroment';
import { AuthService } from '../../../core/services/auth.service';
import { AppointmentService, BookAppointmentRequest, TimeSlotResponse } from '../../../core/services/appointment.service';
import { CreateReviewRequest, ReviewResponse, ReviewService, ReviewStatistics } from '../../../core/services/review.service';

// Định nghĩa giao diện ảnh để TypeScript biết kiểu dữ liệu
interface CarImage {
  id: string;
  carId: string;
  imageUrl: string;
}

// Định nghĩa giao diện chi tiết xe
interface CarDetail {
  id: string;
  dealerId: string;
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
  images: CarImage[];
  store: StoreDetail;
}

interface StoreDetail {
  id: string;
  storeName: string;
  address: string;
  phone: string;
  bannerUrl: string;
  carsSelling: number; // Thêm trường giả định
  carsSold: number; // Thêm trường giả định
}
interface ReviewData {
  rating: number;
  comment: string;
}



@Component({
  selector: 'app-detail-car',
  standalone: false,
  templateUrl: './detail-car.component.html',
  styleUrl: './detail-car.component.scss'
})
export class DetailCarComponent implements OnInit {
  // Thay thế any bằng giao diện CarDetail
  car: CarDetail | null = null;
  dealer: any = null; // Có thể giữ lại hoặc thay thế bằng giao diện Dealer

  // Logic cho slider ảnh
  currentImageIndex: number = 0;

  // Logic cho modal phóng to
  isModalOpen: boolean = false;
  modalImageIndex: number = 0;
  isAppointmentModalOpen: boolean = false;
  availableSlots: TimeSlotResponse[] = [];
  selectedDate: string = '';
  selectedTime: string = '';
  minDate: string = '';
  appointmentData: BookAppointmentRequest = {
    carId: '',
    userId: '',
    appointmentDate: '',
    appointmentTime: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    notes: ''
  };
  selectedSlot: TimeSlotResponse | null = null;

  // Reviews
  reviews: ReviewResponse[] = [];
  reviewStats: ReviewStatistics | null = null;
  userReview: ReviewResponse | null = null;
  isReviewModalOpen: boolean = false;
  currentReviewPage: number = 0;
  totalReviewPages: number = 0;
  reviewData: ReviewData = {
    rating: 0,
    comment: ''
  };
  hoveredRating: number = 0;
  Math = Math; // Để dùng Math trong template
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private reviewService: ReviewService) {

  }

  // Toast notification
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'warning' | 'info' = 'info';
  showToast: boolean = false;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.http.get<{ data: CarDetail }>(`${environment.apiUrl}/car/detail/${id}`).subscribe({
          next: (res) => {
            this.car = res.data;

            if (this.car && this.car.store) {
              this.dealer = {
                ...this.car.store,
                carsSelling: 10,
                carsSold: 0
              };
            } else {
              this.dealer = {
                id: '',
                storeName: 'Đại lý không xác định',
                address: '',
                phone: '',
                bannerUrl: 'https://via.placeholder.com/320x120?text=Dealer',
                carsSelling: 0,
                carsSold: 0
              };
            }

            // Đảm bảo car.images tồn tại và có ít nhất 1 ảnh
            if (this.car && this.car.images && this.car.images.length > 0) {
              this.currentImageIndex = 0;
            }
            this.loadCurrentUser();
            this.setMinDate();
            this.loadReviewStatistics();
            this.Math = Math; // Thêm dòng này để sử dụng Math trong template
            this.loadReviews();
            this.checkUserReview();
          },
          error: (err) => console.error('Lỗi khi tải chi tiết xe:', err)
        });
      }
    });


  }

  // --- HÀM CHO SLIDER ẢNH CHÍNH ---

  // Chuyển ảnh chính
  goToSlide(index: number) {
    if (this.car && this.car.images) {
      this.currentImageIndex = index;
    }
  }

  // Chuyển ảnh (trái/phải)
  nextImage(event: Event) {
    event.stopPropagation(); // Ngăn chặn trigger modal
    if (!this.car || !this.car.images || this.car.images.length === 0) return;
    this.currentImageIndex = (this.currentImageIndex + 1) % this.car.images.length;
  }

  prevImage(event: Event) {
    event.stopPropagation(); // Ngăn chặn trigger modal
    if (!this.car || !this.car.images || this.car.images.length === 0) return;
    this.currentImageIndex = (this.currentImageIndex - 1 + this.car.images.length) % this.car.images.length;
  }

  // --- HÀM CHO MODAL PHÓNG TO (LIGHTBOX) ---

  // Mở modal
  openModal(index: number = this.currentImageIndex) {
    if (!this.car || !this.car.images || this.car.images.length === 0) return;
    this.modalImageIndex = index;
    this.isModalOpen = true;
  }

  // Đóng modal
  closeModal() {
    this.isModalOpen = false;
  }

  // Phương thức chuyển sang trang chi tiết xe
  goToCarDetail(carId: string): void {
    // Chuyển hướng đến route /detail-car và truyền ID qua queryParams
    this.router.navigate(['/detail-car'], { queryParams: { id: carId } }).then(() => window.scrollTo(0, 0));
  }

  // Chuyển ảnh trong modal (trái/phải)
  nextModalImage() {
    if (!this.car || !this.car.images || this.car.images.length === 0) return;
    this.modalImageIndex = (this.modalImageIndex + 1) % this.car.images.length;
  }

  prevModalImage() {
    if (!this.car || !this.car.images || this.car.images.length === 0) return;
    this.modalImageIndex = (this.modalImageIndex - 1 + this.car.images.length) % this.car.images.length;
  }

  goToDetail(id: string, status?: number) {
    this.router.navigate(['/detail-car'], { queryParams: { id } }).then(() => window.scrollTo(0, 0));
  }

  setMinDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.minDate = tomorrow.toISOString().split('T')[0];
  }

  loadCurrentUser() {
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      const user = JSON.parse(userProfile);
      this.appointmentData.userId = this.authService.getUserId() || '';
      this.appointmentData.customerName = user.data?.fullName || '';
      this.appointmentData.customerPhone = user.data?.phoneNumber || '';
      this.appointmentData.customerEmail = user.data?.email || '';
    }
  }

  // Mở modal đặt lịch
  openAppointmentModal() {
    if (!this.authService.isLoggedIn()) {
      this.toastMessage = 'Vui lòng đăng nhập để đặt lịch hẹn';
      this.toastType = 'warning';
      this.showToast = true;
      this.router.navigate(['/auth/login']);
      return;
    }
    this.isAppointmentModalOpen = true;
    this.selectedDate = this.minDate;
    this.onDateChange();
  }

  // Đóng modal
  closeAppointmentModal() {
    this.isAppointmentModalOpen = false;
    this.selectedDate = '';
    this.selectedSlot = null;
    this.selectedTime = '';
    this.availableSlots = [];
  }

  isSlotSelected(slot: TimeSlotResponse): boolean {
    return this.selectedSlot === slot;
  }

  // Khi chọn ngày
  onDateChange() {
    this.selectedSlot = null;
    this.selectedTime = '';
    if (this.selectedDate && this.car) {
      this.appointmentService.getAvailableTimeSlots(this.car.id, this.selectedDate)
        .subscribe({
          next: (response) => {
            this.availableSlots = response || [];
            console.log('Available slots:', this.availableSlots); // Debug
          },
          error: (err) => {
            this.toastMessage = 'Không thể tải khung giờ. Vui lòng thử lại.';
            this.toastType = 'error';
            this.showToast = true;
          }
        });
    }
  }

  // Khi chọn khung giờ
  selectTimeSlot(slot: TimeSlotResponse) {
    if (!slot.isAvailable) return;
    this.selectedSlot = slot;
    this.selectedTime = slot.startTime; // Đồng bộ cả hai nếu cần
  }

  // Và formatTime không cần thiết nữa

  // Đặt lịch
  bookAppointment() {
    // Kiểm tra cả selectedSlot và các trường bắt buộc
    if (!this.selectedSlot || !this.car || !this.selectedDate) {
      this.toastMessage = 'Vui lòng chọn ngày và khung giờ hợp lệ.';
      this.toastType = 'warning';
      this.showToast = true;
      return;
    }

    // Kiểm tra thông tin người dùng
    if (!this.appointmentData.customerName || !this.appointmentData.customerPhone || !this.appointmentData.customerEmail) {
      this.toastMessage = 'Vui lòng điền đầy đủ thông tin cá nhân.';
      this.toastType = 'warning';
      this.showToast = true;
      return;
    }

    this.appointmentData.carId = this.car.id;
    this.appointmentData.userId = this.authService.getUserId() || '';
    this.appointmentData.appointmentDate = this.selectedDate;
    this.appointmentData.appointmentTime = this.selectedSlot.startTime;

    console.log('Booking data:', this.appointmentData); // Debug

    this.appointmentService.bookAppointment(this.appointmentData)
      .subscribe({
        next: (response) => {
          this.toastMessage = 'Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.';
          this.toastType = 'success';
          this.showToast = true;
          this.closeAppointmentModal();
        },
        error: (err) => {
          console.error('Lỗi khi đặt lịch:', err);
          this.toastMessage = 'Đặt lịch thất bại. Vui lòng thử lại.';
          this.toastType = 'error';
          this.showToast = true;
        }
      });
  }

  // Format time để hiển thị
  formatTime(timeArray: number[]): string {
    if (!timeArray || timeArray.length < 2) return '';
    const hour = timeArray[0].toString().padStart(2, '0');
    const minute = timeArray[1].toString().padStart(2, '0');
    return `${hour}:${minute}`;
  }

  // Reviews
  loadReviewStatistics() {
    if (!this.car) {
      console.log('Car chưa load, bỏ qua load review stats');
      return;
    }

    console.log('Loading review statistics for car:', this.car.id);

    this.reviewService.getReviewStatistics(this.car.id).subscribe({
      next: (response) => {
        console.log('Review stats response:', response);
        if (response.success) {
          this.reviewStats = response.data;
          console.log('Review stats loaded:', this.reviewStats);
        }
      },
      error: (err) => {
        console.error('Lỗi khi tải thống kê đánh giá:', err);
      }
    });
  }

  loadReviews(page: number = 0) {
    debugger;
    if (!this.car) {
      console.log('Car chưa load, bỏ qua load reviews');
      return;
    }

    console.log('Loading reviews for car:', this.car.id, 'page:', page);

    this.reviewService.getReviewsByCarId(this.car.id, page, 5).subscribe({
      next: (response) => {
        console.log('Reviews response:', response);
        if (response.success) {
          this.reviews = response.data.content;
          this.currentReviewPage = response.data.number;
          this.totalReviewPages = response.data.totalPages;
          console.log('Reviews loaded:', this.reviews.length);
        }
      },
      error: (err) => {
        console.error('Lỗi khi tải đánh giá:', err);
      }
    });
  }

  checkUserReview() {
    if (!this.car || !this.authService.isLoggedIn()) {
      console.log('Không check user review: car hoặc chưa login');
      return;
    }

    console.log('Checking user review for car:', this.car.id);

    this.reviewService.getUserReviewForCar(this.car.id).subscribe({
      next: (response) => {
        console.log('User review response:', response);
        if (response.success && response.data) {
          this.userReview = response.data;
          console.log('User already reviewed:', this.userReview);
        } else {
          this.userReview = null;
          console.log('User has not reviewed yet');
        }
      },
      error: (err) => {
        console.error('Lỗi khi kiểm tra đánh giá:', err);
        this.userReview = null;
      }
    });
  }

  openReviewModal() {
    if (!this.authService.isLoggedIn()) {
      this.toastMessage = 'Vui lòng đăng nhập để đánh giá xe';
      this.toastType = 'warning';
      this.showToast = true;
      this.router.navigate(['/auth/login']);
      return;
    }

    if (this.userReview) {
      // Nếu đã đánh giá, load dữ liệu cũ
      this.reviewData = {
        rating: this.userReview.rating,
        comment: this.userReview.comment || ''
      };
    } else {
      // Reset form
      this.reviewData = {
        rating: 0,
        comment: ''
      };
    }

    this.isReviewModalOpen = true;
  }
  closeReviewModal() {
    this.isReviewModalOpen = false;
    this.hoveredRating = 0;
  }

  setRating(rating: number) {
    this.reviewData.rating = rating;
  }

  setHoveredRating(rating: number) {
    this.hoveredRating = rating;
  }
  // Đánh giá
  submitReview() {
    if (!this.reviewData.rating || this.reviewData.rating < 1) {
      this.toastMessage = 'Vui lòng chọn số sao đánh giá';
      this.toastType = 'warning';
      this.showToast = true;
      return;
    }

    if (!this.reviewData.comment || this.reviewData.comment.trim() === '') {
      this.toastMessage = 'Vui lòng nhập nội dung đánh giá';
      this.toastType = 'warning';
      this.showToast = true;
      return;
    }

    if (!this.car) {
      this.toastMessage = 'Không tìm thấy thông tin xe';
      this.toastType = 'error';
      this.showToast = true;
      return;
    }

    if (this.userReview) {
      // Update existing review
      console.log('Updating review:', this.userReview.id, this.reviewData);

      this.reviewService.updateReview(
        this.userReview.id,
        this.reviewData.rating,
        this.reviewData.comment
      ).subscribe({
        next: (response) => {
          console.log('Update review response:', response);
          if (response.success) {
            this.toastMessage = 'Cập nhật đánh giá thành công!';
            this.toastType = 'success';
            this.showToast = true;
            this.closeReviewModal();
            this.loadReviewStatistics();
            this.loadReviews();
            this.checkUserReview();
          }
        },
        error: (err) => {
          this.toastMessage = 'Có lỗi xảy ra khi tải dữ liệu cửa hàng';
          this.toastType = 'error';
          this.showToast = true;
        }
      });
    } else {
      // Create new review
      console.log('Creating review:', this.car.id, this.reviewData);
      this.reviewService.createReview(
        this.car.id,
        this.reviewData.rating,
        this.reviewData.comment
      ).subscribe({
        next: (response) => {
          debugger
          console.log('Create review response:', response);
          if (response.success) {
            this.toastMessage = 'Đánh giá thành công!';
            this.toastType = 'success';
            this.showToast = true;
            this.closeReviewModal();
            this.loadReviewStatistics();
            this.loadReviews();
            this.checkUserReview();
          }
          else {
            this.toastMessage = 'Bạn chưa hoàn thành lịch hẹn xem xe này. Chỉ có thể đánh giá sau khi đã xem xe.';
            this.toastType = 'error';
            this.showToast = true;
          }
        }
      });
    }
  }

  onToastClosed(): void {
    this.resetToast();
  }

  private resetToast(): void {
    this.showToast = false;
    this.toastMessage = '';
    this.toastType = 'info';
  }


  deleteReview() {
    if (!this.userReview) return;

    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;

    console.log('Deleting review:', this.userReview.id);

    this.reviewService.deleteReview(this.userReview.id).subscribe({
      next: (response) => {
        console.log('Delete review response:', response);
        if (response.success) {
          this.toastMessage = 'Xóa đánh giá thành công!';
          this.toastType = 'success';
          this.showToast = true;
          this.userReview = null;
          this.loadReviewStatistics();
          this.loadReviews();
        }
      },
      error: (err) => {
        console.error('Lỗi khi xóa đánh giá:', err);
        this.toastMessage = err.error?.message || 'Xóa đánh giá thất bại. Vui lòng thử lại.';
        this.toastType = 'error';
        this.showToast = true;
      }
    });
  }

  getStarArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < rating);
  }

  getRatingPercentage(star: number): number {
    if (!this.reviewStats || this.reviewStats.totalReviews === 0) return 0;
    const count = this.reviewStats.ratingDistribution[star] || 0;
    return (count / this.reviewStats.totalReviews) * 100;
  }

  loadMoreReviews() {
    if (this.currentReviewPage < this.totalReviewPages - 1) {
      this.loadReviews(this.currentReviewPage + 1);
    }
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 30) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  }





}