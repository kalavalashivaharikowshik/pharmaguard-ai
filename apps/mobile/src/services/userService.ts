import { api } from './api';

export const userService = {

  async getProfile() {

    const response =
      await api.get('/users/me');

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

};