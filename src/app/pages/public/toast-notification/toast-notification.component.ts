import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-toast-notification',
  standalone: false,
  template: `
    <div class="toast-container" [@toastAnimation]="isVisible ? 'visible' : 'hidden'">
      <div class="toast-message {{type}}">
        <p>{{ message }}</p>
        <button (click)="close()">X</button>
      </div>
    </div>
  `,
  styleUrls: ['./toast-notification.component.scss'],
  animations: [
    trigger('toastAnimation', [
      // Trạng thái ẩn (ngoài màn hình, mờ)
      state('hidden', style({
        right: '-300px', // Bắt đầu từ ngoài màn hình bên phải
        opacity: 0
      })),
      // Trạng thái hiển thị (vào màn hình, rõ nét)
      state('visible', style({
        right: '20px', // Vị trí hiển thị trên màn hình
        opacity: 1
      })),
      // Chuyển đổi từ ẩn sang hiển thị (trượt vào)
      transition('hidden => visible', [
        animate('300ms ease-out') // Hoạt ảnh 300ms, hiệu ứng ease-out
      ]),
      // Chuyển đổi từ hiển thị sang ẩn (trượt ra)
      transition('visible => hidden', [
        animate('400ms ease-in') // Hoạt ảnh 300ms, hiệu ứng ease-in
      ])
    ])
  ]
})
export class ToastNotificationComponent implements OnInit, OnDestroy {
  @Input() message: string = ''; // Nội dung thông báo
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'error'; // Loại thông báo (quyết định màu sắc)
  @Input() duration: number = 1500; // Thời gian hiển thị (miliseconds), mặc định 3 giây
  @Output() closed = new EventEmitter<void>(); // Sự kiện phát ra khi toast đóng

  isVisible: boolean = false; // Biến kiểm soát trạng thái hiển thị của toast
  private unsubscribe$ = new Subject<void>(); // Dùng để hủy đăng ký timer khi component bị hủy

  ngOnInit(): void {
    // Nếu có message được truyền vào, hiển thị toast
    if (this.message) {
      this.show();
    }
  }

  ngOnDestroy(): void {
    // Hủy đăng ký tất cả các subscription để tránh rò rỉ bộ nhớ
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /**
   * Hiển thị toast notification.
   * Thiết lập timer để tự động đóng toast sau khoảng thời gian `duration`.
   */
  show(): void {
    this.isVisible = true;
    // Sử dụng timer để tự động đóng toast
    timer(this.duration).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.close();
    });
  }

  /**
   * Đóng toast notification.
   * Phát ra sự kiện `closed` sau một khoảng thời gian ngắn để hoạt ảnh đóng hoàn tất.
   */
  close(): void {
    this.isVisible = false;
    // Delay emitting the closed event to allow the animation to finish
    timer(300).subscribe(() => {
      this.closed.emit();
    });
  }
}
