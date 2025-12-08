// favorite.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/enviroment';
import { AuthService } from './auth.service';

export interface FavoriteCarRequest {
  userId: string;  // THÊM FIELD NÀY
  carId: string;
}

export interface FavoriteCarResponse {
  carId: string;
  favorite: boolean;
  message: string;
}

export interface CarFavoriteInfo {
  carId: string;
  description: string;    // Tên xe
  brandName: string;
  model: string;
  year: number;
  price: number;
  location: string;
  imageUrl?: string;
}

export interface UserFavoritesResponse {
  favoriteCars: CarFavoriteInfo[];
  totalFavorites: number;
}

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  data: T;
  error_code: number;
  message: string;
  description: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  toggleFavorite(carId: string): Observable<ApiResponse<FavoriteCarResponse>> {
    const userId = this.authService.getUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }

    const request: FavoriteCarRequest = { 
      userId: userId,  // GỬI USERID TRONG BODY
      carId: carId 
    };

    return this.http.post<ApiResponse<FavoriteCarResponse>>(
      `${environment.apiUrl}/favorite/toggle`, 
      request  // CHỈ GỬI BODY, KHÔNG CÓ HEADERS
    );
  }

  getUserFavorites(): Observable<ApiResponse<UserFavoritesResponse>> {
    const userId = this.authService.getUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }

    // GỬI USERID TRONG QUERY PARAMS
    const params = new HttpParams().set('userId', userId);

    return this.http.get<ApiResponse<UserFavoritesResponse>>(
      `${environment.apiUrl}/favorite`, 
      { params }  // GỬI QUERY PARAMS
    );
  }

  getFavoriteCarsWithDetails(): Observable<ApiResponse<FavoriteCarResponse[]>> {
    const userId = this.authService.getUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }

    // GỬI USERID TRONG QUERY PARAMS
    const params = new HttpParams().set('userId', userId);

    return this.http.get<ApiResponse<FavoriteCarResponse[]>>(
      `${environment.apiUrl}/favorite/details`, 
      { params }  // GỬI QUERY PARAMS
    );
  }
}