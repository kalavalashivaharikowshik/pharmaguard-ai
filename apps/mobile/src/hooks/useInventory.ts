import {
  useEffect,
  useState,
  useCallback,
} from 'react';

import {
  inventoryService,
} from '../services/inventoryService';

import type {
  InventoryBatch,
} from '../types/inventory';

import {
  useAuth,
} from '../context/AuthContext';

import { syncEvents } from '../utils/syncEvents';

export function useInventory() {

  const {
    user,
  } = useAuth();

  const [

    inventory,

    setInventory,

  ] =
    useState<InventoryBatch[]>([]);

  const [

    loading,

    setLoading,

  ] =
    useState(true);

  const [

    role,

    setRole,

  ] =
    useState('');

  const refresh = useCallback(async () => {

    if (!user) {

      return;

    }

    try {

      setLoading(true);

      const currentRole =
        user.role;

      setRole(currentRole);

      let data: InventoryBatch[];

      if (

        currentRole === 'SUPER_ADMIN' ||

        currentRole === 'REGULATOR'

      ) {

        data =
          await inventoryService
            .getNetworkInventory();

      }

      else {

        data =
          await inventoryService
            .getMyInventory();

      }

      setInventory(data);

    }

    catch (error) {

      console.log(
        'Inventory Error:',
        error,
      );

    }

    finally {

      setLoading(false);

    }

  }, [user]);

  useEffect(() => {

    refresh();

    const unsubscribe =
      syncEvents.subscribe(() => {

        refresh();

      });

    return unsubscribe;

  }, [refresh]);

  return {

    inventory,

    loading,

    refresh,

    role,

  };

}