import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-layout',
  standalone: false,
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit {
  userInfo: any;
  userName: string = '';
  createDate: string = '';
  userAvatar: string = '';
  address: string = '';
  phone: string = '';
  email: string = '';

  constructor() { }
  ngOnInit(): void {
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      try {
        const profile = JSON.parse(userProfile);
        this.userName = profile?.data?.fullName;
        this.createDate = profile?.data?.createDate || '';
        this.address = profile?.data?.address || '';
        this.userAvatar = profile?.data?.avatar || '';
        this.phone = profile?.data?.phoneNumber || '';
        this.email = profile?.data?.email || '';
      } catch {
        this.userName = '';
      }
    }
  }
}
