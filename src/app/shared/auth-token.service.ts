import { Injectable, signal } from '@angular/core';

const TOKEN_KEY = 'apartel_api_token';

@Injectable({ providedIn: 'root' })
export class AuthTokenService {
  private token = signal<string | null>(this.loadStored());

  private loadStored(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return this.token();
  }

  setToken(value: string | null): void {
    this.token.set(value);
    if (value) localStorage.setItem(TOKEN_KEY, value);
    else localStorage.removeItem(TOKEN_KEY);
  }

  clear(): void {
    this.setToken(null);
  }
}
