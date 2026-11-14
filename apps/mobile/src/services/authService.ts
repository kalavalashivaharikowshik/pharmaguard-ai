import { api } from './api';

import type {
  LoginDto,
  LoginResponse,
} from '../types/auth';

import type {
  ForgotPasswordDto,
  ResetPasswordDto,
} from '../types/password';

export const authService = {

  async login(
    dto: LoginDto,
  ) {

    const response =
      await api.post<LoginResponse>(
        '/auth/login',
        dto,
      );

    return response.data;
  },

  async forgotPassword(
    dto: ForgotPasswordDto,
  ) {

    const response =
      await api.post(
        '/auth/forgot-password',
        dto,
      );

    return response.data;
  },

  async resetPassword(
    dto: ResetPasswordDto,
  ) {

    const response =
      await api.post(
        '/auth/reset-password',
        dto,
      );

    return response.data;
  },

  async me() {

    const response =
      await api.get(
        '/auth/me',
      );

    return response.data;

  }
};

