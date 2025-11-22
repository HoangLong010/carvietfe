// dealer-appointments.component.ts
import { Component, OnInit } from '@angular/core';
import { AppointmentService, AppointmentResponse, AppointmentStatistics } from '../../../../core/services/appointment.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-dealer-appointments',
  standalone: false,
  templateUrl: './dealer-appointments.component.html',
  styleUrls: ['./dealer-appointments.component.scss']
})
export class DealerAppointmentsComponent implements OnInit {
  appointments: AppointmentResponse[] = [];
  filteredAppointments: AppointmentResponse[] = [];
  statistics: AppointmentStatistics = {
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    total: 0
  };

  dealerId: string = '';
  isLoading = false;
  selectedDate: string = '';
  selectedStatus: number | null = null;

  // Filter options
  filterMode: 'all' | 'date' | 'status' = 'all';

  // Toast notification
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' | 'warning' = 'success';

  // Modal
  isDetailModalOpen = false;
  selectedAppointment: AppointmentResponse | null = null;
  isRejectModalOpen = false;
  rejectReason = '';

  // Status mapping
  statusMap: { [key: number]: { text: string; class: string; icon: string } } = {
    0: { text: 'Chờ xác nhận', class: 'pending', icon: '⏳' },
    1: { text: 'Đã xác nhận', class: 'confirmed', icon: '✅' },
    2: { text: 'Hoàn thành', class: 'completed', icon: '🎉' },
    3: { text: 'Đã hủy', class: 'cancelled', icon: '❌' }
  };

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadDealerId();
    this.loadAllAppointments();
    this.loadStatistics();
  }

  loadDealerId() {
    this.dealerId = this.authService.getUserId() || '';
    if (!this.dealerId) {
      this.showToastMessage('Không tìm thấy thông tin cửa hàng', 'error');
    }
  }

  loadAllAppointments() {
    if (!this.dealerId) return;

    this.isLoading = true;
    this.appointmentService.getAllDealerAppointments(this.dealerId)
      .subscribe({
        next: (appointments) => {
          console.log('Appointments loaded:', appointments); // Debug log

          // SỬA: Sử dụng createDateFromArray để sort
          this.appointments = appointments.sort((a, b) => {
            const dateA = this.createDateFromArray(a.appointmentDate);
            const dateB = this.createDateFromArray(b.appointmentDate);
            return dateB.getTime() - dateA.getTime();
          });

          this.filteredAppointments = [...this.appointments];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading appointments:', err);
          this.isLoading = false;
          this.showToastMessage('Lỗi khi tải danh sách lịch hẹn', 'error');
        }
      });
  }

  // Thêm hàm helper createDateFromArray nếu chưa có
  private createDateFromArray(dateArray: number[]): Date {
    if (!dateArray || dateArray.length !== 3) return new Date();
    const [year, month, day] = dateArray;
    return new Date(year, month - 1, day); // month - 1 vì Date month bắt đầu từ 0
  }

  loadStatistics() {
    if (!this.dealerId) return;

    this.appointmentService.getAppointmentStatistics(this.dealerId)
      .subscribe({
        next: (stats) => {
          console.log('Statistics loaded:', stats); // Debug log
          this.statistics = stats;
        },
        error: (err) => {
          console.error('Error loading statistics:', err);
          this.showToastMessage('Lỗi khi tải thống kê', 'error');
        }
      });
  }

  // Filter methods
  filterByAll() {
    this.filterMode = 'all';
    this.selectedDate = '';
    this.selectedStatus = null;
    this.filteredAppointments = [...this.appointments];
  }

  filterByDate() {
    if (!this.selectedDate) return;

    this.filterMode = 'date';
    this.selectedStatus = null;
    this.isLoading = true;

    this.appointmentService.getDealerAppointments(this.dealerId, this.selectedDate)
      .subscribe({
        next: (appointments) => {
          this.filteredAppointments = appointments;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error filtering by date:', err);
          this.isLoading = false;
          this.showToastMessage('Lỗi khi lọc theo ngày', 'error');
        }
      });
  }

  filterByStatus(status: number) {
    this.filterMode = 'status';
    this.selectedStatus = status;
    this.selectedDate = '';
    this.isLoading = true;

    this.appointmentService.getDealerAppointmentsByStatus(this.dealerId, status)
      .subscribe({
        next: (appointments) => {
          this.filteredAppointments = appointments;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error filtering by status:', err);
          this.isLoading = false;
          this.showToastMessage('Lỗi khi lọc theo trạng thái', 'error');
        }
      });
  }

  // Action methods
  confirmAppointment(appointment: AppointmentResponse) {
    if (!confirm(`Xác nhận lịch hẹn với ${appointment.customerName}?`)) return;

    this.isLoading = true;
    this.appointmentService.confirmAppointment(appointment.id, this.dealerId)
      .subscribe({
        next: () => {
          this.showToastMessage('Xác nhận lịch hẹn thành công!', 'success');
          this.loadAllAppointments();
          this.loadStatistics();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error confirming appointment:', err);
          this.isLoading = false;
          this.showToastMessage('Lỗi khi xác nhận lịch hẹn', 'error');
        }
      });
  }

  openRejectModal(appointment: AppointmentResponse) {
    this.selectedAppointment = appointment;
    this.isRejectModalOpen = true;
    this.rejectReason = '';
  }

  rejectAppointment() {
    if (!this.selectedAppointment) return;

    this.isLoading = true;
    this.appointmentService.rejectAppointment(
      this.selectedAppointment.id,
      this.dealerId,
      this.rejectReason
    ).subscribe({
      next: () => {
        this.showToastMessage('Từ chối lịch hẹn thành công!', 'success');
        this.loadAllAppointments();
        this.loadStatistics();
        this.closeRejectModal();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error rejecting appointment:', err);
        this.isLoading = false;
        this.showToastMessage('Lỗi khi từ chối lịch hẹn', 'error');
      }
    });
  }

  completeAppointment(appointment: AppointmentResponse) {
    if (!confirm(`Đánh dấu lịch hẹn với ${appointment.customerName} đã hoàn thành?`)) return;

    this.isLoading = true;
    this.appointmentService.completeAppointment(appointment.id, this.dealerId)
      .subscribe({
        next: () => {
          this.showToastMessage('Đánh dấu hoàn thành thành công!', 'success');
          this.loadAllAppointments();
          this.loadStatistics();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error completing appointment:', err);
          this.isLoading = false;
          this.showToastMessage('Lỗi khi đánh dấu hoàn thành', 'error');
        }
      });
  }

  // Modal methods
  openDetailModal(appointment: AppointmentResponse) {
    this.selectedAppointment = appointment;
    this.isDetailModalOpen = true;
  }

  closeDetailModal() {
    this.isDetailModalOpen = false;
    this.selectedAppointment = null;
  }

  closeRejectModal() {
    this.isRejectModalOpen = false;
    this.selectedAppointment = null;
    this.rejectReason = '';
  }

  // Helper methods
  // Sửa các hàm formatDate và formatTime để xử lý mảng số
  formatDate(dateArray: number[]): string {
    try {
      if (!dateArray || dateArray.length !== 3) {
        return 'Ngày không hợp lệ';
      }
      const [year, month, day] = dateArray;
      const date = new Date(year, month - 1, day); // month - 1 vì Date month bắt đầu từ 0
      return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', dateArray, error);
      return 'Ngày không hợp lệ';
    }
  }

  formatTime(timeArray: number[]): string {
    try {
      if (!timeArray || timeArray.length !== 2) return '--:--';
      const [hours, minutes] = timeArray;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error formatting time:', timeArray, error);
      return '--:--';
    }
  }

  getStatusInfo(status: number) {
    return this.statusMap[status] || { text: 'Không xác định', class: 'unknown', icon: '❓' };
  }

  canConfirm(appointment: AppointmentResponse): boolean {
    return appointment.status === 0;
  }

  canReject(appointment: AppointmentResponse): boolean {
    return appointment.status === 0 || appointment.status === 1;
  }

  canComplete(appointment: AppointmentResponse): boolean {
    return appointment.status === 1;
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