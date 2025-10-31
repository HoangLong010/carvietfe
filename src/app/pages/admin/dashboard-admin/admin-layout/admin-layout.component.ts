import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-layout',
  standalone: false,
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit {
  userInfo: any;

  ngOnInit(): void {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      this.userInfo = JSON.parse(profile).data;
    }
  }
}
