import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ProductService } from '../../../core/services/product.service';
import {
  IProduct,
  IProductFilters
} from '../../../core/models/product.model';

import { ProductCard } from '../../../shared/product-card/product-card';
import { Pagination } from '../../../shared/pagination/pagination';

import {
  ICategory,
  ISubCategory
} from '../../../core/models/category.model';

import { CategoryService } from '../../../core/services/category.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-product-list',
  imports: [
    FormsModule,
    ProductCard,
    Pagination
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductList implements OnInit {

  products: IProduct[] = [];

  categories: ICategory[] = [];
  subcategories: ISubCategory[] = [];

  search = '';

  selectedCategory = '';
  selectedSubcategory = '';

  minPrice: number | null = null;
  maxPrice: number | null = null;

  selectedSort: IProductFilters['sort'] = 'newest';

  inStock = false;

  newArrival = false;
  topSales = false;

  currentPage = 1;
  pageSize = 9;

  totalPages = 0;
  totalProducts = 0;

  isLoading = false;

  constructor(
    private _productService: ProductService,
    private _categoryService: CategoryService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.loadCategories();

    this._route.queryParams.subscribe(params => {

      this.search = params['search'] || '';

      this.selectedCategory = params['category'] || '';

      this.selectedSubcategory = params['subcategory'] || '';

      this.minPrice = params['minPrice']
        ? Number(params['minPrice'])
        : null;

      this.maxPrice = params['maxPrice']
        ? Number(params['maxPrice'])
        : null;

      const sort = params['sort'];

      if (
        sort === 'priceAsc' ||
        sort === 'priceDesc' ||
        sort === 'newest' ||
        sort === 'rating'
      ) {
        this.selectedSort = sort;
      } else {
        this.selectedSort = 'newest';
      }

      this.inStock = params['inStock'] === 'true';

      this.newArrival = params['newArrival'] === 'true';

      this.topSales = params['topSales'] === 'true';

      this.currentPage = params['page']
        ? Number(params['page'])
        : 1;

      this.pageSize = params['size']
        ? Number(params['size'])
        : 9;

      this.updateSubcategories();

      this.loadProducts();
    });
  }

  loadCategories(): void {

    this._categoryService.getNavbarCategories().subscribe({
      next: response => {

        this.categories = response.data.categories;

        this.updateSubcategories();

        this._cdr.detectChanges();
      },

      error: error => {
        console.error('Categories Error:', error);
      }
    });
  }

  updateSubcategories(): void {

    const category = this.categories.find(
      item => item._id === this.selectedCategory
    );

    this.subcategories = category?.subcategories || [];

    if (
      this.selectedSubcategory &&
      !this.subcategories.some(
        item => item._id === this.selectedSubcategory
      )
    ) {
      this.selectedSubcategory = '';
    }
  }

  loadProducts(): void {

    this.isLoading = true;

    const filters: IProductFilters = {
      page: this.currentPage,
      size: this.pageSize,

      search: this.search || undefined,

      category: this.selectedCategory || undefined,

      subcategory: this.selectedSubcategory || undefined,

      minPrice: this.minPrice ?? undefined,

      maxPrice: this.maxPrice ?? undefined,

      sort: this.selectedSort,

      inStock: this.inStock
        ? true
        : undefined,

      newArrival: this.newArrival
        ? true
        : undefined,

      topSales: this.topSales
        ? true
        : undefined
    };

    this._productService
      .getAllProducts(filters)

      .pipe(
        finalize(() => {

          this.isLoading = false;

          this._cdr.detectChanges();

        })
      )

      .subscribe({

        next: response => {

          console.log('Products Response:', response);

          this.products = response.data.result;

          this.totalPages = response.data.pages;

          this.totalProducts = response.data.docsCount;

          this.currentPage = response.data.currentPage;

          this.pageSize = response.data.limit;

          this._cdr.detectChanges();
        },

        error: error => {

          console.error('Products Error:', error);

          this.products = [];

          this.totalPages = 0;

          this.totalProducts = 0;

          this._cdr.detectChanges();
        }

      });
  }

  applyFilters(): void {

    this.currentPage = 1;

    this.updateUrl();
  }

  onCategoryChange(): void {

    this.selectedSubcategory = '';

    this.updateSubcategories();

    this.applyFilters();
  }

  onSubcategoryChange(): void {

    this.applyFilters();
  }

  onSortChange(): void {

    this.applyFilters();
  }

  onStockChange(): void {

    this.applyFilters();
  }

  onSearch(): void {

    this.applyFilters();
  }

  onPriceChange(): void {

    if (
      this.minPrice !== null &&
      this.maxPrice !== null &&
      this.minPrice > this.maxPrice
    ) {

      const swap = this.minPrice;

      this.minPrice = this.maxPrice;

      this.maxPrice = swap;
    }

    this.applyFilters();
  }

  onPageChange(page: number): void {

    this.currentPage = page;

    this.updateUrl();
  }

  clearFilters(): void {

    this.search = '';

    this.selectedCategory = '';

    this.selectedSubcategory = '';

    this.minPrice = null;

    this.maxPrice = null;

    this.selectedSort = 'newest';

    this.inStock = false;

    this.newArrival = false;

    this.topSales = false;

    this.currentPage = 1;

    this.updateUrl();
  }

  updateUrl(): void {

    const queryParams: Record<string, string | number | boolean> = {
      page: this.currentPage,
      size: this.pageSize
    };

    if (this.search) {
      queryParams['search'] = this.search;
    }

    if (this.selectedCategory) {
      queryParams['category'] = this.selectedCategory;
    }

    if (this.selectedSubcategory) {
      queryParams['subcategory'] = this.selectedSubcategory;
    }

    if (this.minPrice !== null) {
      queryParams['minPrice'] = this.minPrice;
    }

    if (this.maxPrice !== null) {
      queryParams['maxPrice'] = this.maxPrice;
    }

    if (this.selectedSort) {
      queryParams['sort'] = this.selectedSort;
    }

    if (this.inStock) {
      queryParams['inStock'] = true;
    }

    if (this.newArrival) {
      queryParams['newArrival'] = true;
    }

    if (this.topSales) {
      queryParams['topSales'] = true;
    }

    this._router.navigate([], {
      relativeTo: this._route,
      queryParams
    });
  }

}
