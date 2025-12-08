import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReviewService, ReviewResponse } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-my-reviews',
  standalone: false,
  templateUrl: './my-reviews.component.html',
  styleUrls: ['./my-reviews.component.scss']
})
export class MyReviewsComponent implements OnInit {
  reviews: ReviewResponse[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  editingReview: ReviewResponse | null = null;
  editRating: number = 5;
  editComment: string = '';

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMyReviews();
  }

  loadMyReviews(): void {
    this.loading = true;
    this.reviewService.getUserReviews().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.reviews = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.errorMessage = 'Không thể tải danh sách đánh giá';
        this.loading = false;
      }
    });
  }

  startEdit(review: ReviewResponse): void {
    this.editingReview = review;
    this.editRating = review.rating;
    this.editComment = review.comment || '';
  }

  cancelEdit(): void {
    this.editingReview = null;
    this.editRating = 5;
    this.editComment = '';
  }

  saveEdit(): void {
    if (!this.editingReview) return;

    this.reviewService.updateReview(
      this.editingReview.id,
      this.editRating,
      this.editComment
    ).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Cập nhật đánh giá thành công');
          this.cancelEdit();
          this.loadMyReviews();
        }
      },
      error: (error) => {
        console.error('Error updating review:', error);
        alert('Có lỗi xảy ra khi cập nhật đánh giá');
      }
    });
  }

  deleteReview(reviewId: string): void {
    if (confirm('Bạn có chắc muốn xóa đánh giá này?')) {
      this.reviewService.deleteReview(reviewId).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Đã xóa đánh giá');
            this.loadMyReviews();
          }
        },
        error: (error) => {
          console.error('Error deleting review:', error);
          alert('Có lỗi xảy ra khi xóa đánh giá');
        }
      });
    }
  }

  viewCarDetail(carId: string): void {
    this.router.navigate(['/car-detail', carId]);
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - rating).fill(0);
  }
}