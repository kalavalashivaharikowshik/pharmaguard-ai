import {

  useCallback,

  useEffect,

  useState,

} from 'react';

import Toast from 'react-native-toast-message';

import {

  scanHistoryService,

} from '../services/scanHistoryService';

import {

  useAuth,

} from '../context/AuthContext';

import type {

  ScanHistory,

} from '../types/scanHistory';

export function useScanHistory() {

  const {

    user,

  } = useAuth();

  const [

    history,

    setHistory,

  ] = useState<ScanHistory[]>([]);

  const [

    loading,

    setLoading,

  ] = useState(true);

  const refresh = useCallback(async () => {

    try {

      setLoading(true);

      let data: ScanHistory[];

      if (

        user?.role === 'SUPER_ADMIN' ||

        user?.role === 'REGULATOR'

      ) {

        data =

          await scanHistoryService.getNetworkHistory();

      }

      else {

        data =

          await scanHistoryService.getMyHistory();

      }

      setHistory(data);

    }

    catch {

      Toast.show({

        type: 'error',

        text1: 'Unable to load scan history',

      });

    }

    finally {

      setLoading(false);

    }

  }, [user]);

  useEffect(() => {

    refresh();

  }, [refresh]);

  return {

    history,

    loading,

    refresh,

  };

}