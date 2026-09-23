import { Routes } from '@angular/router';

import { Layout } from './layout/layout';

import { Home } from './layout/home/home';

import { Products } from './layout/products/products';
import { ProductList } from './layout/products/product-list/product-list';
import { ProductDetails } from './layout/products/product-details/product-details';

import { Cart } from './layout/cart/cart';
import { Checkout } from './layout/checkout/checkout';

import { Orders } from './layout/orders/orders';
import { OrderDetails } from './layout/orders/order-details/order-details';

import { Profile } from './layout/profile/profile';
import { PersonalInfo } from './layout/profile/personal-info/personal-info';
import { Addresses } from './layout/profile/addresses/addresses';
import { Password } from './layout/profile/password/password';

import { About } from './layout/about/about';
import { Policies } from './layout/policies/policies';
import { Contact } from './layout/contact/contact';

import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Verify } from './auth/verify/verify';
import { ForgotPassword } from './auth/forgot-password/forgot-password';
import { ResetPassword } from './auth/reset-password/reset-password';

import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { Dashboard } from './dashboard/dashboard';
import { AdminProducts } from './dashboard/admin-products/admin-products';
import { AdminProductForm } from './dashboard/admin-product-form/admin-product-form';
import { AdminCategories } from './dashboard/admin-categories/admin-categories';
import { AdminOrders } from './dashboard/admin-orders/admin-orders';
import { AdminLayout } from './dashboard/admin-layout/admin-layout';
import { AdminUsers } from './dashboard/admin-users/admin-users';
import { AdminReviews } from './dashboard/admin-reviews/admin-reviews';
import { AdminOrderDetails } from './dashboard/admin-order-details/admin-order-details';
import { NotFound } from './shared/not-found/not-found';

export const routes: Routes = [

  {
    path: 'login',
    component: Login,

  },

  {
    path: 'register',
    component: Register,

  },

  {
    path: 'verify',
    component: Verify,

  },

  {
    path: 'forgot-password',
    component: ForgotPassword,

  },

  {
    path: 'reset-password',
    component: ResetPassword,

  },

  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminGuard],

    children: [

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      {
        path: 'dashboard',
        component:Dashboard
      },

      {
        path: 'products',
        component: AdminProducts
      },

      {
        path: 'products/new',
        component: AdminProductForm
      },

      {
        path: 'categories',
        component: AdminCategories
      },

      {
        path: 'orders',
        component: AdminOrders
      },

      {
        path: 'orders/:orderId',
        component: AdminOrderDetails
      },

      {
        path: 'reviews',
        component: AdminReviews
      },

      {
        path: 'users',
        component: AdminUsers
      }

    ]
  },

  {
    path: '',
    component: Layout,

    children: [

      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },

      {
        path: 'home',
        component: Home
      },

      {
        path: 'about',
        component: About
      },

      {
        path: 'policies',
        component: Policies
      },

      {
        path: 'contact',
        component: Contact
      },

      {
        path: 'products',
        component: Products,

        children: [

          {
            path: '',
            component: ProductList
          },

          {
            path: ':slug',
            component: ProductDetails
          }

        ]
      },

      {
        path: 'cart',
        component: Cart
      },

      {
        path: 'checkout',
        component: Checkout,
        canActivate: [authGuard]
      },

      {
        path: 'orders',
        component: Orders,
        canActivate: [authGuard]
      },

      {
        path: 'orders/:orderId',
        component: OrderDetails,
        canActivate: [authGuard]
      },

      {
        path: 'profile',
        component: Profile,
        canActivate: [authGuard],

        children: [

          {
            path: '',
            redirectTo: 'personal-information',
            pathMatch: 'full'
          },

          {
            path: 'personal-information',
            component: PersonalInfo
          },

          {
            path: 'addresses',
            component: Addresses
          },

          {
            path: 'password',
            component: Password
          },

          {
            path: 'orders',
            component: Orders
          }

        ]
      }

    ]
  },

  {
    path: '**',
    component: NotFound
  }

];
