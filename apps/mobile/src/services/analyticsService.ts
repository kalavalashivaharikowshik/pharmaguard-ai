import { api } from './api';

import type {

  DashboardAnalytics,

} from '../types/analytics';

export const analyticsService = {

  async getDashboardAnalytics(

    year?: number,

  ): Promise<DashboardAnalytics> {

    const response =

      await api.get(

        '/analytics/dashboard',

        {

          params: {

            year,

          },

        },

      );

    return response.data;

  },

};