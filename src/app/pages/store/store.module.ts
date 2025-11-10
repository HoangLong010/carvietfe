import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoreRoutingModule } from './store-routing.module';
import { DashboardStoreComponent } from './dashboard-store/dashboard-store.component';
import { CarManagementComponent } from './dashboard-store/car-management/car-management.component';
import { HistoryComponent } from './dashboard-store/history/history.component';
import { ReportComponent } from './dashboard-store/report/report.component';
import { Router, RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ProfileComponent } from './dashboard-store/profile/profile.component';
import { ChatComponent } from './dashboard-store/chat/chat.component';
import { ScheduleManagementComponent } from './dashboard-store/schedule-management/schedule-management.component';


@NgModule({
  declarations: [
    DashboardStoreComponent,
    CarManagementComponent,
    HistoryComponent,
    ReportComponent,
    ProfileComponent,
    ChatComponent,
    ScheduleManagementComponent
  ],
  imports: [
    CommonModule,
    StoreRoutingModule,
    RouterModule,
    SharedModule,
    FormsModule
  ]
})
export class StoreModule { }
