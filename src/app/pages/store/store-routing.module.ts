import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardStoreComponent } from './dashboard-store/dashboard-store.component';
import { CarManagementComponent } from './dashboard-store/car-management/car-management.component';
import { HistoryComponent } from './dashboard-store/history/history.component';
import { ReportComponent } from './dashboard-store/report/report.component';
import { ProfileComponent } from './dashboard-store/profile/profile.component';

const routes: Routes = [
  { path: 'dashboard-store', 
    component: DashboardStoreComponent,
  children: [
    { path: 'car-management', component: CarManagementComponent },
    { path: 'history', component: HistoryComponent },
    { path: 'report', component: ReportComponent },
    { path: 'profile', component: ProfileComponent}
  ]
},
{path: 'store/report-store', component: ReportComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoreRoutingModule { }
