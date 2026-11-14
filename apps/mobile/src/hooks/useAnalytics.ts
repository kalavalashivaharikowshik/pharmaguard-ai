import {

  useEffect,

  useState,

  useCallback,

} from 'react';

import Toast from 'react-native-toast-message';

import {

  analyticsService,

} from '../services/analyticsService';

import type {

  DashboardAnalytics,

} from '../types/analytics';

export function useAnalytics() {

  const [

    analytics,

    setAnalytics,

  ] = useState<DashboardAnalytics>();

  const [

    loading,

    setLoading,

  ] = useState(true);

  const refresh = useCallback(async () => {

    try {

      setLoading(true);

      const data =

        await analyticsService.getDashboardAnalytics();

      setAnalytics(data);

    }

    catch {

      Toast.show({

        type: 'error',

        text1: 'Unable to load analytics',

      });

    }

    finally {

      setLoading(false);

    }

  }, []);

  useEffect(() => {

    refresh();

  }, [refresh]);

  return {

    analytics,

    loading,

    refresh,

  };

}