import { api } from './api';

import type {

  ScanHistory,

} from '../types/scanHistory';

export const scanHistoryService = {

  async getMyHistory(): Promise<ScanHistory[]> {

    const response =

      await api.get(

        '/scan-history/my',

      );

    return response.data;

  },

  async getNetworkHistory(): Promise<ScanHistory[]> {

    const response =

      await api.get(

        '/scan-history/network',

      );

    return response.data;

  },

};