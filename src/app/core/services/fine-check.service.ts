// Service để gọi API
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FineCheckService {
  private readonly CSGT_API = 'https://phatnguoi.gso.gov.vn/api/check';
  
  constructor(private http: HttpClient) {}

  checkFineCSGT(licensePlate: string) {
    return this.http.post(this.CSGT_API, {
      bien_so: licensePlate
    });
  }
}