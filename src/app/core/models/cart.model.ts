import { IProductImage } from './product.model';

export interface IGuestCartItem {
  productId: string;
  quantity: number;

  product: ICartProduct;
}

export interface ICartProduct {
  _id: string;
  name: string;
  slug: string;
  images: IProductImage[];
  price: number;
  stock: number;
  isActive: boolean;
  isDeleted: boolean;
}

export interface ICartItem {
  productId: ICartProduct;
  quantity: number;
  price: number;
}

export interface ICart {
  _id?: string;
  userId: string;
  products: ICartItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ICartResponse {
  status: number;
  message: string;
  data: {
    cart: ICart;
  };
}

export interface IAddToCart {
  productId: string;
  quantity: number;
}

export interface ISyncCartResponse {
  status: number;
  message: string;
  data: {
    cart: ICart;

    skipped: {
      productId: string;
      reason: string;
    }[];
  };
}
