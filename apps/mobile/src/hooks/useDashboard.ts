import {
  useEffect,
  useState,
} from 'react';

import { dashboardService } from '../services/dashboardService';
import { notificationEvents } from '../utils/notificationEvents';

import type {
  DashboardSummary,
} from '../types/dashboard';
import Toast from 'react-native-toast-message';
import type { Recall } from '../types/recall';
import { syncEvents } from '../utils/syncEvents';

import type {
  Notification,
} from '../types/notification';

import type {
  Transfer,
} from '../types/transfer';


export function useDashboard() {

  const [
    summary,
    setSummary,
  ] =
    useState<DashboardSummary>();

  const [
    notifications,
    setNotifications,
    ] =
    useState<Notification[]>([]);

    const [
    transfers,
    setTransfers,
    ] =
    useState<Transfer[]>([]);

  const [
    recalls,
    setRecalls,
  ] =
    useState<Recall[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  async function refresh() {

    setLoading(true);

    try {

      const [
        summary,
        notifications,
        transfers,
        recalls,
        ] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getNotifications(),
        dashboardService.getTransfers(),
        dashboardService.getRecalls(),
        ]);

      setSummary(summary);

      setNotifications(
        notifications.slice(0, 5),
      );

      setTransfers(
        transfers.slice(0, 5),
      );

      setRecalls(
        recalls.slice(0, 5),
      );

    }

    catch (error) {

      console.log(
        'Dashboard Error:',
        error,
      );

      Toast.show({
        type: 'error',
        text1: 'Unable to load dashboard',
      });

  }
    finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    refresh();

    const unsubscribe =
      notificationEvents.subscribe(() => {

        refresh();

      });

    return unsubscribe;

  }, []);

  return {

    summary,

    notifications,

    transfers,

    recalls,

    loading,

    refresh,

  };

}