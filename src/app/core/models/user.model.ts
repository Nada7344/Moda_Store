
export interface IUser {
  _id: string;

  name: string;

  email: string;

  phone?: string;

  gender?: string;

  DOB?: string;

  isVerified: boolean;

  address: IAddress[];

  role?: string;
  isBlocked?: boolean;
  ordersHistory?: string[];
  createdAt?: string;
}

export interface IUserResponse {
  status: number;

  message: string;

  data: {
    user: IUser;
  };
}

export interface IAddress {
  _id: string;
  label: 'Home' | 'Work' | 'Other';
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  building?: string;
  apartment?: string;
  phone?: string;
  isDefault: boolean;
}

export interface IUserResponse {
  status: number;
  message: string;
  data: {
    user: IUser;
  };
}

export interface IAddAddressResponse {
  status: number;
  message: string;
  data: {
    address: IAddress[];
  };
}

export interface IAddressResponse {
  status: number;

  message: string;

  data: {
    address: IAddress[];
  };
}
