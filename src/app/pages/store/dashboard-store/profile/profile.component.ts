import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  userInfo: any;

  ngOnInit(): void {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      this.userInfo = JSON.parse(profile).data;
    }
  }
}
