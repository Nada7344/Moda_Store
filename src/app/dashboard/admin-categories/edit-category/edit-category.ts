import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { CategoryService } from '../../../core/services/category.service';
import { ICategory } from '../../../core/models/category.model';

@Component({
  selector: 'app-edit-category',
  standalone: true,

  imports: [FormsModule],

  templateUrl: './edit-category.html',
  styleUrl: './edit-category.css',
})
export class EditCategory implements OnInit {

  constructor(
    private _categoryService: CategoryService,
    private _cdr: ChangeDetectorRef
  ) {}

  @Input() category!: ICategory;

  @Output() saved = new EventEmitter<void>();

  @Output() closed = new EventEmitter<void>();

  form = { name: '', isActive: true };

  isSaving = false;
  errorMessage = '';

  ngOnInit(): void {

    this.form = { name: this.category.name, isActive: this.category.isActive };

  }

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

    this._categoryService.updateCategory(this.category._id, {
      name,
      isActive: this.form.isActive,
    }).subscribe({

      next: () => {

        this.isSaving = false;

        this.saved.emit();

      },

      error: error => {

        console.error('EDIT CATEGORY — SAVE ERROR:', error);

        this.errorMessage =
          error?.error?.message ||
          'Unable to save this category right now.';

        this.isSaving = false;
        this._cdr.detectChanges();

      }

    });

  }

}
