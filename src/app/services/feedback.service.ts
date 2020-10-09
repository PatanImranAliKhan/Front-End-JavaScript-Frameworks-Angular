import { Injectable } from '@angular/core';
import { baseURL } from '../shared/baseurl';
import { HttpClient } from '@angular/common/http';
import { Feedback } from '../shared/feedback';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {

  constructor(private http: HttpClient) { }
  submitFeedback(feedback: Feedback): Observable<Feedback>
  {
    return this.http.post<Feedback>(`${baseURL}feedback`,feedback);
  }
}
