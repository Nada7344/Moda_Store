import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { CategoryService } from '../../../core/services/category.service';
import { ISubCategory } from '../../../core/models/category.model';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-delete-subcategory',
  standalone: true,

  imports: [ConfirmDialog],

  templateUrl: './delete-subcategory.html',
  styleUrl: './delete-subcategory.css',
})
export class DeleteSubcategory {

  constructor(
    private _categoryService: CategoryService,
    private _cdr: ChangeDetectorRef
  ) {}

  @Input() subcategory!: ISubCategory;

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

    this._categoryService.deleteSubCategory(this.subcategory._id).subscribe({

      next: () => {

        this.isDeleting = false;

        this.deleted.emit();

      },

      error: error => {

        console.error('DELETE SUBCATEGORY — DELETE ERROR:', error);

        this.errorMessage =
          error?.error?.message ||
          'Unable to delete this subcategory right now.';

        this.isDeleting = false;
        this._cdr.detectChanges();

      }

    });

  }

}
