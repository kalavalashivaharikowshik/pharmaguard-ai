import { api } from './api';

import Toast from 'react-native-toast-message';

import {
  triggerLogout,
} from '../utils/sessionManager';
import { tokenStorage } from '../storage/tokenStorage';

api.interceptors.request.use(

  async config => {

    const token =
      await tokenStorage.get();

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;

    }

    return config;

  },

);

api.interceptors.response.use(

  response => response,

  async error => {

    if (

      error.response?.status === 401 &&
      await tokenStorage.get()


    ) {

      Toast.show({

        type: 'error',

        text1: 'Session Expired',

        text2: 'Please login again.',

      });

      await triggerLogout();

    }

    return Promise.reject(error);

  },

);