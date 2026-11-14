import {
  useEffect,
  useState,
  useCallback,
} from 'react';

import {
  transferService,
} from '../services/transferService';

import type {
  Transfer,
} from '../types/transfer';

import {
  syncEvents,
} from '../utils/syncEvents';

export function useTransfers() {

  const [

    transfers,

    setTransfers,

  ] = useState<Transfer[]>([]);

  const [

    loading,

    setLoading,

  ] = useState(true);

  const refresh = useCallback(async () => {

    try {

      setLoading(true);

      const data =

        await transferService.getTransfers();

      setTransfers(data);

    }

    finally {

      setLoading(false);

    }

  }, []);

  useEffect(() => {

    refresh();

    const unsubscribe =

      syncEvents.subscribe(() => {

        refresh();

      });

    return unsubscribe;

  }, [refresh]);

  return {

    transfers,

    loading,

    refresh,

  };

}