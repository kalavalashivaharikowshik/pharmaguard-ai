import { api } from './api';

export const complianceService = {

  async getSummary() {

    const response =
      await api.get(
        '/compliance/summary',
      );

    return response.data;
  },

  async getRecalls() {

    const response =
      await api.get(
        '/compliance/recalls',
      );

    return response.data;
  },

  async getTransfers() {

    const response =
      await api.get(
        '/compliance/transfers',
      );

    return response.data;
  },

  async getExpiry() {

    const response =
      await api.get(
        '/compliance/expiry',
      );

    return response.data;
  },

  async exportPdf() {

    const response =
      await api.get(
        '/compliance/export/pdf',
        {
          responseType: 'blob',
        },
      );

    return response.data;

  },

};