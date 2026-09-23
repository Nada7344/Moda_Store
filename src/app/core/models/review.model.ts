import { IProductImage } from './product.model';

export interface IReviewUser {
  _id: string;
  name: string;
  email?: string;
}

export interface IReviewProduct {
  _id: string;
  name: string;
  slug: string;
  images: IProductImage[];
}

export interface IReview {
  _id: string;

  userId: IReviewUser;

  productId: string | IReviewProduct;

  rate: number;

  message: string;

  status: string;

  createdAt: string;

  updatedAt: string;
}

export interface IReviewsRes {
  status: number;

  message: string;

  data: {
    docsCount: number;

    limit: number;

    pages: number;

    currentPage: number;

    result: IReview[];
  };
}

export interface IReviewRes {
  status: number;

  message: string;

  data: {
    review: IReview;
  };
}

export interface IFeaturedReviewsRes {
  status: number;

  message: string;

  data: {
    reviews: IReview[];
  };
}

export interface ICreateReview {
  productId: string;

  rate: number;

  message: string;
}
