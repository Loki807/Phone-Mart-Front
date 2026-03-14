import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * AUTH GUARD: Ensures the user is logged in.
 * Use for protecting general authenticated routes.
 */
export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return true; // Token exists and is valid

    }
    

    // Not logged in -> Redirect to login page
    return router.parseUrl('/login');
};
