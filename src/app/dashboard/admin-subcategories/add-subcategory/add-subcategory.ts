import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { ISubCategory } from '../../../core/models/category.model';



@Component({
  selector: 'app-add-subcategory',
  standalone: true,

  imports: [FormsModule],

  templateUrl: './add-subcategory.html',
  styleUrl: './add-subcategory.css',
})
export class AddSubcategory {

  constructor(
    private _categoryService: CategoryService,
    private _cdr: ChangeDetectorRef
  ) {}

  @Input() categoryId!: string;

  @Output() added = new EventEmitter<ISubCategory>();

  @Output() closed = new EventEmitter<void>();

  name = '';
  isSaving = false;
  errorMessage = '';

  close(): void {

    if (this.isSaving) {

      return;

    }

    this.closed.emit();

  }

  save(): void {

    const name = this.name.trim();

    if (!name || this.isSaving) {

      return;

    }

    this.isSaving = true;
    this.errorMessage = '';

    this._categoryService.createSubCategory(this.categoryId, { name }).subscribe({

      next: response => {

        this.isSaving = false;

        this.added.emit(response.data.subCategory);

      },

      error: error => {

        console.error('ADD SUBCATEGORY — SAVE ERROR:', error);

        this.errorMessage =
          error?.error?.message ||
          'Unable to add this subcategory right now.';

        this.isSaving = false;
        this._cdr.detectChanges();

      }

    });

  }

}
