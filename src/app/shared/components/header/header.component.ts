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
  showUserMenu: boolean = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      try {
        const profile = JSON.parse(userProfile);
        this.userName = profile?.data?.fullName || profile?.data?.username || profile?.data?.email || '';
      } catch {
        this.userName = '';
      }
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.authService.logout();
    localStorage.removeItem('userProfile');
    this.router.navigate(['/auth/login']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
    this.showUserMenu = false;
  }
}
