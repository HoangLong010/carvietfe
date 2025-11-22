import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardStoreComponent } from './dashboard-store/dashboard-store.component';
import { CarManagementComponent } from './dashboard-store/car-management/car-management.component';
import { HistoryComponent } from './dashboard-store/history/history.component';
import { ReportComponent } from './dashboard-store/report/report.component';
import { ProfileComponent } from './dashboard-store/profile/profile.component';
import { ChatComponent } from './dashboard-store/chat/chat.component';
import { ScheduleManagementComponent } from './dashboard-store/schedule-management/schedule-management.component';
import { DealerAppointmentsComponent } from './dashboard-store/dealer-appointments/dealer-appointments.component';
import { BrandComponent } from './dashboard-store/brand/brand.component';

const routes: Routes = [
  { path: 'dashboard-store', 
    component: DashboardStoreComponent,
  children: [
    { path: 'car-management', component: CarManagementComponent },
    { path: 'history', component: HistoryComponent },
    { path: 'report', component: ReportComponent },
    { path: 'profile', component: ProfileComponent},
    { path: 'chat', component: ChatComponent},
    { path: 'schedule-management', component: ScheduleManagementComponent},
    { path: 'appointment-management', component: DealerAppointmentsComponent},
    { path: 'brand-management', component: BrandComponent}
  ]
},
{path: 'store/report-store', component: ReportComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoreRoutingModule { }
