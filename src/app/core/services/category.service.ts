import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IAdminCategoriesRes, ICategoriesRes, ICategory, ISubCategory } from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {

  private apiURL = environment.apiURL + '/category';

  constructor(private _http: HttpClient) {}

  getNavbarCategories() {
    return this._http.get<ICategoriesRes>(
      this.apiURL + '/navbar'
    );
  }

  getCategoriesAdmin(includeInactive = true) {
    return this._http.get<IAdminCategoriesRes>(
      this.apiURL + '/admin',
      { params: { page: 'all', includeInactive } }
    );
  }

  getCategoryByIdAdmin(categoryId: string) {
    return this._http.get<{ status: number; message: string; data: { category: ICategory } }>(
      this.apiURL + `/admin/${categoryId}`
    );
  }

  createCategory(body: { name: string; isActive?: boolean }) {
    return this._http.post<{ status: number; message: string; data: { category: ICategory } }>(
      this.apiURL + '/admin',
      body
    );
  }

  updateCategory(categoryId: string, body: { name?: string; isActive?: boolean }) {
    return this._http.patch<{ status: number; message: string; data: { category: ICategory } }>(
      this.apiURL + `/admin/${categoryId}`,
      body
    );
  }

  deleteCategory(categoryId: string) {
    return this._http.delete<{ status: number; message: string; data: { category: ICategory } }>(
      this.apiURL + `/admin/${categoryId}`
    );
  }

  createSubCategory(categoryId: string, body: { name: string; isActive?: boolean }) {
    return this._http.post<{ status: number; message: string; data: { subCategory: ISubCategory } }>(
      this.apiURL + `/admin/${categoryId}/subcategory`,
      body
    );
  }

  updateSubCategory(subCategoryId: string, body: { name?: string; isActive?: boolean }) {
    return this._http.patch<{ status: number; message: string; data: { subCategory: ISubCategory } }>(
      this.apiURL + `/admin/subcategory/${subCategoryId}`,
      body
    );
  }

  deleteSubCategory(subCategoryId: string) {
    return this._http.delete<{ status: number; message: string; data: { subCategory: ISubCategory } }>(
      this.apiURL + `/admin/subcategory/${subCategoryId}`
    );
  }
}
