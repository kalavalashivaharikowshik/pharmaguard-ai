import {
  useEffect,
  useState,
} from 'react';

import DashboardLayout
  from '../components/layout/DashboardLayout';

import Card
  from '../components/ui/Card';

import Button
  from '../components/ui/Button';

import Input
  from '../components/ui/Input';

import CreateUserModal
  from '../components/users/CreateUserModal';

import UserDetailsDrawer
  from '../components/users/UserDetailsDrawer';

import {
  userService,
} from '../services/userService';

import type {
  User,
} from '../types/user';

export default function Users() {

  const [
    users,
    setUsers,
  ] =
    useState<User[]>([]);

  const [
    search,
    setSearch,
  ] =
    useState('');

  const [
    selectedUser,
    setSelectedUser,
  ] =
    useState<User | null>(
      null,
    );

  const [
    openCreate,
    setOpenCreate,
  ] =
    useState(false);

  const loadUsers =
    async () => {

      const data =
        await userService.getAll();

      setUsers(data);

    };

  useEffect(() => {

    loadUsers();

  }, []);

  const filteredUsers =
    users.filter(user =>

      user.fullName
        .toLowerCase()
        .includes(
          search.toLowerCase(),
        ) ||

      user.email
        .toLowerCase()
        .includes(
          search.toLowerCase(),
        ) ||

      user.role
        .toLowerCase()
        .includes(
          search.toLowerCase(),
        ),

    );

  const activeUsers =
    users.filter(
      user =>
        user.status === 'ACTIVE',
    ).length;

  const manufacturerUsers =
    users.filter(
      user =>
        user.role ===
        'MANUFACTURER',
    ).length;

  const distributorUsers =
    users.filter(
      user =>
        user.role ===
        'DISTRIBUTOR',
    ).length;

  const regulatorUsers =
    users.filter(
      user =>
        user.role ===
        'REGULATOR',
    ).length;

  return (

    <DashboardLayout>

      <div className="space-y-8">

        <div className="rounded-3xl bg-gradient-to-r from-[#0F766E] via-[#0D9488] to-[#14B8A6] p-8 shadow-xl">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-100">

                USER ADMINISTRATION

              </p>

              <h1 className="mt-3 text-4xl font-bold text-white">

                User Management

              </h1>

              <p className="mt-3 max-w-2xl text-lg text-teal-100">

                Manage regulators, manufacturers,
                distributors and pharmacies
                across PharmaGuard AI.

              </p>

            </div>

            <Button
              className="bg-white !text-[#0F766E] hover:bg-slate-100"
              onClick={() =>
                setOpenCreate(true)
              }
            >

              ＋ Create User

            </Button>

          </div>

        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">

          <Card className="border-l-4 border-teal-600">

            <p className="text-sm text-slate-500">

              Total Users

            </p>

            <h2 className="mt-3 text-4xl font-bold">

              {users.length}

            </h2>

          </Card>

          <Card className="border-l-4 border-green-600">

            <p className="text-sm text-slate-500">

              Active

            </p>

            <h2 className="mt-3 text-4xl font-bold text-green-600">

              {activeUsers}

            </h2>

          </Card>

          <Card className="border-l-4 border-blue-600">

            <p className="text-sm text-slate-500">

              Manufacturers

            </p>

            <h2 className="mt-3 text-4xl font-bold text-blue-600">

              {manufacturerUsers}

            </h2>

          </Card>

          <Card className="border-l-4 border-orange-500">

            <p className="text-sm text-slate-500">

              Distributors

            </p>

            <h2 className="mt-3 text-4xl font-bold text-orange-600">

              {distributorUsers}

            </h2>

          </Card>

          <Card className="border-l-4 border-purple-600">

            <p className="text-sm text-slate-500">

              Regulators

            </p>

            <h2 className="mt-3 text-4xl font-bold text-purple-600">

              {regulatorUsers}

            </h2>

          </Card>

        </div>

        <Input
          placeholder="Search by name, email or role..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value,
            )
          }
        />

        <Card className="overflow-hidden p-0">

          <div className="max-h-[650px] overflow-y-auto">

            <table className="w-full">

              <thead className="sticky top-0 bg-slate-100 z-10">

                <tr>

                  <th className="px-6 py-4 text-left">

                    Name

                  </th>

                  <th className="px-6 py-4 text-left">

                    Email

                  </th>

                  <th className="px-6 py-4 text-left">

                    Role

                  </th>

                  <th className="px-6 py-4 text-left">

                    Status

                  </th>

                  <th className="px-6 py-4 text-left">

                    Organization

                  </th>

                  <th className="px-6 py-4 text-left">

                    Actions

                  </th>

                </tr>

              </thead>

              <tbody>
                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-20 text-center"
                    >
                      <div className="text-6xl">👥</div>
                      <h3 className="mt-5 text-2xl font-bold">No Users Found</h3>
                      <p className="mt-2 text-slate-500">
                        Try changing your search keywords.
                      </p>
                    </td>
                  </tr>
                )}

                {filteredUsers.map(user => (
                  <tr
                    key={user.id}
                    className="border-t transition hover:bg-teal-50"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-700">
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{user.fullName}</p>
                          <p className="text-sm text-slate-500">{user.phone}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">{user.email}</td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          user.role === 'SUPER_ADMIN'
                            ? 'bg-purple-100 text-purple-700'
                            : user.role === 'REGULATOR'
                            ? 'bg-red-100 text-red-700'
                            : user.role === 'MANUFACTURER'
                            ? 'bg-blue-100 text-blue-700'
                            : user.role === 'DISTRIBUTOR'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          user.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : user.status === 'INACTIVE'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="px-6 py-5">{user.organizationName || '-'}</td>

                    <td className="px-6 py-5">
                      <Button
                        variant="primary"
                        className="px-4 py-2"
                        onClick={() => setSelectedUser(user)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <UserDetailsDrawer
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdated={loadUsers}
        />

        <CreateUserModal
          open={openCreate}
          onClose={() =>
            setOpenCreate(
              false,
            )
          }
          onCreated={
            loadUsers
          }
        />

      </div>

    </DashboardLayout>

  );

}