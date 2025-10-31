import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin.component';
import { ReportAdminComponent } from './report-admin/report-admin.component';
import { CarManagementComponent } from './dashboard-admin/car-management/car-management.component';
import { UserManagementComponent } from './dashboard-admin/user-management/user-management.component';
import { ReportComponent } from './dashboard-admin/report/report.component';
import { HistoryComponent } from './dashboard-admin/history/history.component';
import { AccountUserComponent } from './dashboard-admin/account-user/account-user.component';
import { AdminLayoutComponent } from './dashboard-admin/admin-layout/admin-layout.component';

const routes: Routes = [
  { path: 'admin/dashboard-admin', 
    component: DashboardAdminComponent,
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
       { path: 'car-management', component: CarManagementComponent },
       { path: 'user-management', component: UserManagementComponent },
       { path: 'report', component: ReportComponent },
       { path: 'history', component: HistoryComponent },
       { path: 'account-user', component: AccountUserComponent },
       { path: 'profile', component: AdminLayoutComponent },
       
    ]
  },
  { path: 'admin/report-admin', component: ReportAdminComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
