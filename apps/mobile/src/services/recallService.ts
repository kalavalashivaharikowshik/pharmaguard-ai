import { api } from './api';
import { cacheStorage } from '../storage/cacheStorage';
export const recallService = {

  async getRecalls() {

    try {

      const response =
        await api.get('/recalls');

      await cacheStorage.save(

        'recalls',

        response.data,

      );

      return response.data;

    }

    catch {

      const cached =
        await cacheStorage.get<any[]>(

          'recalls',

        );

      return cached ?? [];

    }

  },

  async getRecall(
    id: string,
  ) {

    try {

      const response =
        await api.get(
          `/recalls/${id}`,
        );

      return response.data;

    }

    catch {

      const cached =
        await cacheStorage.get<any[]>(

          'recalls',

        );

      return (

        cached?.find(

          recall => recall.id === id,

        )

        ?? null

      );

    }

  },
};