import {
  useEffect,
  useState,
} from 'react';

import DashboardLayout
  from '../components/layout/DashboardLayout';

import Card
  from '../components/ui/Card';

import {
  recallService,
} from '../services/recallService';

import type {
  Recall,
} from '../types/recall';

import RecallDetailsDrawer
  from '../components/recalls/RecallDetailsDrawer';

export default function Recalls() {

  const [
    recalls,
    setRecalls,
  ] =
    useState<Recall[]>([]);

  const [
    selectedRecall,
    setSelectedRecall,
  ] =
    useState<Recall | null>(
      null,
    );

  const totalRecalls =
    recalls.length;

  const activeRecalls =
    recalls.filter(
      r => r.status === 'ACTIVE',
    ).length;

  const criticalRecalls =
    recalls.filter(
      r => r.severity === 'CRITICAL',
    ).length;

  const affectedBatches =
    new Set(
      recalls.map(
        r => r.batch.batchNumber,
      ),
    ).size;

  const getSeverityColor = (
    severity: string,
  ) => {

    switch (severity) {

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

  function getStatusColor(
    status: string,
  ) {

    switch (status) {

      case 'ACTIVE':
        return 'bg-red-100 text-red-700';

      case 'COMPLETED':
        return 'bg-green-100 text-green-700';

      default:
        return 'bg-slate-100 text-slate-700';

    }

  }

  useEffect(() => {

    const load =
      async () => {

        const data =
          await recallService
            .getAll();

        setRecalls(
          data,
        );

      };

    load();

  }, []);

  return (

    <DashboardLayout>

      <div className="space-y-8">

        <div className="rounded-3xl bg-gradient-to-r from-[#0F766E] via-[#0D9488] to-[#14B8A6] p-8 text-white shadow-xl">

          <h1 className="text-4xl font-bold">

            Recall Management

          </h1>

          <p className="mt-2 text-teal-100">

            Monitor pharmaceutical recalls and safety alerts

          </p>

        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <Card>

            <p className="text-sm text-slate-500">

              Total Recalls

            </p>

            <h2 className="mt-3 text-4xl font-bold text-slate-900">

              {totalRecalls}

            </h2>

          </Card>

          <Card>

            <p className="text-sm text-slate-500">

              Active Recalls

            </p>

            <h2 className="mt-3 text-4xl font-bold text-red-600">

              {activeRecalls}

            </h2>

          </Card>

          <Card>

            <p className="text-sm text-slate-500">

              Critical Recalls

            </p>

            <h2 className="mt-3 text-4xl font-bold text-orange-600">

              {criticalRecalls}

            </h2>

          </Card>

          <Card>

            <p className="text-sm text-slate-500">

              Affected Batches

            </p>

            <h2 className="mt-3 text-4xl font-bold text-teal-600">

              {affectedBatches}

            </h2>

          </Card>

        </div>

        <Card className="p-0 overflow-hidden">

          <div className="max-h-[600px] overflow-y-auto">

            <table className="w-full">

              <thead className="sticky top-0 z-10 bg-slate-50">

                <tr>

                  <th className="p-4 text-left">

                    Recall

                  </th>

                  <th className="p-4 text-left">

                    Drug

                  </th>

                  <th className="p-4 text-left">

                    Severity

                  </th>

                  <th className="p-4 text-left">

                    Status

                  </th>

                  <th className="p-4 text-left">

                    Reason

                  </th>

                  <th className="p-4 text-left">

                    Actions

                  </th>

                </tr>

              </thead>

              <tbody>

                {recalls.length === 0 && (

                  <tr>

                    <td
                      colSpan={6}
                      className="py-24 text-center"
                    >

                      <div className="space-y-4">

                        <div className="text-6xl">

                          🛡️

                        </div>

                        <h3 className="text-2xl font-semibold">

                          No Recall Records

                        </h3>

                        <p className="text-slate-500">

                          There are currently no pharmaceutical recalls.

                        </p>

                      </div>

                    </td>

                  </tr>

                )}

                {recalls.map(
                  recall => (

                    <tr
                      key={recall.id}
                      className="border-t hover:bg-slate-50 transition-colors duration-200"
                    >
                                          <td className="p-4">
                        {recall.recallNumber}
                      </td>

                      <td className="p-4">
                        {recall.batch.drugName}
                      </td>

                      <td className="p-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getSeverityColor(
                            recall.severity,
                          )}`}
                        >
                          {recall.severity}
                        </span>

                      </td>

                      <td className="p-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                            recall.status,
                          )}`}
                        >
                          {recall.status}
                        </span>

                      </td>

                      <td className="p-4 max-w-sm">
                        {recall.reason}
                      </td>

                      <td className="p-4">

                        <button
                          onClick={() =>
                            setSelectedRecall(
                              recall,
                            )
                          }
                          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
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

        <RecallDetailsDrawer
          recall={selectedRecall}
          onClose={() =>
            setSelectedRecall(
              null,
            )
          }
        />

      </div>

    </DashboardLayout>

  );

}