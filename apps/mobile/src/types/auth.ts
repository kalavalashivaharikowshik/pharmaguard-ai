export interface User {
  id: string;

  fullName: string;

  email: string;

  role: string;

  organizationName?: string;

  phone?: string;

  manufacturerId?: string;

  status?: string;

  isVerified?: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;

  user: User;
}