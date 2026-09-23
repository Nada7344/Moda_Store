import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { CategoryService } from '../../../core/services/category.service';

@Component({
  selector: 'app-add-category',
  standalone: true,

  imports: [FormsModule],

  templateUrl: './add-category.html',
  styleUrl: './add-category.css',
})
export class AddCategory {

  constructor(
    private _categoryService: CategoryService,
    private _cdr: ChangeDetectorRef
  ) {}

  @Output() saved = new EventEmitter<void>();

  @Output() closed = new EventEmitter<void>();

  form = { name: '', isActive: true };

  isSaving = false;
  errorMessage = '';

  close(): void {

    if (this.isSaving) {

      return;

    }

    this.closed.emit();

  }

  save(): void {

    const name = this.form.name.trim();

    if (!name || this.isSaving) {

      return;

    }

    this.isSaving = true;
    this.errorMessage = '';

    this._categoryService.createCategory({ name, isActive: this.form.isActive }).subscribe({

      next: () => {

        this.isSaving = false;

        this.saved.emit();

      },

      error: error => {

        console.error('ADD CATEGORY — SAVE ERROR:', error);

        this.errorMessage =
          error?.error?.message ||
          'Unable to create this category right now.';

        this.isSaving = false;
        this._cdr.detectChanges();

      }

    });

  }

}
