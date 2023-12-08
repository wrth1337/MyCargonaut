import { CanActivateFn } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const authguardGuard: CanActivateFn = (route, state) => {
  return inject(AuthService).getToken() 
  ? true
  : inject(Router).navigate(['/login']);
};
