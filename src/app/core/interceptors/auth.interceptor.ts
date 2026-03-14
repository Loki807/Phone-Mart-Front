import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * AUTH INTERCEPTOR (Functional style for Angular 15+)
 * 
 * Intercepts every outgoing HTTP request.
 * If the user is logged in, it attaches the JWT token
 * to the `Authorization: Bearer <token>` header.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();

    // If we have a token, clone the request and add the header
    if (token) {


        const authReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
        return next(authReq);
        
    }

    // Otherwise, send the original r
    // equest without touching it
    return next(req);
};
