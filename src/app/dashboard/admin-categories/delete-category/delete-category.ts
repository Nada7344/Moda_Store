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

  cancel(): void {

    if (this.isDeleting) {

      return;

    }

    this.closed.emit();

  }

  confirm(): void {

    if (this.isDeleting) {

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

        this.errorMessage =
          error?.error?.message ||
          'Unable to delete this category right now.';

        this.isDeleting = false;
        this._cdr.detectChanges();

      }

    });

  }

}
