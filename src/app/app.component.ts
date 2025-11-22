import { Component } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'carviet-fe.com';
  constructor(
    private router: Router,
    private loadingService: LoadingService
  ) {
    this.setupRouterEvents();
  }

  private setupRouterEvents() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loadingService.show();
      }
      if (event instanceof NavigationEnd) {
        setTimeout(() => {
          this.loadingService.hide();
        }, 300);
      }
    });
  }
}
