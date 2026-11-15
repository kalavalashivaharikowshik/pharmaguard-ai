import {
  useEffect,
  useState,
} from 'react';

import {
  role,
} from '../auth/roles';

import DashboardLayout
  from '../components/layout/DashboardLayout';

import Card
  from '../components/ui/Card';

import Button
  from '../components/ui/Button';

import Input
  from '../components/ui/Input';

import {
  batchService,
} from '../services/batchService';

import type {
  Batch,
} from '../types/batch';

import BatchDetailsDrawer
  from '../components/batches/BatchDetailsDrawer';

import CreateBatchModal
  from '../components/batches/CreateBatchModal';

export default function Batches() {

  const [
    batches,
    setBatches,
  ] =
    useState<Batch[]>([]);

  const [
    search,
    setSearch,
  ] =
    useState('');

  const [
    open,
    setOpen,
  ] =
    useState(false);

  const [
    selectedBatch,
    setSelectedBatch,
  ] =
    useState<Batch | null>(
      null,
    );

  const userRole =
    role();

  const loadBatches =
    async () => {

      const data =
        await batchService
          .getAll();

      setBatches(
        data,
      );

    };

  useEffect(() => {

    loadBatches();

  }, []);

  const filtered =
    batches.filter(
      batch =>

        batch.drugName
          .toLowerCase()
          .includes(
            search.toLowerCase(),
          ) ||

        batch.batchNumber
          .toLowerCase()
          .includes(
            search.toLowerCase(),
          ),
    );

  const totalBatches =
    batches.length;

  const activeBatches =
    batches.filter(
      b => b.status === 'ACTIVE',
    ).length;

  const recalledBatches =
    batches.filter(
      b => b.status === 'RECALLED',
    ).length;

  const revokedBatches =
    batches.filter(
      b => b.status === 'REVOKED',
    ).length;

  function statusColor(
    status: string,
  ) {

    switch (status) {

      case 'ACTIVE':
        return 'bg-green-100 text-green-700';

      case 'RECALLED':
        return 'bg-orange-100 text-orange-700';

      case 'REVOKED':
        return 'bg-red-100 text-red-700';

      case 'EXPIRED':
        return 'bg-slate-200 text-slate-700';

      default:
        return 'bg-slate-100 text-slate-700';

    }

  }

  return (

    <DashboardLayout>

      <div className="space-y-8">

        <div className="rounded-3xl bg-gradient-to-r from-[#0F4C81] via-[#155A94] to-[#2E8B57] p-8 text-white shadow-xl">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h1 className="text-4xl font-bold">

                Batch Management

              </h1>

              <p className="mt-2 text-teal-100">

                Manage pharmaceutical batches across the supply chain

              </p>

            </div>

            {userRole === 'MANUFACTURER' && (

              <Button
                variant="light"
                onClick={() =>
                    setOpen(true)
                }
                >
                ＋ Create Batch
              </Button>

            )}

          </div>

        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <Card>

            <p className="text-sm text-slate-500">

              Total Batches

            </p>

            <p className="mt-3 text-4xl font-bold">

              {totalBatches}

            </p>

          </Card>

          <Card>

            <p className="text-sm text-slate-500">

              Active

            </p>

            <p className="mt-3 text-4xl font-bold text-green-600">

              {activeBatches}

            </p>

          </Card>

          <Card>

            <p className="text-sm text-slate-500">

              Recalled

            </p>

            <p className="mt-3 text-4xl font-bold text-orange-500">

              {recalledBatches}

            </p>

          </Card>

          <Card>

            <p className="text-sm text-slate-500">

              Revoked

            </p>

            <p className="mt-3 text-4xl font-bold text-red-600">

              {revokedBatches}

            </p>

          </Card>

        </div>

        <Input
          placeholder="Search by medicine or batch number..."
          value={search}
          onChange={e =>
            setSearch(
              e.target.value,
            )
          }
        />

        <Card className="p-0 overflow-hidden">

          <div className="max-h-[600px] overflow-y-auto">

            <table className="w-full">

              <thead className="sticky top-0 bg-slate-50 z-10">

                <tr>

                  <th className="p-4 text-left">

                    Drug

                  </th>

                  <th className="p-4 text-left">

                    Batch

                  </th>

                  <th className="p-4 text-left">

                    Manufacturer

                  </th>

                  <th className="p-4 text-left">

                    Quantity

                  </th>

                  <th className="p-4 text-left">

                    Status

                  </th>

                  <th className="p-4 text-left">

                    QR

                  </th>

                  <th className="p-4 text-left">

                    Blockchain

                  </th>

                  <th className="p-4 text-left">

                    Actions

                  </th>

                </tr>

              </thead>

              <tbody>

                {filtered.length === 0 && (

                  <tr>

                    <td
                      colSpan={8}
                      className="py-24 text-center"
                    >

                      <div className="space-y-4">

                        <div className="text-6xl">

                          💊

                        </div>

                        <h3 className="text-2xl font-semibold">

                          No Batches Found

                        </h3>

                        <p className="text-slate-500">

                          No pharmaceutical batches match your search.

                        </p>

                      </div>

                    </td>

                  </tr>

                )}

                {filtered.map(
                  (batch) => (

                    <tr
                      key={batch.id}
                      className="border-t hover:bg-slate-50 transition-colors duration-200"
                    >                      <td className="p-4">
                        {batch.drugName}
                      </td>

                      <td className="p-4">
                        {batch.batchNumber}
                      </td>

                      <td className="p-4">
                        {batch.manufacturer.name}
                      </td>

                      <td className="p-4">
                        {batch.quantity}
                      </td>

                      <td className="p-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColor(
                            batch.status,
                          )}`}
                        >
                          {batch.status}
                        </span>

                      </td>

                      <td className="p-4">

                        <span className="text-xl">
                          {batch.qrCode ? '✔️' : '—'}
                        </span>

                      </td>

                      <td className="p-4">

                        <span className="text-xl">
                          {batch.blockchainHash ? '🔗' : '—'}
                        </span>

                      </td>

                      <td className="p-4">

                        <button
                          onClick={() =>
                            setSelectedBatch(
                              batch,
                            )
                          }
                          className="rounded-lg bg-teal-600 px-4 py-2 text-white transition hover:bg-teal-700"
                        >
                          View
                        </button>

                      </td>

                    </tr>

                  ),
                )}

              </tbody>

            </table>

          </div>

        </Card>

        {userRole === 'MANUFACTURER' && (

          <CreateBatchModal
            open={open}
            onClose={() =>
              setOpen(false)
            }
            onCreated={
              loadBatches
            }
          />

        )}

        <BatchDetailsDrawer
          batch={selectedBatch}
          onClose={() =>
            setSelectedBatch(
              null,
            )
          }
        />

      </div>

    </DashboardLayout>

  );

}