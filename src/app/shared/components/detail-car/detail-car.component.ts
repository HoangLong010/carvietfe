import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/enviroment';
import { AuthService } from '../../../core/services/auth.service';
import { AppointmentService, BookAppointmentRequest, TimeSlotResponse } from '../../../core/services/appointment.service';

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

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private appointmentService: AppointmentService,
    private authService: AuthService) { }

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
          },
          error: (err) => console.error('Lỗi khi tải chi tiết xe:', err)
        });
      }
    });

    this.loadCurrentUser();
    this.setMinDate();
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
      alert('Vui lòng đăng nhập để đặt lịch xem xe');
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
    this.selectedTime = '';
    this.availableSlots = [];
  }

  // Khi chọn ngày
  onDateChange() {
    this.selectedTime = '';
    if (this.selectedDate && this.car) {
      this.appointmentService.getAvailableTimeSlots(this.car.id, this.selectedDate)
        .subscribe({
          next: (slots) => {
            this.availableSlots = slots;
          },
          error: (err) => {
            console.error('Lỗi khi tải khung giờ:', err);
            alert('Không thể tải khung giờ. Vui lòng thử lại.');
          }
        });
    }
  }

  // Khi chọn khung giờ
  selectTimeSlot(slot: TimeSlotResponse) {
    if (!slot.isAvailable) return;
    this.selectedTime = slot.startTime;
  }

  // Đặt lịch
  bookAppointment() {
    if (!this.selectedTime || !this.car) return;

    this.appointmentData.carId = this.car.id;
    this.appointmentData.appointmentDate = this.selectedDate;
    this.appointmentData.appointmentTime = this.selectedTime;

    this.appointmentService.bookAppointment(this.appointmentData)
      .subscribe({
        next: (response) => {
          alert('Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn để xác nhận.');
          this.closeAppointmentModal();
        },
        error: (err) => {
          console.error('Lỗi khi đặt lịch:', err);
          alert('Đặt lịch thất bại. Vui lòng thử lại.');
        }
      });
  }

  // Format time để hiển thị
  formatTime(time: string): string {
    return time.substring(0, 5);
  }



}