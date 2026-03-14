import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { jwtDecode } from 'jwt-decode';
import { Observable, tap } from 'rxjs';

// Role strings must match backend exactly
export type Role = 'Admin' | 'Owner' | 'Customer';

interface JwtPayload {
    sub: string;             // UserId
    email: string;           // Email
    role: Role;              // Role
    exp: number;             // Expiry time (seconds since epoch)
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;

    // Signals for reactive state across the app
    isAuthenticated = signal<boolean>(false);
    currentUserRole = signal<Role | null>(null);

    constructor(private http: HttpClient, private router: Router) {
        this.checkTokenOnStart();
    }

    // ═════════════════════════════════════════════
    //  CORE AUTH FLOW
    // ═════════════════════════════════════════════

    login(credentials: any): Observable<{ token: string }> {
        return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                this.setToken(response.token);
            })
        );
    }

    logout() {
        localStorage.removeItem('token');
        this.isAuthenticated.set(false);
        this.currentUserRole.set(null);
        this.router.navigate(['/login']);
    }

    // ═════════════════════════════════════════════
    //  TOKEN MANAGEMENT
    // ═════════════════════════════════════════════

    private setToken(token: string) {
        localStorage.setItem('token', token);
        this.decodeAndSetState(token);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    private checkTokenOnStart() {
        const token = this.getToken();
        if (token) {
            if (this.isTokenValid(token)) {
                this.decodeAndSetState(token);
            } else {
                this.logout(); // Expired token
            }
        }
    }

    private isTokenValid(token: string): boolean {
        try {
            const decoded = jwtDecode<JwtPayload>(token);
            const currentTime = Math.floor(Date.now() / 1000);
            return decoded.exp > currentTime;
        } catch {
            return false; // Invalid token format
        }
    }

    private decodeAndSetState(token: string) {
        try {
            const decoded = jwtDecode<JwtPayload>(token);
            // Backend roles are mapped to standard ClaimTypes.Role, but usually standard jwt claim keys look like:
            // "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            // Let's extract the role by checking all keys if necessary, or just using `role` if we defined it. 
            // JwtSecurityTokenHandler maps it to "role" in some cases, or the long URL. Let's handle both.

            const roleKey = Object.keys(decoded).find(k => k.endsWith('role'));
            const role = roleKey ? (decoded as any)[roleKey] : 'Customer';

            this.isAuthenticated.set(true);
            this.currentUserRole.set(role as Role);
        } catch (e) {
            console.error('Failed to decode JWT', e);
            this.logout();
        }
    }

    // Helper for role checks
    hasRole(role: Role): boolean {
        return this.currentUserRole() === role;
    }
}
