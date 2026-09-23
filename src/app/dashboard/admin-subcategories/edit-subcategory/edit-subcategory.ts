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
import { ISubCategory } from '../../../core/models/category.model';

@Component({
  selector: 'app-edit-subcategory',
  standalone: true,

  imports: [FormsModule],

  templateUrl: './edit-subcategory.html',
  styleUrl: './edit-subcategory.css',
})
export class EditSubcategory implements OnInit {

  constructor(
    private _categoryService: CategoryService,
    private _cdr: ChangeDetectorRef
  ) {}

  @Input() subcategory!: ISubCategory;

  @Output() edited = new EventEmitter<ISubCategory>();

  @Output() closed = new EventEmitter<void>();

  name = '';
  isSaving = false;
  errorMessage = '';

  ngOnInit(): void {

    this.name = this.subcategory.name;

  }

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

    this._categoryService.updateSubCategory(this.subcategory._id, { name }).subscribe({

      next: response => {

        this.isSaving = false;

        this.edited.emit(response.data.subCategory);

      },

      error: error => {

        console.error('EDIT SUBCATEGORY — SAVE ERROR:', error);

        this.errorMessage =
          error?.error?.message ||
          'Unable to rename this subcategory right now.';

        this.isSaving = false;
        this._cdr.detectChanges();

      }

    });

  }

}
