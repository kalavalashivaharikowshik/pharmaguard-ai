import {
  useNavigate,
} from 'react-router-dom';

import {
  useNotifications,
} from '../context/NotificationContext';

import {
  formatDistanceToNow,
} from 'date-fns';

import DashboardLayout
  from '../components/layout/DashboardLayout';

import Card
  from '../components/ui/Card';

import Button
  from '../components/ui/Button';

export default function Notifications() {

  const {

    notifications,

    markAsRead,

    markAllAsRead,

    deleteNotification,

  } =
    useNotifications();

  const navigate =
    useNavigate();

  const totalNotifications =
    notifications.length;

  const unreadNotifications =
    notifications.filter(
      n => !n.isRead,
    ).length;

  const criticalNotifications =
    notifications.filter(
      n => n.priority === 'CRITICAL',
    ).length;

  const todayNotifications =
    notifications.filter(
      n => {

        const today =
          new Date();

        return (
          new Date(
            n.createdAt,
          ).toDateString() ===
          today.toDateString()
        );

      },
    ).length;

  const markAll =
    () =>
      markAllAsRead();

  const remove =
    (id: string) =>
      deleteNotification(
        id,
      );

  const getIcon = (
    type: string,
  ) => {

    switch (type) {

      case 'TRANSFER':
        return '🚚';

      case 'RECALL':
        return '🚨';

      case 'REVOCATION':
        return '⛔';

      case 'EXPIRY':
        return '⏰';

      case 'BLOCKCHAIN':
        return '🔗';

      case 'COMPLIANCE':
        return '📊';

      case 'USER':
        return '👤';

      case 'SECURITY':
        return '🔒';

      default:
        return '🔔';

    }

  };

  const getPriorityColor = (
    priority: string,
  ) => {

    switch (priority) {

      case 'CRITICAL':
        return 'bg-red-100 text-red-700';

      case 'HIGH':
        return 'bg-orange-100 text-orange-700';

      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700';

      case 'LOW':
        return 'bg-blue-100 text-blue-700';

      default:
        return 'bg-slate-100 text-slate-700';

    }

  };

  return (

    <DashboardLayout>

      <div className="space-y-8">

        <div className="rounded-3xl bg-gradient-to-r from-[#0F4C81] via-[#155A94] to-[#2E8B57] p-8 text-white shadow-xl">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h1 className="text-4xl font-bold">

                Notifications

              </h1>

              <p className="mt-2 text-teal-100">

                Recent alerts, recalls and system updates

              </p>

            </div>

            <Button
              variant="light"
              onClick={markAll}
            >
              ✓ Mark All Read
            </Button>

          </div>

        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <Card>

            <p className="text-sm text-slate-500">

              Total

            </p>

            <p className="mt-3 text-4xl font-bold text-slate-900">

              {totalNotifications}

            </p>

          </Card>

          <Card>

            <p className="text-sm text-slate-500">

              Unread

            </p>

            <p className="mt-3 text-4xl font-bold text-red-600">

              {unreadNotifications}

            </p>

          </Card>

          <Card>

            <p className="text-sm text-slate-500">

              Critical

            </p>

            <p className="mt-3 text-4xl font-bold text-orange-600">

              {criticalNotifications}

            </p>

          </Card>

          <Card>

            <p className="text-sm text-slate-500">

              Today

            </p>

            <p className="mt-3 text-4xl font-bold text-teal-600">

              {todayNotifications}

            </p>

          </Card>

        </div>

        <Card className="overflow-hidden p-0">

          <div className="max-h-[650px] overflow-y-auto">

            {notifications.length === 0 && (

              <div className="py-24 text-center">

                <div className="space-y-4">

                  <div className="text-6xl">

                    🔔

                  </div>

                  <h3 className="text-2xl font-bold">

                    No Notifications

                  </h3>

                  <p className="text-slate-500">

                    You're all caught up.

                  </p>

                </div>

              </div>

            )}

            {notifications.map(
              notification => (

                <div
                  key={notification.id}
                  className="
                    flex
                    cursor-pointer
                    justify-between
                    border-b
                    p-6
                    transition-all
                    duration-200
                    hover:bg-slate-50
                    hover:shadow-sm
                  "
                  onClick={() => {

                    if (
                      notification.actionUrl
                    ) {

                      navigate(
                        notification.actionUrl,
                      );

                    }

                  }}
                >
                                <div className="flex-1">

                    <h3 className="flex items-center gap-3 text-lg font-semibold text-slate-800">

                      <span className="text-2xl">

                        {getIcon(
                          notification.type,
                        )}

                      </span>

                      {notification.title}

                    </h3>

                    <p className="mt-3 leading-7 text-slate-600">

                      {notification.message}

                    </p>

                    <p className="mt-3 text-sm text-slate-400">

                      {formatDistanceToNow(

                        new Date(
                          notification.createdAt,
                        ),

                        {
                          addSuffix: true,
                        },

                      )}

                    </p>

                    <div className="mt-4 flex items-center gap-3">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityColor(
                          notification.priority,
                        )}`}
                      >

                        {notification.priority}

                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          notification.isRead
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >

                        {notification.isRead
                          ? 'READ'
                          : 'UNREAD'}

                      </span>

                    </div>

                  </div>

                  <div className="flex flex-col items-end gap-3">

                    {!notification.isRead && (

                      <Button
                        variant="secondary"
                        onClick={(e) => {

                          e.stopPropagation();

                          markAsRead(
                            notification.id,
                          );

                        }}
                      >

                        ✓ Mark Read

                      </Button>

                    )}

                    <button
                      onClick={(e) => {

                        e.stopPropagation();

                        remove(
                          notification.id,
                        );

                      }}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                    >

                      Delete

                    </button>

                  </div>

                </div>

              ),
            )}

          </div>

        </Card>

      </div>

    </DashboardLayout>

  );

}