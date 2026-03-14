import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { ShopComponent } from './pages/shop/shop.component';
import { WholesaleComponent } from './pages/wholesale/wholesale.component';
import { AdminComponent } from './pages/admin/admin.component';
import { OwnerProductsComponent } from './pages/owner/owner-products.component';
import { OwnerWholesaleComponent } from './pages/owner/owner-wholesale.component';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },

    { path: 'shops/:id', component: ShopComponent },

    // Admin Routes
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [authGuard, roleGuard],
        data: { role: 'Admin' }
    },

    // Owner Routes
    {
        path: 'owner/products',
        component: OwnerProductsComponent,
        canActivate: [authGuard, roleGuard],
        data: { role: 'Owner' }
    },
    {
        path: 'owner/wholesale',
        component: OwnerWholesaleComponent,
        canActivate: [authGuard, roleGuard],
        data: { role: 'Owner' }
    },
    {
        path: 'wholesale',
        component: WholesaleComponent,
        canActivate: [authGuard, roleGuard],
        data: { role: 'Owner' }
    },

    { path: '**', redirectTo: '' }
];
