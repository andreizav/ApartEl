import { inject } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthTokenService } from './auth-token.service';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const tokenService = inject(AuthTokenService);
  const router = inject(Router);
  const token = tokenService.getToken();
  let out = req;
  if (token) {
    out = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(out).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        tokenService.clear();
        router.navigate(['/']);
      }
      return throwError(() => err);
    })
  );
}
