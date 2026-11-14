import { api } from './api';

import {
  InventoryBatch,
  BlockchainVerification,
} from '../types/inventory';

import { cacheStorage } from '../storage/cacheStorage';

export const inventoryService = {

  async getMyInventory(): Promise<InventoryBatch[]> {

    try {

      const response =
        await api.get<InventoryBatch[]>(
          '/inventory/my',
        );

      await cacheStorage.save(
        'inventory',
        response.data,
      );

      return response.data;

    }

    catch {

      const cached =
        await cacheStorage.get<InventoryBatch[]>(
          'inventory',
        );

      return cached ?? [];

    }

  },

  async getNetworkInventory(): Promise<InventoryBatch[]> {

    try {

      const response =
        await api.get<InventoryBatch[]>(
          '/inventory/network',
        );

      await cacheStorage.save(
        'networkInventory',
        response.data,
      );

      return response.data;

    }

    catch {

      const cached =
        await cacheStorage.get<InventoryBatch[]>(
          'networkInventory',
        );

      return cached ?? [];

    }

  },

  async verifyBatch(
    batchNumber: string,
  ): Promise<BlockchainVerification> {

    const response =
      await api.get<BlockchainVerification>(
        `/blockchain/verify/${batchNumber}`,
      );

    return response.data;

  },

};