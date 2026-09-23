import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';

import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';

import { IProduct, IProductImage } from '../../core/models/product.model';
import { ICategory, ISubCategory } from '../../core/models/category.model';

interface IImageSlot {
  previewUrl: string;
  file: File | null;
  existingImage: IProductImage | null;
}

@Component({
  selector: 'app-admin-product-form',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './admin-product-form.html',
  styleUrl: './admin-product-form.css',
})
export class AdminProductForm implements OnInit {

  constructor(
    private _productService: ProductService,
    private _categoryService: CategoryService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _cdr: ChangeDetectorRef
  ) {}

  productId: string | null = null;
  get isEditMode(): boolean {
    return !!this.productId;
  }

  categories: ICategory[] = [];

  isLoading = false;
  isSaving = false;
  isDeleting = false;

  errorMessage = '';
  successMessage = '';

  showDeleteModal = false;

  form = {
    name: '',
    description: '',
    category: '',
    subcategory: '',
    price: null as number | null,
    shippingPrice: 0 as number | null,
    stock: 0 as number | null,
    isActive: true,
    topSales: false,
    newArrival: false,
  };

  images: IImageSlot[] = [];

  ngOnInit(): void {

    this.loadCategories();

    this._route.queryParamMap.subscribe(params => {

      this.productId = params.get('productId');

      this.errorMessage = '';
      this.successMessage = '';

      if (this.isEditMode) {

        this.loadProduct();

      } else {

        this._resetForm();

      }

    });

  }

  private _resetForm(): void {

    this.form = {
      name: '',
      description: '',
      category: '',
      subcategory: '',
      price: null,
      shippingPrice: 0,
      stock: 0,
      isActive: true,
      topSales: false,
      newArrival: false,
    };

    this.images = [];

  }

  loadCategories(): void {

    this._categoryService.getCategoriesAdmin().subscribe({

      next: response => {

        this.categories = response.data.result || [];

        this._cdr.detectChanges();

      },

      error: error => {

        console.error('ADMIN PRODUCT FORM — LOAD CATEGORIES ERROR:', error);

      }

    });

  }

  loadProduct(): void {

    if (!this.productId) {

      return;

    }

    this.isLoading = true;

    this._productService.getProductByIdAdmin(this.productId).subscribe({

      next: response => {

        const product = response.data.product;

        this._fillForm(product);

        this.isLoading = false;

        this._cdr.detectChanges();

      },

      error: error => {

        console.error('ADMIN PRODUCT FORM — LOAD PRODUCT ERROR:', error);

        this.errorMessage =
          error?.error?.message ||
          'Unable to load this product.';

        this.isLoading = false;

        this._cdr.detectChanges();

      }

    });

  }

  private _fillForm(product: IProduct): void {

    this.form = {
      name: product.name,
      description: product.description,
      category: product.category?._id || '',
      subcategory: product.subcategory?._id || '',
      price: product.price,
      shippingPrice: product.shippingPrice,
      stock: product.stock,
      isActive: product.isActive,
      topSales: !!product.flags?.topSales,
      newArrival: !!product.flags?.newArrival,
    };

    this.images = (product.images || []).map(image => ({
      previewUrl: image.secure_url,
      file: null,
      existingImage: image,
    }));

  }

  get subcategoriesForSelectedCategory(): ISubCategory[] {

    const category = this.categories.find(c => c._id === this.form.category);

    return category?.subcategories || [];

  }

  onCategoryChange(categoryId: string): void {

    this.form.category = categoryId;

    this.form.subcategory = '';

  }

  onFilesSelected(fileList: FileList | null): void {

    if (!fileList || !fileList.length) {

      return;

    }

    const remainingSlots = 2 - this.images.length;

    if (remainingSlots <= 0) {

      this.errorMessage = 'You can only attach up to 2 images. Remove one first.';
      this._cdr.detectChanges();

      return;

    }

    Array.from(fileList)
      .slice(0, remainingSlots)
      .forEach(file => {

        this.images.push({
          previewUrl: URL.createObjectURL(file),
          file,
          existingImage: null,
        });

      });

    this._cdr.detectChanges();

  }

  removeImage(index: number): void {

    const [removed] = this.images.splice(index, 1);

    if (removed?.file) {

      URL.revokeObjectURL(removed.previewUrl);

    }

    this._cdr.detectChanges();

  }

  private _validate(): string | null {

    if (!this.form.name.trim() || this.form.name.trim().length < 2) {

      return 'Product name must be at least 2 characters.';

    }

    if (!this.form.description.trim() || this.form.description.trim().length < 5) {

      return 'Description must be at least 5 characters.';

    }

    if (!this.form.category) {

      return 'Please choose a category.';

    }

    if (!this.form.subcategory) {

      return 'Please choose a subcategory.';

    }

    if (this.form.price === null || this.form.price < 0) {

      return 'Please enter a valid price.';

    }

    if (!this.isEditMode && this.images.length === 0) {

      return 'Please attach at least one product image.';

    }

    return null;

  }

  save(): void {

    this.errorMessage = '';
    this.successMessage = '';

    const validationError = this._validate();

    if (validationError) {

      this.errorMessage = validationError;
      this._cdr.detectChanges();

      return;

    }

    const formData = new FormData();

    formData.append('name', this.form.name.trim());
    formData.append('description', this.form.description.trim());
    formData.append('category', this.form.category);
    formData.append('subcategory', this.form.subcategory);
    formData.append('price', String(this.form.price));
    formData.append('shippingPrice', String(this.form.shippingPrice ?? 0));
    formData.append('isActive', String(this.form.isActive));

    if (!this.isEditMode) {

      formData.append('stock', String(this.form.stock ?? 0));

    }

    const newFiles = this.images
      .map(slot => slot.file)
      .filter((file): file is File => !!file);

    newFiles.forEach(file => formData.append('images', file));

    this.isSaving = true;

    const request$ = this.isEditMode
      ? this._productService.updateProduct(this.productId as string, formData)
      : this._productService.createProduct(formData);

    request$.subscribe({

      next: response => {

        this.isSaving = false;

        const savedProduct = response.data.product;

        this._syncSecondaryFields(savedProduct);

      },

      error: error => {

        console.error('ADMIN PRODUCT FORM — SAVE ERROR:', error);

        this.errorMessage =
          error?.error?.message ||
          'Unable to save this product.';

        this.isSaving = false;

        this._cdr.detectChanges();

      }

    });

  }

  private _syncSecondaryFields(product: IProduct): void {

    const productId = this.productId || product._id;

    if (!productId) {

      this._finishSave();
      return;

    }

    const requests: Observable<unknown>[] = [];

    const stockChanged = this.isEditMode && product.stock !== this.form.stock;
    const flagsChanged =
      !!product.flags?.topSales !== this.form.topSales ||
      !!product.flags?.newArrival !== this.form.newArrival;

    if (stockChanged && this.form.stock !== null) {

      requests.push(
        this._productService.updateStock(productId, this.form.stock)
      );

    }

    if (flagsChanged) {

      requests.push(
        this._productService.updateFlags(productId, {
          topSales: this.form.topSales,
          newArrival: this.form.newArrival,
        })
      );

    }

    if (!requests.length) {

      this._finishSave();
      return;

    }

    forkJoin(requests).subscribe({

      next: () => this._finishSave(),

      error: error => {

        console.error('ADMIN PRODUCT FORM — SYNC STOCK/FLAGS ERROR:', error);

        this.errorMessage =
          'Product saved, but updating stock/flags failed. You can retry from the products list.';

        this._cdr.detectChanges();

      }

    });

  }

  private _finishSave(): void {

    this.successMessage = this.isEditMode
      ? 'Product updated successfully.'
      : 'Product created successfully.';

    this._cdr.detectChanges();

    this._router.navigate(['/admin/products']);

  }

  openDeleteModal(): void {

    this.showDeleteModal = true;

  }

  closeDeleteModal(): void {

    this.showDeleteModal = false;

  }

  deleteProduct(): void {

    if (!this.productId || this.isDeleting) {

      return;

    }

    this.isDeleting = true;

    this._productService.deleteProduct(this.productId).subscribe({

      next: () => {

        this.isDeleting = false;
        this.showDeleteModal = false;

        this._router.navigate(['/admin/products']);

      },

      error: error => {

        console.error('ADMIN PRODUCT FORM — DELETE ERROR:', error);

        this.errorMessage =
          error?.error?.message ||
          'Unable to delete this product.';

        this.isDeleting = false;
        this.showDeleteModal = false;

        this._cdr.detectChanges();

      }

    });

  }

}
