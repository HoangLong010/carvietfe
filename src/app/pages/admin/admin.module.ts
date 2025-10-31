import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin.component';
import { ReportAdminComponent } from './report-admin/report-admin.component';
import { RouterModule } from '@angular/router';
import { UserManagementComponent } from './dashboard-admin/user-management/user-management.component';
import { CarManagementComponent } from './dashboard-admin/car-management/car-management.component';
import { ReportComponent } from './dashboard-admin/report/report.component';
import { HistoryComponent } from './dashboard-admin/history/history.component';
import { FormsModule } from '@angular/forms';
import { AccountUserComponent } from './dashboard-admin/account-user/account-user.component';
import { AdminLayoutComponent } from './dashboard-admin/admin-layout/admin-layout.component';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [
    DashboardAdminComponent,
    ReportAdminComponent,
    UserManagementComponent,
    CarManagementComponent,
    ReportComponent,
    HistoryComponent,
    AccountUserComponent,
    AdminLayoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    AdminRoutingModule,
    FormsModule,
    // SharedRoutingModule,
    SharedModule
]
})
export class AdminModule { }
