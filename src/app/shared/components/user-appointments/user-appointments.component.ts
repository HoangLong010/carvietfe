import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppointmentService, AppointmentResponse } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-appointments',
  standalone: false,
  templateUrl: './user-appointments.component.html',
  styleUrls: ['./user-appointments.component.scss']
})
export class UserAppointmentsComponent implements OnInit {
  appointments: AppointmentResponse[] = [];
  filteredAppointments: AppointmentResponse[] = [];
  userId: string = '';
  isLoading = false;
  selectedTab: 'all' | 'upcoming' | 'past' = 'all';

  // Toast notification
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' | 'warning' = 'success';

  // Modal
  isDetailModalOpen = false;
  isCancelModalOpen = false;
  selectedAppointment: AppointmentResponse | null = null;

  // Status mapping
  statusMap: { [key: number]: { text: string; class: string; icon: string } } = {
    0: { text: 'Chờ xác nhận', class: 'pending', icon: '⏳' },
    1: { text: 'Đã xác nhận', class: 'confirmed', icon: '✅' },
    2: { text: 'Hoàn thành', class: 'completed', icon: '🎉' },
    3: { text: 'Đã hủy', class: 'cancelled', icon: '❌' }
  };

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserId();
    this.loadAppointments();
  }

  loadUserId() {
    this.userId = this.authService.getUserId() || '';
    if (!this.userId) {
      this.router.navigate(['/auth/login']);
    }
  }

  loadAppointments() {
    if (!this.userId) return;

    this.isLoading = true;
    this.appointmentService.getUserAppointments(this.userId)
      .subscribe({
        next: (response: any) => {
          console.log('API Response:', response); // Debug
          
          // Extract data từ response và chuyển đổi định dạng
          const appointments = response.data || response || [];
          console.log('Appointments data:', appointments); // Debug
          
          this.appointments = appointments.sort((a: any, b: any) => {
            const dateA = this.createDateFromArray(a.appointmentDate);
            const dateB = this.createDateFromArray(b.appointmentDate);
            return dateB.getTime() - dateA.getTime();
          });
          
          console.log('Sorted appointments:', this.appointments); // Debug
          this.filterAppointments();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading appointments:', err);
          this.isLoading = false;
          this.showToastMessage('Lỗi khi tải danh sách lịch hẹn', 'error');
        }
      });
  }

  filterAppointments() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    switch (this.selectedTab) {
      case 'upcoming':
        this.filteredAppointments = this.appointments.filter(app => {
          const appDate = this.createDateFromArray(app.appointmentDate as any);
          appDate.setHours(0, 0, 0, 0);
          return appDate >= now && (app.status === 0 || app.status === 1);
        });
        break;
      case 'past':
        this.filteredAppointments = this.appointments.filter(app => {
          const appDate = this.createDateFromArray(app.appointmentDate as any);
          appDate.setHours(0, 0, 0, 0);
          return appDate < now || app.status === 2 || app.status === 3;
        });
        break;
      default:
        this.filteredAppointments = [...this.appointments];
    }
    
    console.log('Filtered appointments:', this.filteredAppointments); // Debug
  }

  // Hàm helper để tạo Date từ mảng
  private createDateFromArray(dateArray: number[]): Date {
    if (!dateArray || dateArray.length !== 3) return new Date();
    const [year, month, day] = dateArray;
    return new Date(year, month - 1, day); // month - 1 vì Date month bắt đầu từ 0
  }

  // Hàm helper để tạo time từ mảng
  private createTimeFromArray(timeArray: number[]): string {
    if (!timeArray || timeArray.length !== 2) return '00:00';
    const [hours, minutes] = timeArray;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  selectTab(tab: 'all' | 'upcoming' | 'past') {
    this.selectedTab = tab;
    this.filterAppointments();
  }

  openDetailModal(appointment: AppointmentResponse) {
    this.selectedAppointment = appointment;
    this.isDetailModalOpen = true;
  }

  closeDetailModal() {
    this.isDetailModalOpen = false;
    this.selectedAppointment = null;
  }

  openCancelModal(appointment: AppointmentResponse) {
    this.selectedAppointment = appointment;
    this.isCancelModalOpen = true;
  }

  closeCancelModal() {
    this.isCancelModalOpen = false;
    this.selectedAppointment = null;
  }

  cancelAppointment() {
    if (!this.selectedAppointment) return;

    this.isLoading = true;
    this.appointmentService.cancelAppointment(this.selectedAppointment.id, this.userId)
      .subscribe({
        next: () => {
          this.showToastMessage('Hủy lịch hẹn thành công!', 'success');
          this.loadAppointments();
          this.closeCancelModal();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error cancelling appointment:', err);
          this.isLoading = false;
          this.showToastMessage('Lỗi khi hủy lịch hẹn', 'error');
        }
      });
  }

  goToCarDetail(carId: string) {
    this.router.navigate(['/detail-car'], { queryParams: { id: carId } });
  }

  canCancel(appointment: AppointmentResponse): boolean {
    const appointmentDate = this.createDateFromArray(appointment.appointmentDate as any);
    const now = new Date();
    return appointmentDate > now && (appointment.status === 0 || appointment.status === 1);
  }

  formatDate(dateArray: number[]): string {
    const date = this.createDateFromArray(dateArray);
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  formatTime(timeArray: number[]): string {
    return this.createTimeFromArray(timeArray);
  }

  getStatusInfo(status: number) {
    return this.statusMap[status] || { text: 'Không xác định', class: 'unknown', icon: '❓' };
  }

  getDaysUntilAppointment(dateArray: number[]): number {
    const appointmentDate = this.createDateFromArray(dateArray);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);
    const diff = appointmentDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }

  showToastMessage(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    
    setTimeout(() => {
      this.hideToast();
    }, 5000);
  }

  hideToast() {
    this.showToast = false;
  }
}