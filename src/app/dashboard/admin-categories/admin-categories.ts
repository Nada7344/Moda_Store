import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { CategoryService } from '../../core/services/category.service';
import { ICategory } from '../../core/models/category.model';

import { AddCategory } from './add-category/add-category';
import { EditCategory } from './edit-category/edit-category';
import { DeleteCategory } from './delete-category/delete-category';
import { AdminSubcategories } from '../admin-subcategories/admin-subcategories';

@Component({
  selector: 'app-admin-categories',
  standalone: true,

  imports: [
    AddCategory,
    EditCategory,
    DeleteCategory,
    AdminSubcategories
  ],

  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.css',
})
export class AdminCategories implements OnInit {

  constructor(
    private _categoryService: CategoryService,
    private _cdr: ChangeDetectorRef
  ) {}

  categories: ICategory[] = [];

  isLoading = true;
  errorMessage = '';

  private _busyIds = new Set<string>();

  isAddModalOpen = false;
  categoryBeingEdited: ICategory | null = null;
  categoryPendingDelete: ICategory | null = null;
  categoryForSubcategories: ICategory | null = null;

  ngOnInit(): void {

    this.loadCategories();

  }

  loadCategories(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this._categoryService.getCategoriesAdmin(true).subscribe({

      next: response => {

        this.categories = response.data.result || [];

        this.isLoading = false;
        this._cdr.detectChanges();

      },

      error: error => {

        console.error('ADMIN CATEGORIES — LOAD ERROR:', error);

        this.errorMessage =
          error?.error?.message ||
          'Unable to load categories right now.';

        this.isLoading = false;
        this._cdr.detectChanges();

      }

    });

  }

  isBusy(id: string): boolean {

    return this._busyIds.has(id);

  }


  openAddModal(): void {

    this.isAddModalOpen = true;

  }

  onCategoryAdded(): void {

    this.isAddModalOpen = false;

    this.loadCategories();

  }


  openEditModal(category: ICategory): void {

    this.categoryBeingEdited = category;

  }

  onCategoryEdited(): void {

    this.categoryBeingEdited = null;

    this.loadCategories();

  }


  openDeleteModal(category: ICategory): void {

    this.categoryPendingDelete = category;

  }

  onCategoryDeleted(): void {

    this.categoryPendingDelete = null;

    this.loadCategories();

  }


  toggleCategoryStatus(category: ICategory): void {

    if (this.isBusy(category._id)) {

      return;

    }

    const nextStatus = !category.isActive;

    this._busyIds.add(category._id);

    this._categoryService.updateCategory(category._id, { isActive: nextStatus }).subscribe({

      next: response => {

        category.isActive = response.data.category.isActive;

        this._busyIds.delete(category._id);
        this._cdr.detectChanges();

      },

      error: error => {

        console.error('ADMIN CATEGORIES — TOGGLE STATUS ERROR:', error);

        this._busyIds.delete(category._id);
        this._cdr.detectChanges();

        alert(error?.error?.message || 'Unable to update this category right now.');

      }

    });

  }


  openSubcategoriesModal(category: ICategory): void {

    this.categoryForSubcategories = category;

  }

  closeSubcategoriesModal(): void {

    this.categoryForSubcategories = null;

  }

  onSubcategoriesChanged(updated: ICategory): void {

    const index = this.categories.findIndex(item => item._id === updated._id);

    if (index !== -1) {

      this.categories[index] = { ...updated };

    }

  }

  subcategoriesLabel(category: ICategory): string {

    const active = (category.subcategories || []).filter(sub => sub.isActive);

    if (!active.length) {

      return '—';

    }

    return active.map(sub => sub.name).join(', ');

  }

}
