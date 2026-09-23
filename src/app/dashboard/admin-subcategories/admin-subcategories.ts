import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { AddSubcategory } from './add-subcategory/add-subcategory';
import { EditSubcategory } from './edit-subcategory/edit-subcategory';
import { DeleteSubcategory } from './delete-subcategory/delete-subcategory';
import { ICategory, ISubCategory } from '../../core/models/category.model';
import { CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-admin-subcategories',
  standalone: true,

  imports: [
    AddSubcategory,
    EditSubcategory,
    DeleteSubcategory
  ],
  templateUrl: './admin-subcategories.html',
  styleUrl: './admin-subcategories.css',
})
export class AdminSubcategories {

  constructor(
    private _categoryService: CategoryService,
    private _cdr: ChangeDetectorRef
  ) {}

  @Input() category!: ICategory;

  @Output() changed = new EventEmitter<ICategory>();

  @Output() closed = new EventEmitter<void>();

  private _busyIds = new Set<string>();

  isAddModalOpen = false;
  subcategoryBeingEdited: ISubCategory | null = null;
  subcategoryPendingDelete: ISubCategory | null = null;

  isBusy(id: string): boolean {

    return this._busyIds.has(id);

  }

  close(): void {

    this.closed.emit();

  }


  openAddModal(): void {

    this.isAddModalOpen = true;

  }

  onSubcategoryAdded(subCategory: ISubCategory): void {

    this.category.subcategories = this.category.subcategories || [];
    this.category.subcategories.push(subCategory);

    this.isAddModalOpen = false;

    this.changed.emit(this.category);

  }


  openEditModal(subCategory: ISubCategory): void {

    this.subcategoryBeingEdited = subCategory;

  }

  onSubcategoryEdited(updated: ISubCategory): void {

    if (this.subcategoryBeingEdited) {

      this.subcategoryBeingEdited.name = updated.name;
      this.subcategoryBeingEdited.slug = updated.slug;

    }

    this.subcategoryBeingEdited = null;

    this.changed.emit(this.category);

  }


  openDeleteModal(subCategory: ISubCategory): void {

    this.subcategoryPendingDelete = subCategory;

  }

  onSubcategoryDeleted(): void {

    if (this.subcategoryPendingDelete) {

      const id = this.subcategoryPendingDelete._id;

      this.category.subcategories = this.category.subcategories.filter(
        sub => sub._id !== id
      );

    }

    this.subcategoryPendingDelete = null;

    this.changed.emit(this.category);

  }


  toggleSubcategoryStatus(subCategory: ISubCategory): void {

    if (this.isBusy(subCategory._id)) {

      return;

    }

    const nextStatus = !subCategory.isActive;

    this._busyIds.add(subCategory._id);

    this._categoryService.updateSubCategory(subCategory._id, { isActive: nextStatus }).subscribe({

      next: response => {

        subCategory.isActive = response.data.subCategory.isActive;

        this._busyIds.delete(subCategory._id);

        this.changed.emit(this.category);
        this._cdr.detectChanges();

      },

      error: error => {

        console.error('MANAGE SUBCATEGORIES — TOGGLE STATUS ERROR:', error);

        this._busyIds.delete(subCategory._id);
        this._cdr.detectChanges();

        alert(error?.error?.message || 'Unable to update this subcategory right now.');

      }

    });

  }

}
