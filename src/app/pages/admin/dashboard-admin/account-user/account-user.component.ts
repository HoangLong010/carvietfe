import { Component, OnInit } from '@angular/core';
import { AccountUserService, UserResponseItem } from '../../../../core/services/accout-user.service';

@Component({
  selector: 'app-account-user',
  standalone: false,
  templateUrl: './account-user.component.html',
  styleUrl: './account-user.component.scss'
})
export class AccountUserComponent implements OnInit {
getStatusLabel(status: number): string {
    switch (status) {
      case 1:
        return 'Hoạt động';
      case 0:
        return 'Không hoạt động';
      case 2:
        return 'Chờ duyệt';
      default:
        return 'Không xác định'; // Hoặc một giá trị mặc định khác
    }
  }

  page = 0;
  size = 5; // Đặt size là 5 để dễ thấy hiệu ứng phân trang hơn, bạn có thể điều chỉnh
  totalItems = 0;
  totalPages = 0; // Biến này sẽ được tính toán và cập nhật
  filter: { status: number | null; userName: string; accountType: number | null } = {
    status: null,
    userName: '',
    accountType: null
  };
  users: UserResponseItem[] = [];

  constructor(private userService: AccountUserService) {}

  ngOnInit(): void {
    this.onSearch();
  }

  onSearch(): void {
    const statusToSend = this.filter.status !== null ? this.filter.status : undefined;
    const accountTypeToSend = this.filter.accountType !== null ? this.filter.accountType : undefined;

    this.userService.getUsers(
      this.page,
      this.size,
      statusToSend,
      this.filter.userName,
      accountTypeToSend
    ).subscribe({
      next: (res) => {
        this.users = res.data.content;
        this.totalItems = res.data.currentTotalElementsCount;
        // Cập nhật totalPages sau khi nhận được totalItems
        this.totalPages = Math.ceil(this.totalItems / this.size);

         this.filter = {
          status: null,
          userName: '',
          accountType: null
        };
      },
      error: (err) => console.error(err)
    });
  }

  getAccountTypeLabel(accountType: number | null | undefined): string {
    switch (accountType) {
      case 1: return 'Quản trị viên';
      case 2: return 'Người dùng';
      case 3: return 'Đại lý';
      default: return 'Không xác định';
    }
  }

  isEditModalOpen = false;
  selectedUser: UserResponseItem = {} as UserResponseItem;

  openEditModal(user: UserResponseItem): void {
    this.selectedUser = { ...user }; // clone để tránh sửa trực tiếp
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
  }

  onSaveEdit(): void {
    const userId = this.selectedUser.userId; // Sử dụng userId trực tiếp
    // Đảm bảo roleId được gửi đúng định dạng mà backend mong đợi (ví dụ: số)
    // Nếu getAccountTypeLabel trả về string, bạn cần ánh xạ lại sang ID số tương ứng
    const roleIdToSend = this.selectedUser.accountType; // Giả định accountType là roleId

    const updatePayload = {
      fullName: this.selectedUser.fullName,
      email: this.selectedUser.email,
      phoneNumber: this.selectedUser.phoneNumber,
      address: this.selectedUser.address,
      roleId: roleIdToSend, // Sử dụng roleId đã được ánh xạ
      status: this.selectedUser.status,
      avatar: this.selectedUser.avatar
    };

    this.userService.updateUser(userId, updatePayload).subscribe({
      next: () => {
        this.closeEditModal();
        this.onSearch(); // Tải lại dữ liệu sau khi cập nhật
      },
      error: (err) => console.error(err)
    });
  }

  onBackdropClick(event: MouseEvent): void {
    // Đóng modal nếu click vào nền (backdrop) nhưng không phải nội dung modal
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeEditModal();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.onSearch();
    }
  }

  nextPage(): void {
    if ((this.page + 1) < this.totalPages) { // Kiểm tra đúng điều kiện
      this.page++;
      this.onSearch();
    }
  }
}
