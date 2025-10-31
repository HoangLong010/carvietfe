// src/app/services/task-history.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/enviroment';

interface TaskResponse {
  data: { task: string }[];
  success: boolean;
  code: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskHistoryService {
  private selectList = `${environment.apiUrl}/task-history/select`; // Cập nhật URL thật
  private findAll = `${environment.apiUrl}/task-history/get-all`; // Cập nhật URL thật

  constructor(private http: HttpClient) {}

  getTaskList(): Observable<TaskResponse> {
    return this.http.get<TaskResponse>(this.selectList);
  }

   getAllHistories(
    body: TaskHistoryRequest,
    page: number = 0,
    size: number = 10
  ): Observable<{ data: TaskHistoryResponse }> {
    const url = `${environment.apiUrl}/task-history/get-all`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.post<{ data: TaskHistoryResponse }>(url, body, { params });
  }
}

export interface TaskHistoryRequest {
  startDate: string;
  endDate: string;
  content?: string;
  createdBy?: string;
  task?: string | null;
}
export interface TaskHistoryItem {
expanded: any;
  createdDate: string;
  createdBy: string;
  task: string;
  content: string;
}

export interface TaskHistoryResponse {
  content: TaskHistoryItem[];
  currentPage: number;
  pageSize: number;
  currentTotalElementsCount: number;
  pagesCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

