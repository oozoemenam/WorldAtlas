import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { LoginRequest } from './login-request.model';
import { LoginResponse } from './login-response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey: string = 'token';
  private _authStatus = new BehaviorSubject<boolean>(false);
  public authStatus = this._authStatus.asObservable();

  constructor(protected http: HttpClient) {}

  get isAuthenticated(): boolean {
    return localStorage.getItem(this.tokenKey) != null;
  }

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  init(): void {
    if (this.isAuthenticated) this._authStatus.next(true);
  }

  login(loginRequest: LoginRequest): Observable<LoginResponse> {
    const url = environment.baseUrl + '/Account/Login';
    return this.http.post<LoginResponse>(url, loginRequest).pipe(
      tap((loginResponse) => {
        if (loginResponse.success && loginResponse.token) {
          localStorage.setItem(this.tokenKey, loginResponse.token);
          this._authStatus.next(true);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this._authStatus.next(false);
  }
}
