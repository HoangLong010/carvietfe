import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/enviroment';
import { AuthService } from './auth.service';

export interface CreateReviewRequest {
  userId: string;
  carId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewRequest {
  userId: string;
  rating: number;
  comment?: string;
}

export interface DeleteReviewRequest {
  userId: string;
}

export interface GetUserReviewRequest {
  userId: string;
}

export interface ReviewResponse {
  id: string;
  carId: string;
  carName: string;
  userId: string;
  storeId: string;
  rating: number;
  comment: string;
  reviewerName: string;
  reviewerAvatar: string;
  createdDate: string;
  modifiedDate: string;
}

export interface ReviewStatistics {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}

export interface ReviewPageResponse {
  content: ReviewResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
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
export class ReviewService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  createReview(carId: string, rating: number, comment?: string): Observable<ApiResponse<ReviewResponse>> {
    const userId = this.authService.getUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }

    const request: CreateReviewRequest = {
      userId: userId,
      carId: carId,
      rating: rating,
      comment: comment
    };

    return this.http.post<ApiResponse<ReviewResponse>>(
      `${environment.apiUrl}/reviews/create`,
      request
    );
  }

  getReviewsByCarId(carId: string, page: number = 0, size: number = 10): Observable<ApiResponse<ReviewPageResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ApiResponse<ReviewPageResponse>>(
      `${environment.apiUrl}/reviews/car/${carId}`,
      { params }
    );
  }

  getReviewStatistics(carId: string): Observable<ApiResponse<ReviewStatistics>> {
    return this.http.get<ApiResponse<ReviewStatistics>>(
      `${environment.apiUrl}/reviews/statistics/${carId}`
    );
  }

  getUserReviewForCar(carId: string): Observable<ApiResponse<ReviewResponse>> {
    const userId = this.authService.getUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }

    const request: GetUserReviewRequest = {
      userId: userId
    };

    return this.http.post<ApiResponse<ReviewResponse>>(
      `${environment.apiUrl}/reviews/user-review/${carId}`,
      request
    );
  }

  // ===== PHƯƠNG THỨC MỚI: Lấy tất cả reviews của user =====
  getUserReviews(): Observable<ApiResponse<ReviewResponse[]>> {
    const userId = this.authService.getUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }

    return this.http.get<ApiResponse<ReviewResponse[]>>(
      `${environment.apiUrl}/reviews/user/${userId}`
    );
  }

  updateReview(reviewId: string, rating: number, comment?: string): Observable<ApiResponse<ReviewResponse>> {
    const userId = this.authService.getUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }

    const request: UpdateReviewRequest = {
      userId: userId,
      rating: rating,
      comment: comment
    };

    return this.http.post<ApiResponse<ReviewResponse>>(
      `${environment.apiUrl}/reviews/update/${reviewId}`,
      request
    );
  }

  deleteReview(reviewId: string): Observable<ApiResponse<void>> {
    const userId = this.authService.getUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }

    const request: DeleteReviewRequest = {
      userId: userId
    };

    return this.http.post<ApiResponse<void>>(
      `${environment.apiUrl}/reviews/delete/${reviewId}`,
      request
    );
  }
}