export interface ISubCategory {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  category: string;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  subcategories: ISubCategory[];
}

export interface ICategoriesRes {
  status: number;
  message: string;
  data: {
    categories: ICategory[];
  };
}

export interface IAdminCategoriesRes {
  status: number;
  message: string;
  data: {
    docsCount: number;
    limit: number;
    pages: number;
    currentPage: number;
    result: ICategory[];
  };
}
