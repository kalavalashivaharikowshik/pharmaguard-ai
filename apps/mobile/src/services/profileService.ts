import { api } from './api';

export const profileService = {

  async me() {

    const response =
      await api.get('/auth/me');

    return response.data;

  },

  async changePassword(

    currentPassword: string,

    newPassword: string,

  ) {

    const response =
      await api.patch(
        '/users/change-password',
        {

          currentPassword,

          newPassword,

        },
      );

    return response.data;

  },

};