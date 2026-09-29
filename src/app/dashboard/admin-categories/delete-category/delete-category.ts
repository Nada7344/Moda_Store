import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { CategoryService } from '../../../core/services/category.service';
import { ICategory } from '../../../core/models/category.model';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-delete-category',
  standalone: true,

  imports: [ConfirmDialog],

  templateUrl: './delete-category.html',
  styleUrl: './delete-category.css',
})
export class DeleteCategory {

  constructor(
    private _categoryService: CategoryService,
    private _cdr: ChangeDetectorRef
  ) {}

  @Input() category!: ICategory;

  @Output() deleted = new EventEmitter<void>();

  @Output() closed = new EventEmitter<void>();

  isDeleting = false;
  errorMessage = '';

  get activeSubcategories() {

    return (this.category?.subcategories || []).filter(sub => sub.isActive);

  }

  // The backend refuses to delete a category that still has active subcategories,
  // so we tell the admin up-front instead of letting them hit a confusing error.
  get isBlocked(): boolean {

    return this.activeSubcategories.length > 0;

  }

  get message(): string {

    const name = this.category.name;

    if (this.isBlocked) {

      const list = this.activeSubcategories.map(sub => sub.name).join(', ');

      return `“${name}” still has active subcategories (${list}). ` +
        'Delete or deactivate them first (use the "Subcategories" button on the row), then try again.';

    }

    return `This will deactivate “${name}”. ` +
      'It cannot be deleted while it still has active products.';

  }

  cancel(): void {

    if (this.isDeleting) {

      return;

    }

    this.closed.emit();

  }

  confirm(): void {

    if (this.isDeleting || this.isBlocked) {

      return;

    }

    this.isDeleting = true;
    this.errorMessage = '';

    this._categoryService.deleteCategory(this.category._id).subscribe({

      next: () => {

        this.isDeleting = false;

        this.deleted.emit();

      },

      error: error => {

        console.error('DELETE CATEGORY — DELETE ERROR:', error);

        this.isDeleting = false;

        // 404 = the category is already gone/deactivated on the server.
        // Our list is stale, so close the dialog and refresh it.
        if (error?.status === 404) {

          this.deleted.emit();

          return;

        }

        this.errorMessage =
          error?.error?.message ||
          'Unable to delete this category right now.';

        this._cdr.detectChanges();

      }

    });

  }

}
