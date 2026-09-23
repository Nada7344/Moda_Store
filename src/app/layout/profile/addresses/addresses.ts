import {

  CommonModule,
} from '@angular/common';

import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { UserService } from '../../../core/services/user.service';
import { IAddress } from '../../../core/models/user.model';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './addresses.html',
  styleUrl: './addresses.css',
})
export class Addresses implements OnInit {

  addresses: IAddress[] = [];

  isLoading = false;
  isSubmitting = false;

  errorMessage = '';
  successMessage = '';

  isModalOpen = false;
  isDeleteModalOpen = false;

  isEditMode = false;

  selectedAddressId: string | null = null;

  form = {
    label: 'Home',
    street: '',
    city: '',
    state: '',
    country: 'Egypt',
    postalCode: '',
    building: '',
    apartment: '',
    phone: '',
    isDefault: false,
  };

  constructor(
    private _userService: UserService,
    private _cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAddresses();
  }

  loadAddresses(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this._userService.getProfile().subscribe({

      next: (response) => {

        this.addresses =
          response.data.user.address ?? [];

        this.isLoading = false;

        this._cdr.detectChanges();
      },

      error: (error) => {

        console.error(error);

        this.errorMessage =
          error?.error?.message ||
          'Failed to load addresses';

        this.isLoading = false;

        this._cdr.detectChanges();
      },

    });
  }

  openAddModal(): void {

    this.isEditMode = false;

    this.selectedAddressId = null;

    this.resetForm();

    this.isModalOpen = true;

    this.clearMessages();

    this._cdr.detectChanges();
  }

  openEditModal(address: IAddress): void {

    this.isEditMode = true;

    this.selectedAddressId =
      address._id;

    this.form = {

      label: address.label,

      street: address.street,

      city: address.city,

      state: address.state ?? '',

      country:
        address.country ?? 'Egypt',

      postalCode:
        address.postalCode ?? '',

      building:
        address.building ?? '',

      apartment:
        address.apartment ?? '',

      phone:
        address.phone ?? '',

      isDefault:
        address.isDefault,

    };

    this.isModalOpen = true;

    this.clearMessages();

    this._cdr.detectChanges();
  }

  closeModal(): void {

    if (this.isSubmitting) {
      return;
    }

    this.isModalOpen = false;

    this.selectedAddressId = null;

    this.resetForm();

    this._cdr.detectChanges();
  }

  resetForm(): void {

    this.form = {

      label: 'Home',

      street: '',

      city: '',

      state: '',

      country: 'Egypt',

      postalCode: '',

      building: '',

      apartment: '',

      phone: '',

      isDefault: false,

    };
  }

  saveAddress(): void {

    this.clearMessages();

    if (
      !this.form.street.trim() ||
      !this.form.city.trim()
    ) {

      this.errorMessage =
        'Street and city are required';

      this._cdr.detectChanges();

      return;
    }

    const payload: Omit<IAddress, '_id'> = {

      label: this.form.label.toLowerCase() as 'Home' | 'Work' | 'Other',

      street:
        this.form.street.trim(),

      city:
        this.form.city.trim(),

      country:
        this.form.country.trim() ||
        'Egypt',

      isDefault:
        this.form.isDefault,
    };

    this.addOptionalField(
      payload,
      'state',
      this.form.state
    );

    this.addOptionalField(
      payload,
      'postalCode',
      this.form.postalCode
    );

    this.addOptionalField(
      payload,
      'building',
      this.form.building
    );

    this.addOptionalField(
      payload,
      'apartment',
      this.form.apartment
    );

    this.addOptionalField(
      payload,
      'phone',
      this.form.phone
    );

    this.isSubmitting = true;

    this._cdr.detectChanges();

    if (
      this.isEditMode &&
      this.selectedAddressId
    ) {

      this._userService
        .updateAddress(
          this.selectedAddressId,
          payload
        )
        .subscribe({

          next: (response) => {

            this.addresses =
              response.data.address;

            this.successMessage =
              'Address updated successfully';

            this.isSubmitting = false;

            this._cdr.detectChanges();

            this.closeModal();
          },

          error: (error) => {

            console.error(error);

            this.errorMessage =
              error?.error?.message ||
              'Failed to update address';

            this.isSubmitting = false;

            this._cdr.detectChanges();
          },

        });

      return;
    }

    this._userService
      .addAddress(payload)
      .subscribe({

        next: (response) => {

          this.addresses =
            response.data.address;

          this.successMessage =
            'Address added successfully';

          this.isSubmitting = false;

          this._cdr.detectChanges();

          this.closeModal();
        },

        error: (error) => {

          console.error(error);

          this.errorMessage =
            error?.error?.message ||
            'Failed to add address';

          this.isSubmitting = false;

          this._cdr.detectChanges();
        },

      });
  }

  openDeleteModal(
    addressId: string
  ): void {

    this.selectedAddressId =
      addressId;

    this.isDeleteModalOpen = true;

    this.clearMessages();

    this._cdr.detectChanges();
  }

  closeDeleteModal(): void {

    if (this.isSubmitting) {
      return;
    }

    this.isDeleteModalOpen = false;

    this.selectedAddressId = null;

    this._cdr.detectChanges();
  }

  deleteAddress(): void {

    if (!this.selectedAddressId) {
      return;
    }

    this.isSubmitting = true;

    this.clearMessages();

    this._cdr.detectChanges();

    this._userService
      .deleteAddress(
        this.selectedAddressId
      )
      .subscribe({

        next: (response) => {

          this.addresses =
            response.data.address;

          this.successMessage =
            'Address deleted successfully';

          this.isSubmitting = false;

          this._cdr.detectChanges();

          this.closeDeleteModal();
        },

        error: (error) => {

          console.error(error);

          this.errorMessage =
            error?.error?.message ||
            'Failed to delete address';

          this.isSubmitting = false;

          this._cdr.detectChanges();
        },

      });
  }

  setDefaultAddress(
    addressId: string
  ): void {

    this.clearMessages();

    this.isSubmitting = true;

    this._cdr.detectChanges();

    this._userService
      .updateAddress(
        addressId,
        {
          isDefault: true,
        }
      )
      .subscribe({

        next: (response) => {

          this.addresses =
            response.data.address;

          this.successMessage =
            'Default address updated successfully';

          this.isSubmitting = false;

          this._cdr.detectChanges();
        },

        error: (error) => {

          console.error(error);

          this.errorMessage =
            error?.error?.message ||
            'Failed to update default address';

          this.isSubmitting = false;

          this._cdr.detectChanges();
        },

      });
  }

  getAddressLines(
    address: IAddress
  ): string {

    const parts = [

      address.street,

      address.building
        ? `Building ${address.building}`
        : '',

      address.apartment
        ? `Apt ${address.apartment}`
        : '',

      address.city,

      address.state,

      address.country,

      address.postalCode,

    ].filter(Boolean);

    return parts.join(', ');
  }

  private addOptionalField(
    payload: Omit<IAddress, '_id'>,
    key:
      | 'state'
      | 'postalCode'
      | 'building'
      | 'apartment'
      | 'phone',
    value: string
  ): void {

    const trimmedValue =
      value.trim();

    if (trimmedValue) {
      payload[key] = trimmedValue;
    }
  }

  private clearMessages(): void {

    this.errorMessage = '';
    this.successMessage = '';
  }
}
