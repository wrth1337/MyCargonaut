import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor{

  constructor(
    private auth: AuthService
    ) { }
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
      //KA ob wir die beiden json intercepter brauchen 
      if(!req.headers.has('Content-Type')){
        req = req.clone({headers: req.headers.set('Content-Type', 'application/json')});
      }
      req = req.clone({headers: req.headers.set('Accept', 'application/json')});
      
      const authToken = this.auth.getToken();
      if(authToken){
        req = req.clone({headers: req.headers.set('Authorization', authToken)});
      }
      return next.handle(req).pipe(catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.auth.clearStorage();
          window.location.reload();
        }
        return throwError(() => error);
      }));
  }
}
