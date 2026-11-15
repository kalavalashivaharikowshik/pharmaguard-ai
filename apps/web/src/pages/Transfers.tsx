import { useEffect, useState } from 'react';

import { role } from '../auth/roles';

import DashboardLayout
  from '../components/layout/DashboardLayout';

import CreateTransferModal
  from '../components/transfers/CreateTransferModal';

import Card
  from '../components/ui/Card';

import Input
  from '../components/ui/Input';

import Button
  from '../components/ui/Button';

import {
  transferService,
} from '../services/transferService';

import type {
  Transfer,
} from '../types/transfer';

export default function Transfers() {

  const [
    transfers,
    setTransfers,
  ] =
    useState<Transfer[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    search,
    setSearch,
  ] =
    useState('');

  const userRole =
    role();

  const [
    openTransfer,
    setOpenTransfer,
  ] =
    useState(false);

  useEffect(() => {

    const load =
      async () => {

        try {

          const data =
            await transferService
              .getAll();

          setTransfers(
            data,
          );

        } finally {

          setLoading(
            false,
          );

        }

      };

    load();

  }, []);

  if (loading) {

    return (

      <DashboardLayout>

        <div className="flex h-96 items-center justify-center">

          <div className="text-lg font-medium text-slate-500">
            Loading transfers...
          </div>

        </div>

      </DashboardLayout>

    );

  }

  const getTransferStatusColor = (
    status: string,
  ) => {

    switch (status) {

      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';

      case 'IN_TRANSIT':
        return 'bg-blue-100 text-blue-700';

      case 'COMPLETED':
        return 'bg-green-100 text-green-700';

      case 'CANCELLED':
        return 'bg-red-100 text-red-700';

      default:
        return 'bg-slate-100 text-slate-700';

    }

  };

  const totalTransfers =
    transfers.length;

  const pendingTransfers =
    transfers.filter(
      t => t.status === 'PENDING',
    ).length;

  const transitTransfers =
    transfers.filter(
      t => t.status === 'IN_TRANSIT',
    ).length;

  const completedTransfers =
    transfers.filter(
      t => t.status === 'COMPLETED',
    ).length;

  const filteredTransfers =
    transfers.filter(
      transfer =>
        transfer.batch.batchNumber
          .toLowerCase()
          .includes(
            search.toLowerCase(),
          ) ||

        transfer.batch.drugName
          .toLowerCase()
          .includes(
            search.toLowerCase(),
          ),
    );

  return (

    <DashboardLayout>

      <div className="space-y-8">

        <div className="rounded-3xl bg-gradient-to-r from-[#0F4C81] via-[#155A94] to-[#2E8B57] p-8 text-white shadow-lg">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h1 className="text-4xl font-bold">

                Transfer Management

              </h1>

              <p className="mt-2 text-teal-100">

                Manage pharmaceutical supply chain transfers.

              </p>

            </div>

            {(userRole === 'MANUFACTURER' ||
              userRole === 'DISTRIBUTOR') && (

              <Button
                variant="light"
                onClick={() =>
                  setOpenTransfer(true)
                }
              >
                ＋ New Transfer
              </Button>
            )}

          </div>

        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <Card>

            <p className="text-sm text-slate-500">
              Total Transfers
            </p>

            <p className="mt-3 text-4xl font-bold text-slate-900">
              {totalTransfers}
            </p>

          </Card>

          <Card>

            <p className="text-sm text-slate-500">
              Pending
            </p>

            <p className="mt-3 text-4xl font-bold text-yellow-600">
              {pendingTransfers}
            </p>

          </Card>

          <Card>

            <p className="text-sm text-slate-500">
              In Transit
            </p>

            <p className="mt-3 text-4xl font-bold text-blue-600">
              {transitTransfers}
            </p>

          </Card>

          <Card>

            <p className="text-sm text-slate-500">
              Completed
            </p>

            <p className="mt-3 text-4xl font-bold text-green-600">
              {completedTransfers}
            </p>

          </Card>

        </div>

        <Card>

          <div className="mb-6">

            <Input
              placeholder="Search by batch number or medicine..."
              value={search}
              onChange={e =>
                setSearch(
                  e.target.value,
                )
              }
            />

          </div>

          <div className="max-h-[600px] overflow-y-auto">

            <table className="w-full">

              <thead className="sticky top-0 z-10 bg-white">

                <tr className="border-b border-slate-200">

                  <th className="p-3 text-left font-semibold">
                    Batch
                  </th>

                  <th className="p-3 text-left font-semibold">
                    Drug
                  </th>

                  <th className="p-3 text-left font-semibold">
                    From
                  </th>

                  <th className="p-3 text-left font-semibold">
                    To
                  </th>

                  <th className="p-3 text-left font-semibold">
                    Quantity
                  </th>

                  <th className="p-3 text-left font-semibold">
                    Status
                  </th>

                  <th className="p-3 text-left font-semibold">
                    Date
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredTransfers.length === 0 && (

                  <tr>

                    <td
                      colSpan={7}
                      className="py-24 text-center"
                    >

                      <div className="space-y-3">

                        <div className="text-6xl">

                          🚚

                        </div>

                        <h3 className="text-2xl font-semibold">

                          No Transfers Found

                        </h3>

                        <p className="text-slate-500">

                          Try changing your search.

                        </p>

                      </div>

                    </td>

                  </tr>

                )}

                {filteredTransfers.map(
                  (transfer) => (

                    <tr
                      key={transfer.id}
                      className="border-b hover:bg-slate-50 transition-colors duration-200"
                    >                      <td className="p-3">
                        {transfer.batch.batchNumber}
                      </td>

                      <td className="p-3">
                        {transfer.batch.drugName}
                      </td>

                      <td className="p-3">
                        {transfer.fromUser.fullName}
                      </td>

                      <td className="p-3">
                        {transfer.toUser.fullName}
                      </td>

                      <td className="p-3">
                        {transfer.quantity}
                      </td>

                      <td className="p-3">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getTransferStatusColor(
                            transfer.status,
                          )}`}
                        >
                          {transfer.status}
                        </span>

                      </td>

                      <td className="p-3 whitespace-nowrap">
                        {new Date(
                          transfer.createdAt,
                        ).toLocaleDateString()}
                      </td>

                    </tr>

                  ),
                )}

              </tbody>

            </table>

          </div>

        </Card>

      </div>

      <CreateTransferModal
        open={openTransfer}
        onClose={() =>
          setOpenTransfer(false)
        }
        onCreated={async () => {

          const data =
            await transferService.getAll();

          setTransfers(
            data,
          );

        }}
      />

    </DashboardLayout>

  );

}