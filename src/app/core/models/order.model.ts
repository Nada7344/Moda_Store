import { IAddress } from './user.model';
import { IProductImage } from './product.model';

export interface IOrderProduct {
  productId: {
    _id: string;
    name: string;
    slug: string;
    images: IProductImage[];
  };
  quantity: number;
  price: number;
}

export interface ICreateOrder {
  addressId?: string;
  address?: {
    label?: 'Home' | 'Work' | 'Other';
    street: string;
    city: string;
    state?: string;
    country?: string;
    postalCode?: string;
    building?: string;
    apartment?: string;
    phone?: string;
    isDefault?: boolean;
  };
}

export interface IOrderAddress {
  label: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state?: string;
  country?: string;
  postalCode?: string;
  building?: string;
  apartment?: string;
  phone?: string;
}

export interface ICreateOrderRequest {
  addressId?: string;
  address?: IOrderAddress;
}

export type OrderStatus =
  | 'Pending'
  | 'In Progress'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled by Customer'
  | 'Cancelled by Admin'
  | 'Rejected'
  | 'Refunded';

export interface IOrder {
  _id: string;
  userId: string | { _id: string; name: string; email: string; phone?: string };
  products: IOrderProduct[];
  totalPrice: number;
  orderedAt: string;
  address: IAddress;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IOrderResponse {
  status: number;
  message: string;
  data: {
    order: IOrder;
  };
}

export interface IOrdersResponse {
  status: number;
  message: string;
  data: {
    docsCount: number;
    limit: number;
    pages: number;
    currentPage: number;
    result: IOrder[];
  };
}


export interface ITimelineStep {
  title: string;
  time: string;
  state: 'done' | 'current' | 'upcoming';
}
