import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  CommonModule,
  DOCUMENT
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

import {
  UserService
} from '../../core/services/user.service';

import {
  IUser
} from '../../core/models/user.model';

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
export class Navbar implements OnInit, OnDestroy {

  searchTerm = '';

  isMenuOpen = false;

  profileOpen = false;

  userData$;

  cartCount$;

  categories: ICategory[] = [];

  currentUser: IUser | null = null;

  constructor(
    private _authService: AuthService,
    private _categoryService: CategoryService,
    private _cartService: CartService,
    private _cdr: ChangeDetectorRef,
    private _router: Router,
    private _userService: UserService,
    @Inject(DOCUMENT) private _document: Document
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

        this.loadCurrentUser(!!user);

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

    this.closeMenu();

    this._router.navigate(
      ['/products'],
      { queryParams: { search: term } }
    );
  }

  private loadCurrentUser(isLoggedIn: boolean): void {

    if (!isLoggedIn) {

      this.currentUser = null;

      return;
    }

    this._userService
      .getProfile()
      .subscribe({

        next: response => {

          this.currentUser = response.data.user;

          this._cdr.detectChanges();
        },

        error: () => {

          this.currentUser = null;
        }

      });
  }

  get userInitials(): string {

    const name = this.currentUser?.name?.trim();

    if (!name) {
      return 'M';
    }

    return name
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase();
  }

  toggleMenu(): void {

    this.setMenu(!this.isMenuOpen);
  }

  closeMenu(): void {

    this.setMenu(false);
  }

  get isProfileRoute(): boolean {

    return this._router.url.startsWith('/profile');
  }

  toggleProfile(): void {

    this.profileOpen = !this.profileOpen;
  }

  private setMenu(open: boolean): void {

    this.isMenuOpen = open;

    // open the Profile submenu by default when the user is already inside it
    if (open) {
      this.profileOpen = this.isProfileRoute;
    }

    // lock page scroll behind the drawer
    this._document.body.style.overflow =
      open ? 'hidden' : '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {

    if (this.isMenuOpen) {
      this.closeMenu();
    }
  }

  @HostListener('window:resize')
  onResize(): void {

    // drawer is mobile-only; release it if the window grows to desktop width
    if (this.isMenuOpen && window.innerWidth > 900) {
      this.closeMenu();
    }
  }

  ngOnDestroy(): void {

    this._document.body.style.overflow = '';
  }

  onLogout(): void {

    this.closeMenu();

    this.logout();
  }

  logout(): void {

    this._authService.logout();
  }

}
