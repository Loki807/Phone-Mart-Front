import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
})


export class ApiService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    // ═════════════════════════════════════════════
    //  PUBLIC ENDPOINTS (No Login)
    // ═════════════════════════════════════════════

    getCategories(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/public/categories`);
    }

    getBrands(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/public/brands`);
    }

    searchProducts(query?: string, category?: number, city?: string): Observable<any[]> {
        let params = new HttpParams();
        if (query) params = params.set('q', query);
        if (category) params = params.set('category', category.toString());
        if (city) params = params.set('city', city);

        return this.http.get<any[]>(`${this.apiUrl}/public/search`, { params });
    }

    getShopPublic(shopId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/public/shops/${shopId}`);
    }

    getShopProductsPublic(shopId: string, categoryId?: number): Observable<any[]> {
        let params = new HttpParams();
        if (categoryId) params = params.set('category', categoryId.toString());

        return this.http.get<any[]>(`${this.apiUrl}/public/shops/${shopId}/products`, { params });
    }

    getShopRatingsPublic(shopId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/public/shops/${shopId}/ratings`);
    }

    // ═════════════════════════════════════════════
    //  SHOP OWNER ENDPOINTS (Token required)
    // ═════════════════════════════════════════════

    getMyShop(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/shop/my-shop`);
    }

    // ─── Products ───

    getMyProducts(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/shop/products`);
    }

    createProduct(product: any): Observable<{ productId: string }> {
        return this.http.post<{ productId: string }>(`${this.apiUrl}/shop/products`, product);
    }

    // Owner Product View
    getProductById(productId: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/shop/products/${productId}`);
    }

    updateProduct(product: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/shop/products`, product);
    }

    deleteProduct(productId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/shop/products/${productId}`);
    }

    // ─── Images ───

    uploadImage(file: File, folder: 'products' | 'wholesale' | 'shops' = 'products'): Observable<{ imageUrl: string }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/images/upload?folder=${folder}`, formData);
    }

    deleteImage(url: string): Observable<any> {
        let params = new HttpParams().set('url', url);
        return this.http.delete(`${this.apiUrl}/images`, { params });
    }

    // ─── Wholesale ───

    getMyWholesaleListings(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/shop/wholesale`);
    }

    createWholesaleListing(listing: any): Observable<{ listingId: string }> {
        return this.http.post<{ listingId: string }>(`${this.apiUrl}/shop/wholesale`, listing);
    }

    updateWholesaleListing(listing: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/shop/wholesale`, listing);
    }

    deleteWholesaleListing(listingId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/shop/wholesale/${listingId}`);
    }

    // ─── Ratings ───

    rateShop(rating: { shopId: string, stars: number, comment?: string }): Observable<{ ratingId: string }> {
        return this.http.post<{ ratingId: string }>(`${this.apiUrl}/shop/ratings`, rating);
    }

    // ═════════════════════════════════════════════
    //  WHOLESALE MARKETPLACE (Token required)
    // ═════════════════════════════════════════════

    getAllWholesale(itemType?: string, city?: string): Observable<any[]> {
        let params = new HttpParams();
        if (itemType) params = params.set('itemType', itemType);
        if (city) params = params.set('city', city);

        return this.http.get<any[]>(`${this.apiUrl}/wholesale`, { params });
    }

    getWholesaleListing(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/wholesale/${id}`);
    }

    // ═════════════════════════════════════════════
    //  ADMIN ENDPOINTS (Token + Admin string)
    // ═════════════════════════════════════════════

    getShops(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/admin/shops`);
    }

    getShopByIdAdmin(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/admin/shops/${id}`);
    }

    createShopOwner(shopDto: any): Observable<{ shopId: string, ownerUserId: string }> {
        return this.http.post<{ shopId: string, ownerUserId: string }>(`${this.apiUrl}/admin/shop-owners`, shopDto);
    }

    updateShopAdmin(shopDto: any): Observable<{ shopId: string }> {
        return this.http.put<{ shopId: string }>(`${this.apiUrl}/admin/shops`, shopDto);
    }

    deleteShopAdmin(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/admin/shops/${id}`);
    }
}
