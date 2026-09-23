import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class TokenService {

  private accessTokenKey = 'access_token';

  private refreshTokenKey = 'refresh_token';

  setTokens(
    accessToken: string,
    refreshToken: string
  ): void {

    localStorage.setItem(
      this.accessTokenKey,
      accessToken
    );

    localStorage.setItem(
      this.refreshTokenKey,
      refreshToken
    );
  }

  getAccessToken(): string | null {

    return localStorage.getItem(
      this.accessTokenKey
    );

  }

  getRefreshToken(): string | null {

    return localStorage.getItem(
      this.refreshTokenKey
    );

  }

  removeTokens(): void {

    localStorage.removeItem(
      this.accessTokenKey
    );

    localStorage.removeItem(
      this.refreshTokenKey
    );

  }

  isLoggedIn(): boolean {

    if (this.hasValidAccessToken()) {

      return true;

    }

    return !!this.getRefreshToken();

  }

  private hasValidAccessToken(): boolean {

    const token = this.getAccessToken();

    if (!token) {

      return false;

    }

    try {

      const decoded = jwtDecode<{ exp: number }>(token);

      return decoded.exp * 1000 > Date.now();

    } catch {

      return false;

    }

  }

}
