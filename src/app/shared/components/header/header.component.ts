import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  userName: string = '';
  createDate: string = ''; // Chứa chuỗi ngày
  userAvatar: string = ''; // Biến chứa link ảnh
  showUserMenu: boolean = false;
  isLoggedIn: boolean = false;

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      try {
        const profile = JSON.parse(userProfile);
        if (profile?.data?.userId) {
          this.isLoggedIn = true;
          this.userName = profile?.data?.fullName || profile?.data?.username || profile?.data?.email || '';
          this.createDate = profile?.data?.createDate || '';
          this.userAvatar = profile?.data?.avatar || '';
        } else {
          this.isLoggedIn = false;
          this.userName = '';
        }

      } catch {
        this.isLoggedIn = false;
        this.userName = '';
      }
    } else {
      this.isLoggedIn = false;
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.authService.logout();
    localStorage.removeItem('userProfile');
    this.isLoggedIn = false; // Cập nhật lại trạng thái
    this.router.navigate(['/auth/login']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
    this.showUserMenu = false;
  }

  // Hàm chuyển hướng đến trang đăng nhập
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
    this.showUserMenu = false;
  }
}
