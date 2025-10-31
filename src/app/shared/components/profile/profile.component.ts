import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  activeTab: 'info' | 'password' = 'info';

  constructor(private router: Router, private authService: AuthService) {}

  logout() {
    this.authService.logout();
    localStorage.removeItem('userProfile');
    this.router.navigate(['/auth/login']);
  }
}
