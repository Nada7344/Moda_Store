

export type ReportGroupBy = 'day' | 'week' | 'month';

export interface IReportOverview {
  totalOrders: number;

  ordersByStatus: Record<string, number>;

  totalRevenue: number;
  paidOrders: number;

  totalUsers: number;
  totalProducts: number;
}

export interface IReportOverviewRes {
  status: number;
  message: string;
  data: {
    overview: IReportOverview;
  };
}

export interface ISalesPoint {
  period: string;
  revenue: number;
  ordersCount: number;
}

export interface ISalesReportRes {
  status: number;
  message: string;
  data: {
    sales: {
      groupBy: ReportGroupBy;
      series: ISalesPoint[];
    };
  };
}

export interface ITopProduct {
  productId: string;
  name: string;
  slug: string;
  quantitySold: number;
  revenue: number;
}

export interface ITopProductsRes {
  status: number;
  message: string;
  data: {
    topProducts: ITopProduct[];
  };
}

export interface INewUsersPoint {
  period: string;
  newUsers: number;
}

export interface INewUsersReportRes {
  status: number;
  message: string;
  data: {
    newUsers: {
      groupBy: ReportGroupBy;
      series: INewUsersPoint[];
    };
  };
}

export interface IReportDateRange {
  from?: string;
  to?: string;
}
