import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import {
  AuthService
} from '../../core/services/auth.service';

import {
  CategoryService
} from '../../core/services/category.service';

import {
  ICategory
} from '../../core/models/category.model';

import {
  CartService
} from '../../core/services/cart.service';

@Component({
  selector: 'app-navbar',

  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    FormsModule
  ],

  templateUrl: './navbar.html',

  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {

  searchTerm = '';

  userData$;

  cartCount$;

  categories: ICategory[] = [];

  constructor(
    private _authService: AuthService,
    private _categoryService: CategoryService,
    private _cartService: CartService,
    private _cdr: ChangeDetectorRef,
    private _router: Router
  ) {

    this.userData$ =
      this._authService.returnUserData();

    this.cartCount$ =
      this._cartService.cartCount$;
  }

  ngOnInit(): void {

    this._authService.checkIfLogin();

    this._categoryService
      .getNavbarCategories()
      .subscribe({

        next: response => {

          this.categories =
            response.data.categories;

          this._cdr.detectChanges();
        },

        error: error => {

          console.error(
            'Navbar Categories Error:',
            error
          );

          this._cdr.detectChanges();
        }

      });

    this._authService
      .returnUserData()
      .subscribe(user => {

        this._cartService
          .getCart(!!user)
          .subscribe({

            next: response => {

              console.log(
                'NAVBAR CART:',
                response.data.cart
              );

              this._cartService
                .setCartCount(
                  response.data.cart
                );

              this._cdr.detectChanges();
            },

            error: error => {

              console.error(
                'Navbar Cart Error:',
                error
              );

              this._cdr.detectChanges();
            }

          });

      });

  }

  getCategoryParams(
    slug: string
  ): { category?: string } {

    const category =
      this.categories.find(
        item =>
          item.slug === slug
      );

    return category
      ? {
          category: category._id
        }
      : {};
  }

  onSearch(): void {

    const term = this.searchTerm.trim();

    if (!term) {
      return;
    }

    this._router.navigate(
      ['/products'],
      { queryParams: { search: term } }
    );
  }

  logout(): void {

    this._authService.logout();
  }

}
