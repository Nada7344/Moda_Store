export interface ICategory {
  _id: string;
  name: string;
  slug: string;
}

export interface ISubCategory {
  _id: string;
  name: string;
  slug: string;
}

export interface IProductImage {
  secure_url: string;
  public_id: string;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  shippingPrice: number;
  stock: number;

  isActive: boolean;
  isDeleted: boolean;

  category: ICategory;
  subcategory: ISubCategory;

  images: IProductImage[];

  flags: {
    topSales: boolean;
    newArrival: boolean;
  };

  ratingsAverage: number;
  isOutOfStock: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface IProductsRes {
  status: number;
  message: string;
  data: {
    docsCount: number;
    limit: number;
    pages: number;
    currentPage: number;
    result: IProduct[];
  };
}

export interface IProductRes {
  status: number;
  message: string;
  data: {
    product: IProduct;
  };
}

export interface IProductFilters {
  page?: number | 'all';
  size?: number;
  category?: string;
  subcategory?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  topSales?: boolean;
  newArrival?: boolean;
  inStock?: boolean;
  sort?: 'priceAsc' | 'priceDesc' | 'newest' | 'rating';
}
