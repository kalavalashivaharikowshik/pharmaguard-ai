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

import {
  registrationService,
} from '../services/registrationService';

import type {
  Registration,
} from '../types/registration';

import RegistrationDetailsDrawer
  from '../components/registration/RegistrationDetailsDrawer';

export default function RegistrationRequests() {

  const [
    registrations,
    setRegistrations,
  ] =
    useState<Registration[]>([]);

  const [
    search,
    setSearch,
  ] =
    useState('');

  const [
    selectedRegistration,
    setSelectedRegistration,
  ] =
    useState<Registration | null>(
      null,
    );

  const load =
    async () => {

      const data =
        await registrationService
          .getAll();

      setRegistrations(
        data,
      );

    };

  useEffect(() => {

    load();

  }, []);

  const filtered =
    registrations.filter(
      registration =>

        registration.organizationName
          .toLowerCase()
          .includes(
            search.toLowerCase(),
          ) ||

        registration.contactPerson
          .toLowerCase()
          .includes(
            search.toLowerCase(),
          ) ||

        registration.role
          .toLowerCase()
          .includes(
            search.toLowerCase(),
          ),
    );

  const pendingRequests =
    registrations.filter(
      registration =>
        registration.status ===
        'PENDING',
    ).length;

  const approvedRequests =
    registrations.filter(
      registration =>
        registration.status ===
        'APPROVED',
    ).length;

  const rejectedRequests =
    registrations.filter(
      registration =>
        registration.status ===
        'REJECTED',
    ).length;

  return (

    <DashboardLayout>

      <div className="space-y-8">

        <div className="rounded-3xl bg-gradient-to-r from-[#0F766E] via-[#0D9488] to-[#14B8A6] p-8 shadow-xl">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-100">

                ORGANIZATION APPROVAL

              </p>

              <h1 className="mt-3 text-4xl font-bold text-white">

                Registration Requests

              </h1>

              <p className="mt-3 max-w-3xl text-lg text-teal-100">

                Review, approve and manage organization onboarding
                requests across the PharmaGuard AI platform.

              </p>

            </div>

            <div className="rounded-2xl bg-white/20 px-6 py-4 text-center backdrop-blur">

              <p className="text-sm text-teal-100">

                Pending Requests

              </p>

              <p className="mt-2 text-4xl font-bold text-white">

                {pendingRequests}

              </p>

            </div>

          </div>

        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

          <Card className="border-l-4 border-teal-600">

            <p className="text-sm text-slate-500">

              Total Requests

            </p>

            <h2 className="mt-3 text-4xl font-bold">

              {registrations.length}

            </h2>

          </Card>

          <Card className="border-l-4 border-yellow-500">

            <p className="text-sm text-slate-500">

              Pending

            </p>

            <h2 className="mt-3 text-4xl font-bold text-yellow-600">

              {pendingRequests}

            </h2>

          </Card>

          <Card className="border-l-4 border-green-600">

            <p className="text-sm text-slate-500">

              Approved

            </p>

            <h2 className="mt-3 text-4xl font-bold text-green-600">

              {approvedRequests}

            </h2>

          </Card>

          <Card className="border-l-4 border-red-600">

            <p className="text-sm text-slate-500">

              Rejected

            </p>

            <h2 className="mt-3 text-4xl font-bold text-red-600">

              {rejectedRequests}

            </h2>

          </Card>

        </div>

        <Input
          placeholder="Search organization, contact or role..."
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

                    Organization

                  </th>

                  <th className="px-6 py-4 text-left">

                    Contact

                  </th>

                  <th className="px-6 py-4 text-left">

                    Role

                  </th>

                  <th className="px-6 py-4 text-left">

                    Status

                  </th>

                  <th className="px-6 py-4 text-left">

                    Submitted

                  </th>

                  <th className="px-6 py-4 text-left">

                    Action

                  </th>

                </tr>

              </thead>

              <tbody>
                            {filtered.length === 0 && (

                  <tr>

                    <td
                      colSpan={6}
                      className="py-20 text-center"
                    >

                      <div className="text-6xl">

                        📋

                      </div>

                      <h3 className="mt-5 text-2xl font-bold">

                        No Registration Requests

                      </h3>

                      <p className="mt-2 text-slate-500">

                        No organizations match your current search.

                      </p>

                    </td>

                  </tr>

                )}

                {filtered.map(
                  registration => (

                    <tr
                      key={registration.id}
                      className="border-t transition hover:bg-teal-50"
                    >

                      <td className="px-6 py-5">

                        <div>

                          <p className="font-semibold text-slate-800">

                            {registration.organizationName}

                          </p>

                          <p className="text-sm text-slate-500">

                            Organization

                          </p>

                        </div>

                      </td>

                      <td className="px-6 py-5">

                        <div>

                          <p className="font-semibold">

                            {registration.contactPerson}

                          </p>

                          <p className="text-sm text-slate-500">

                            Primary Contact

                          </p>

                        </div>

                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            registration.role === 'REGULATOR'
                              ? 'bg-red-100 text-red-700'
                              : registration.role === 'MANUFACTURER'
                              ? 'bg-blue-100 text-blue-700'
                              : registration.role === 'DISTRIBUTOR'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >

                          {registration.role}

                        </span>

                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            registration.status === 'APPROVED'
                              ? 'bg-green-100 text-green-700'
                              : registration.status === 'REJECTED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >

                          {registration.status}

                        </span>

                      </td>

                      <td className="px-6 py-5">

                        {new Date(
                          registration.createdAt,
                        ).toLocaleDateString()}

                      </td>

                      <td className="px-6 py-5">

                        <Button
                          className="px-4 py-2"
                          onClick={() =>
                            setSelectedRegistration(
                              registration,
                            )
                          }
                        >

                          Review

                        </Button>

                      </td>

                    </tr>

                  ),
                )}

              </tbody>

            </table>

          </div>

        </Card>

        </div>

        <RegistrationDetailsDrawer
          registration={
            selectedRegistration
          }
          onClose={() =>
            setSelectedRegistration(
              null,
            )
          }
          onUpdated={
            load
          }
        />

    </DashboardLayout>

  );

}