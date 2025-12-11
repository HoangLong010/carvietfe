// schedule-management.component.ts
import { Component, OnInit } from '@angular/core';
import {
  AppointmentService,
  DealerScheduleResponse,
  DealerScheduleRequest
} from '../../../../core/services/appointment.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-schedule-management',
  standalone: false,
  templateUrl: './schedule-management.component.html',
  styleUrls: ['./schedule-management.component.scss']
})
export class ScheduleManagementComponent implements OnInit {
  schedules: DealerScheduleResponse[] = [];
  editSchedules: DealerScheduleResponse[] = [];
  isEditModalOpen = false;
  isBatchMode = false;
  currentEditSchedule: DealerScheduleResponse | null = null;
  dealerId: string = '';
  isLoading = false;

  // Toast notification
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' | 'warning' = 'success';

  // Days of week mapping
  daysOfWeek = [
    { id: 1, name: 'Chủ Nhật' },
    { id: 2, name: 'Thứ 2' },
    { id: 3, name: 'Thứ 3' },
    { id: 4, name: 'Thứ 4' },
    { id: 5, name: 'Thứ 5' },
    { id: 6, name: 'Thứ 6' },
    { id: 7, name: 'Thứ 7' }
  ];

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadDealerId();
    this.loadSchedules();
  }

  loadDealerId() {
    this.dealerId = this.authService.getUserId() || '';
    if (!this.dealerId) {
      this.showToastMessage('Không tìm thấy thông tin cửa hàng', 'error');
    }
  }

  loadSchedules() {
    if (!this.dealerId) {
      this.isLoading = false;
      console.error('No dealerId found:', this.dealerId);
      return;
    }

    this.isLoading = true;
    console.log('Loading schedules for dealer:', this.dealerId);

    this.appointmentService.getDealerSchedules(this.dealerId)
      .subscribe({
        next: (schedules) => {
          console.log('Schedules loaded:', schedules);
          this.schedules = schedules;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading schedules:', err);
          this.isLoading = false;
          this.showToastMessage('Lỗi khi tải lịch làm việc', 'error');
        }
      });
  }

  // Mở modal thêm lịch
  openAddScheduleModal(dayOfWeek: number) {
    const dayName = this.daysOfWeek.find(d => d.id === dayOfWeek)?.name || '';

    this.currentEditSchedule = {
      id: '',
      dealerId: this.dealerId,
      dayOfWeek: dayOfWeek,
      dayName: dayName,
      startTime: '08:00',
      endTime: '17:00',
      slotDuration: 60,
      isActive: true
    };

    this.isBatchMode = false;
    this.isEditModalOpen = true;
  }

  // Mở modal chỉnh sửa lịch
  openEditScheduleModal(schedule: DealerScheduleResponse) {
    this.currentEditSchedule = { ...schedule };
    this.isBatchMode = false;
    this.isEditModalOpen = true;
  }

  // Mở modal chỉnh sửa hàng loạt
  openBatchEditModal() {
    this.editSchedules = this.daysOfWeek.map(day => {
      const existing = this.schedules.find(s => s.dayOfWeek === day.id);

      if (existing) {
        return { ...existing };
      } else {
        return {
          id: '',
          dealerId: this.dealerId,
          dayOfWeek: day.id,
          dayName: day.name,
          startTime: '08:00',
          endTime: '17:00',
          slotDuration: 60,
          isActive: day.id !== 1 // Chủ nhật tắt mặc định
        };
      }
    });

    this.isBatchMode = true;
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.isBatchMode = false;
    this.currentEditSchedule = null;
    this.editSchedules = [];
  }

  // Lưu 1 lịch đơn lẻ
  saveSingleSchedule() {
    if (!this.currentEditSchedule || !this.dealerId) {
      this.showToastMessage('Dữ liệu không hợp lệ', 'error');
      return;
    }

    if (!this.validateSchedule(this.currentEditSchedule)) {
      return;
    }

    this.isLoading = true;

    const request: DealerScheduleRequest = {
      dealerId: this.dealerId,
      dayOfWeek: this.currentEditSchedule.dayOfWeek,
      startTime: this.formatTimeForBackend(this.currentEditSchedule.startTime),
      endTime: this.formatTimeForBackend(this.currentEditSchedule.endTime),
      slotDuration: this.currentEditSchedule.slotDuration,
      isActive: this.currentEditSchedule.isActive
    };

    const isNew = !this.currentEditSchedule.id;
    const apiCall = isNew
      ? this.appointmentService.createDealerSchedule(request)
      : this.appointmentService.updateDealerSchedule(this.currentEditSchedule.id, request);

    apiCall.subscribe({
      next: () => {
        this.loadSchedules();
        this.closeEditModal();
        this.isLoading = false;
        this.showToastMessage(
          isNew ? 'Tạo lịch làm việc thành công!' : 'Cập nhật lịch làm việc thành công!',
          'success'
        );
      },
      error: (err) => {
        console.error('Error saving schedule:', err);
        this.isLoading = false;
        this.showToastMessage('Lỗi khi lưu lịch: ' + (err.error?.message || err.message), 'error');
      }
    });
  }

  // Lưu hàng loạt
  saveBatchSchedules() {
    if (!this.dealerId) {
      this.showToastMessage('Không tìm thấy thông tin cửa hàng', 'error');
      return;
    }

    // Validate all schedules
    for (const schedule of this.editSchedules) {
      if (!this.validateSchedule(schedule)) {
        return;
      }
    }

    this.isLoading = true;

    const requests: DealerScheduleRequest[] = this.editSchedules.map(schedule => ({
      dealerId: this.dealerId,
      dayOfWeek: schedule.dayOfWeek,
      startTime: this.formatTimeForBackend(schedule.startTime),
      endTime: this.formatTimeForBackend(schedule.endTime),
      slotDuration: schedule.slotDuration,
      isActive: schedule.isActive
    }));

    this.appointmentService.updateDealerSchedules(requests).subscribe({
      next: () => {
        this.loadSchedules();
        this.closeEditModal();
        this.isLoading = false;
        this.showToastMessage('Cập nhật tất cả lịch làm việc thành công!', 'success');
      },
      error: (err) => {
        console.error('Error in batch save:', err);
        this.isLoading = false;
        this.showToastMessage('Lỗi khi lưu lịch: ' + (err.error?.message || err.message), 'error');
      }
    });
  }

  // Xóa lịch
  deleteSchedule(schedule: DealerScheduleResponse) {
    if (!confirm(`Bạn có chắc muốn xóa lịch làm việc ${schedule.dayName}?`)) {
      return;
    }

    this.isLoading = true;
    this.appointmentService.deleteDealerSchedule(schedule.id).subscribe({
      next: () => {
        this.loadSchedules();
        this.isLoading = false;
        this.showToastMessage('Xóa lịch làm việc thành công!', 'success');
      },
      error: (err) => {
        console.error('Error deleting schedule:', err);
        this.isLoading = false;
        this.showToastMessage('Lỗi khi xóa lịch: ' + (err.error?.message || err.message), 'error');
      }
    });
  }

  // Helper methods
  hasSchedule(dayOfWeek: number): boolean {
    return this.schedules.some(s => s.dayOfWeek === dayOfWeek);
  }

  getScheduleByDay(dayOfWeek: number): DealerScheduleResponse | undefined {
    return this.schedules.find(s => s.dayOfWeek === dayOfWeek);
  }

  formatTime(time: string): string {
    if (!time) return '';
    return time.substring(0, 5);
  }

  private formatTimeForBackend(time: string): string {
    return time + ':00';
  }

  private validateSchedule(schedule: DealerScheduleResponse): boolean {
    if (schedule.isActive) {
      if (schedule.startTime >= schedule.endTime) {
        this.showToastMessage(`Giờ kết thúc phải sau giờ bắt đầu (${schedule.dayName})`, 'error');
        return false;
      }

      if (schedule.slotDuration < 15 || schedule.slotDuration > 120) {
        this.showToastMessage(`Thời gian mỗi khung phải từ 15-120 phút (${schedule.dayName})`, 'error');
        return false;
      }
    }
    return true;
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