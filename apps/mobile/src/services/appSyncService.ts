import { transferSyncService } from './transferSyncService';

import { dashboardService } from './dashboardService';

import { inventoryService } from './inventoryService';

import { notificationService } from './notificationService';

import { recallService } from './recallService';

import { syncEvents } from '../utils/syncEvents';

export const appSyncService = {

  async sync() {

    try {

      await transferSyncService.sync();

      await Promise.all([

        dashboardService.getSummary(),

        dashboardService.getNotifications(),

        dashboardService.getTransfers(),

        dashboardService.getRecalls(),

        inventoryService.getMyInventory(),

        notificationService.getNotifications(),

        recallService.getRecalls(),

        

      ]);

      syncEvents.emit();

    }

    catch (error) {

      console.log(

        'Background Sync Failed',

        error,

      );

    }

  },

};