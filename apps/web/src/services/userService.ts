import { api } from './api';

export const userService = {

  async getProfile() {

    const response =
      await api.get(
        '/users/me',
      );

    return response.data;
  },

  async changePassword(
    data: {
      currentPassword: string;
      newPassword: string;
    },
  ) {

    const response =
      await api.patch(
        '/users/password',
        data,
      );

    return response.data;
  },

  async getAll() {

    const response =
      await api.get(
        '/users',
      );

    return response.data;
  },

  async create(
    data: {
      fullName: string;
      email: string;
      password: string;
      role: string;
      organizationName: string;
    },
  ) {

    const response =
      await api.post(
        '/users',
        data,
      );

    return response.data;
  },

  async updateRole(
    userId: string,
    role: string,
  ) {

    const response =
      await api.patch(
        `/users/${userId}/role`,
        {
          role,
        },
      );

    return response.data;

  },

  async updateStatus(
    userId: string,
    status: string,
  ) {

    const response =
      await api.patch(
        `/users/${userId}/status`,
        {
          status,
        },
      );

    return response.data;

  },

};