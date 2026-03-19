import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';


/**
 * ROLE GUARD: Checks if a user has a specific role (Admin, Owner, etc.)
 * 
 * Usage in routing: 
 *   canActivate: [roleGuard],
 *   data: { role: 'Admin' }
 */
export const roleGuard: CanActivateFn = (route) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const requiredRole = route.data?.['role'] as string;
    const currentRole = authService.currentUserRole();

    if (authService.isAuthenticated() && currentRole === requiredRole) {
        return true; // Match!
    }

    // If wrong role (or not logged in), kick them to the homepage
    return router.parseUrl('/');
};
