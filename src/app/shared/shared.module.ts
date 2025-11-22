import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { ToastNotificationComponent } from '../pages/public/toast-notification/toast-notification.component';
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { FooterComponent } from './components/footer/footer.component';
import { ProfileComponent } from './components/profile/profile.component';
import { DetailCarComponent } from './components/detail-car/detail-car.component';
import { CarNewComponent } from './components/car-new/car-new.component';
import { CarOldComponent } from './components/car-old/car-old.component';
import { StoreComponent } from './components/store/store.component';
import { DetailStoreComponent } from './components/detail-store/detail-store.component';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FineCheckComponent } from './components/fine-check/fine-check.component';
import { HttpClientModule } from '@angular/common/http';
import { ChatComponent } from './components/chat/chat.component';
import { UserAppointmentsComponent } from './components/user-appointments/user-appointments.component';
import { LoadingComponent } from './components/loading/loading.component';


@NgModule({
  declarations: [
    ToastNotificationComponent,
    HeaderComponent,
    HomeComponent,
    FooterComponent,
    ProfileComponent,
    DetailCarComponent,
    CarNewComponent,
    CarOldComponent,
    StoreComponent,
    DetailStoreComponent,
    FineCheckComponent,
    ChatComponent,
    UserAppointmentsComponent,
    LoadingComponent
  ],
  imports: [
    CommonModule,
    SharedRoutingModule,
    FormsModule,
    RouterModule,
    HttpClientModule
  ],
  exports: [
    ToastNotificationComponent,
    HeaderComponent,
    HomeComponent,
    FooterComponent,
    LoadingComponent
  ]
})
export class SharedModule { }
