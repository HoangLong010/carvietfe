import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './shared/components/home/home.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ProfileComponent } from './shared/components/profile/profile.component';
import { DetailCarComponent } from './shared/components/detail-car/detail-car.component';
import { CarNewComponent } from './shared/components/car-new/car-new.component';
import { CarOldComponent } from './shared/components/car-old/car-old.component';
import { StoreComponent } from './shared/components/store/store.component';
import { DetailStoreComponent } from './shared/components/detail-store/detail-store.component';
import { FineCheckComponent } from './shared/components/fine-check/fine-check.component';
import { ChatComponent } from './shared/components/chat/chat.component';

const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'home', component: HomeComponent
  },
  {
    path: 'header', component: HeaderComponent
  },
  {
    path: 'footer', component: FooterComponent
  },
  {
    path: 'detail-car', component: DetailCarComponent
  },
   {
    path: 'car-new', component: CarNewComponent
  },
   {
    path: 'car-old', component: CarOldComponent
  },
  {
    path: 'fine-check', component: FineCheckComponent
  },
  {
    path: 'chat', component: ChatComponent
  },
  { path: 'profile', component: ProfileComponent },
  { path: 'store', component: StoreComponent },
  { path: 'detail-store/:userId', component: DetailStoreComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'stores', loadChildren: () => import('./pages/store/store.module').then(m => m.StoreModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
