import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReviewDto } from './review.model';
import { Observable } from 'rxjs';
import { environment } from './environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/api/reviews`;

  constructor(private http: HttpClient) { }

  createReview(review: ReviewDto): Observable<any> {
    return this.http.post(this.apiUrl, review);
  }

  getReviewsBySpace(spaceId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/space/${spaceId}`);
  }
}