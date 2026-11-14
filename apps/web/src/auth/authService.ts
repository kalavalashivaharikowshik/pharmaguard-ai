import { api } from '../services/api';

export const authService = {
  async login(
    email: string,
    password: string,
  ) {
    const response =
      await api.post(
        '/auth/login',
        {
          email,
          password,
        },
      );

    return response.data;
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) {
    const response =
      await api.post(
        '/auth/register',
        data,
      );

    return response.data;
  },
};