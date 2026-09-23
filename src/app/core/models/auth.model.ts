export interface ILoginData {
  email: string;
  password: string;
}

export interface ILoginRes {
  success: boolean;

  data: {
    access_token: string;
    refresh_token: string;
  };

  message?: string;
}

export interface ITokenPayload {
  sub: string;

  aud: [string, string];

  iat: number;

  exp: number;

  jti: string;

  iss: string;
}

export interface IRegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  gender?: 'male' | 'female';
  DOB?: string;
}

export interface IRegisterRes {
  success: boolean;

  data: {
    user: {
      _id: string;
      name: string;
      email: string;
      isVerified: boolean;
    };
  };

  message?: string;
}

export interface IVerifyEmailData {
  email: string;
  otp: string;
}

export interface IResendOtpData {
  email: string;
}

export interface IForgotPasswordData {
  email: string;
}

export interface IResetPasswordData {
  email: string;
  otp: string;
  password: string;
}

export interface IApiMessageRes {
  success: boolean;
  message?: string;
}

export interface IPasswordResponse {
  status: number;

  message: string;

  data: {
    accessToken: string;

    refreshToken: string;
  };
}
