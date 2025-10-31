import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard-admin',
  standalone: false,
  templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.scss'
})
export class DashboardAdminComponent implements OnInit {
  userName: string = '';
  showDropdown: boolean = false;

  ngOnInit(): void {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      const parsed = JSON.parse(profile);
      this.userName = parsed.data.fullName || parsed.data.username;
    }
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  logout(): void {
    localStorage.clear();
    window.location.href = '/auth/login';
  }
}
