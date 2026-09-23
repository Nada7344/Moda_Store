import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { IProductImage } from '../../core/models/product.model';

export interface IOrderCardProduct {
  productId: {
    _id: string;
    name: string;
    slug: string;
    images: IProductImage[];
  };

  quantity: number;

  price: number;
}

export interface IOrderCardData {
  _id: string;

  products: IOrderCardProduct[];

  totalPrice: number;

  orderedAt: string;

  status: string;
}

@Component({
  selector: 'app-order-card',

  standalone: true,

  imports: [
    CommonModule,
    DecimalPipe,
    DatePipe,
    RouterLink
  ],

  templateUrl: './order-card.html',

  styleUrl: './order-card.css',
})
export class OrderCard {

  @Input({ required: true })
  order!: IOrderCardData;

  get itemsCount(): number {

    return this.order.products.reduce(
      (total, item) =>
        total + item.quantity,

      0
    );

  }

  get formattedOrderId(): string {

    return '#' + this.order._id.slice(-6).toUpperCase();

  }

  get statusClass(): string {

    switch (this.order.status) {

      case 'Pending':
        return 'status-badge--pending';

      case 'In Progress':
        return 'status-badge--in-progress';

      case 'Shipped':
        return 'status-badge--shipped';

      case 'Delivered':
        return 'status-badge--delivered';

      case 'Cancelled by Customer':
      case 'Cancelled by Admin':
        return 'status-badge--cancelled';

      case 'Rejected':
        return 'status-badge--rejected';

      case 'Refunded':
        return 'status-badge--refunded';

      default:
        return 'status-badge--pending';

    }

  }

  getStatusLabel(): string {

    return this.order.status;

  }

}
