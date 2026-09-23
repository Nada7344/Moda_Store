import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';

import { IProduct } from '../../core/models/product.model';
import { ICategory } from '../../core/models/category.model';

@Component({
  selector: 'app-admin-products',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './admin-products.html',
  styleUrl: './admin-products.css',
})
export class AdminProducts implements OnInit, OnDestroy {

  constructor(
    private _productService: ProductService,
    private _categoryService: CategoryService,
    private _cdr: ChangeDetectorRef
  ) {}

  products: IProduct[] = [];
  categories: ICategory[] = [];

  isLoading = true;
  errorMessage = '';

  searchTerm = '';
  categoryFilter = '';
  statusFilter: '' | 'active' | 'inactive' = '';

  private _searchDebounce: ReturnType<typeof setTimeout> | null = null;

  page = 1;
  size = 10;
  pages = 1;
  docsCount = 0;

  selectedIds = new Set<string>();

  private _togglingIds = new Set<string>();

  productPendingDelete: IProduct | null = null;
  isDeleting = false;

  ngOnInit(): void {

    this.loadCategories();
    this.loadProducts();

  }

  ngOnDestroy(): void {

    if (this._searchDebounce) {

      clearTimeout(this._searchDebounce);

    }

  }

  loadCategories(): void {

    this._categoryService.getCategoriesAdmin().subscribe({

      next: response => {

        this.categories = response.data.result || [];

        this._cdr.detectChanges();

      },

      error: error => {

        console.error('ADMIN PRODUCTS — LOAD CATEGORIES ERROR:', error);

      }

    });

  }

  loadProducts(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this._productService
      .getAllProductsAdmin({
        page: this.page,
        size: this.size,
        search: this.searchTerm || undefined,
        category: this.categoryFilter || undefined,
        isActive:
          this.statusFilter === 'active' ? true :
          this.statusFilter === 'inactive' ? false :
          undefined,
      })
      .subscribe({

        next: response => {

          this.products = response.data.result || [];
          this.pages = response.data.pages || 1;
          this.docsCount = response.data.docsCount || 0;
          this.page = response.data.currentPage || this.page;

          this.selectedIds.clear();

          this.isLoading = false;

          this._cdr.detectChanges();

        },

        error: error => {

          console.error('ADMIN PRODUCTS — LOAD ERROR:', error);

          this.errorMessage =
            error?.error?.message ||
            'Unable to load products right now.';

          this.isLoading = false;

          this._cdr.detectChanges();

        }

      });

  }

  onSearchChange(value: string): void {

    this.searchTerm = value;

    if (this._searchDebounce) {

      clearTimeout(this._searchDebounce);

    }

    this._searchDebounce = setTimeout(() => {

      this.page = 1;
      this.loadProducts();

    }, 350);

  }

  onCategoryFilterChange(value: string): void {

    this.categoryFilter = value;
    this.page = 1;

    this.loadProducts();

  }

  onStatusFilterChange(value: '' | 'active' | 'inactive'): void {

    this.statusFilter = value;
    this.page = 1;

    this.loadProducts();

  }

  goToPage(page: number): void {

    if (page < 1 || page > this.pages || page === this.page) {

      return;

    }

    this.page = page;

    this.loadProducts();

  }

  get pageNumbers(): number[] {

    return Array.from({ length: this.pages }, (_, index) => index + 1);

  }

  get rangeStart(): number {

    return this.docsCount === 0 ? 0 : (this.page - 1) * this.size + 1;

  }

  get rangeEnd(): number {

    return Math.min(this.page * this.size, this.docsCount);

  }

  toggleSelectAll(checked: boolean): void {

    if (checked) {

      this.products.forEach(product => this.selectedIds.add(product._id));

    } else {

      this.selectedIds.clear();

    }

  }

  toggleSelect(productId: string, checked: boolean): void {

    if (checked) {

      this.selectedIds.add(productId);

    } else {

      this.selectedIds.delete(productId);

    }

  }

  isSelected(productId: string): boolean {

    return this.selectedIds.has(productId);

  }

  get allSelected(): boolean {

    return this.products.length > 0 &&
      this.products.every(product => this.selectedIds.has(product._id));

  }

  isToggling(productId: string): boolean {

    return this._togglingIds.has(productId);

  }

  toggleStatus(product: IProduct): void {

    if (this.isToggling(product._id)) {

      return;

    }

    const nextStatus = !product.isActive;

    this._togglingIds.add(product._id);

    this._productService.updateStatus(product._id, nextStatus).subscribe({

      next: response => {

        product.isActive = response.data.product.isActive;

        this._togglingIds.delete(product._id);

        this._cdr.detectChanges();

      },

      error: error => {

        console.error('ADMIN PRODUCTS — TOGGLE STATUS ERROR:', error);

        this._togglingIds.delete(product._id);

        this._cdr.detectChanges();

      }

    });

  }

  confirmDelete(product: IProduct): void {

    this.productPendingDelete = product;

  }

  cancelDelete(): void {

    this.productPendingDelete = null;

  }

  deleteProduct(): void {

    if (!this.productPendingDelete || this.isDeleting) {

      return;

    }

    const productId = this.productPendingDelete._id;

    this.isDeleting = true;

    this._productService.deleteProduct(productId).subscribe({

      next: () => {

        this.isDeleting = false;
        this.productPendingDelete = null;

        if (this.products.length === 1 && this.page > 1) {

          this.page -= 1;

        }

        this.loadProducts();

      },

      error: error => {

        console.error('ADMIN PRODUCTS — DELETE ERROR:', error);

        this.isDeleting = false;

        this._cdr.detectChanges();

      }

    });

  }

  productFlagsLabel(product: IProduct): string {

    const flags: string[] = [];

    if (product.flags?.topSales) flags.push('Top sales');
    if (product.flags?.newArrival) flags.push('New arrival');

    return flags.length ? flags.join(', ') : '—';

  }

  stockLabel(product: IProduct): string {

    return product.isOutOfStock
      ? 'Out of stock'
      : `${product.stock} in stock`;

  }

}
