// user-management.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/enviroment';

export interface UserResponseItem {
  userId: string;
  roleId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  username: string;
  avatar: string;
  status: number;
  createdDate: string;
  modifiedDate: string;
  accountType: number;
}

export interface UserResponsePage {
  content: UserResponseItem[];
  currentPage: number;
  pageSize: number;
  currentTotalElementsCount: number;
  pagesCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AccountUserService {

  private apiGetAll = `${environment.apiUrl}/user/get-all`;
  private apiUpdateUser = `${environment.apiUrl}/user/update`

  constructor(private http: HttpClient) { }

  getUsers(
    page: number,
    size: number,
    status?: number,
    userName?: string,
    accountType?: number
  ): Observable<{ data: UserResponsePage }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (status !== undefined) {
      params = params.set('status', status.toString());
    }
    if (userName) {
      params = params.set('userName', userName);
    }
    if (accountType !== undefined) {
      params = params.set('accountType', accountType.toString()); // ✅ thêm dòng này
    }

    return this.http.get<{ data: UserResponsePage }>(this.apiGetAll, { params });
  }

  updateUser(userId: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUpdateUser}/${userId}`, data);
  }

  updateUserWithAvatar(userId: string, userData: any, avatarFile?: File): Observable<any> {
    debugger;
    const formData = new FormData();

    const dataBlob = new Blob([JSON.stringify(userData)], { type: 'application/json' });
    formData.append('data', dataBlob);

    // Add avatar if provided
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    return this.http.post(`${this.apiUpdateUser}/${userId}`, formData);
  }
}
