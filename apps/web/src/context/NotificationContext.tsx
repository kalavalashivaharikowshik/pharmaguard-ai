import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { socket } from '../socket';

import { notificationService } from '../services/notificationService';

import type { Notification } from '../types/notification';

interface NotificationContextType {

  notifications: Notification[];

  unread: number;

  markAsRead: (
    id: string,
  ) => Promise<void>;

  markAllAsRead: () => Promise<void>;

  deleteNotification: (
    id: string,
  ) => Promise<void>;

}

const NotificationContext =
  createContext<NotificationContextType>(
    {} as NotificationContextType,
  );

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [
    notifications,
    setNotifications,
  ] =
    useState<Notification[]>([]);

  const [
    unread,
    setUnread,
  ] =
    useState(0);

  const load =
    async () => {

      try {

        const data =
          await notificationService
            .getMyNotifications();

        setNotifications(
          data,
        );

        setUnread(

          data.filter(
            notification =>
              !notification.isRead,
          ).length,

        );

      } catch {

        setNotifications([]);

        setUnread(0);

      }

    };

  useEffect(() => {

    const token =
      localStorage.getItem(
        'token',
      );

    if (!token) {
      return;
    }

    load();

    socket.on(
      'notification',
      (notification: Notification) => {

        console.log(
          'NotificationContext received:',
          notification,
        );

        setNotifications(
          previous => [

            notification,

            ...previous,

          ],
        );

        setUnread(
          previous => previous + 1,
        );

      },
    );

    return () => {

      socket.off(
        'notification',
      );

    };

  }, []);

  const markAsRead =
    async (
        id: string,
    ) => {

        const notification =
        notifications.find(
            n => n.id === id,
        );

        await notificationService
        .markAsRead(
            id,
        );

        setNotifications(
        previous =>
            previous.map(
            n =>
                n.id === id
                ? {
                    ...n,
                    isRead: true,
                    }
                : n,
            ),
        );

        if (
        notification &&
        !notification.isRead
        ) {

        setUnread(
            previous =>
            Math.max(
                previous - 1,
                0,
            ),
        );

        }

    };

  const markAllAsRead =
    async () => {

      await notificationService
        .markAllAsRead();

      setNotifications(
        previous =>

          previous.map(
            notification => ({

              ...notification,

              isRead: true,

            }),
          ),

      );

      setUnread(
        0,
      );

    };

    const deleteNotification =
        async (
            id: string,
        ) => {

            const notification =
            notifications.find(
                n => n.id === id,
            );

            await notificationService
            .deleteNotification(
                id,
            );

            setNotifications(
            previous =>
                previous.filter(
                n => n.id !== id,
                ),
            );

            if (
            notification &&
            !notification.isRead
            ) {

            setUnread(
                previous =>
                Math.max(
                    previous - 1,
                    0,
                ),
            );

            }

        };

  return (

    <NotificationContext.Provider
      value={{

        notifications,

        unread,

        markAsRead,

        markAllAsRead,

        deleteNotification,

      }}
    >

      {children}

    </NotificationContext.Provider>

  );

}

export const useNotifications =
  () =>
    useContext(
      NotificationContext,
    );