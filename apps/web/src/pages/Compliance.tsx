import {
  useEffect,
  useState,
} from 'react';

import {
  toast,
} from 'react-hot-toast';

import DashboardLayout
  from '../components/layout/DashboardLayout';

import Card
  from '../components/ui/Card';

import Button
  from '../components/ui/Button';

import {
  complianceService,
} from '../services/complianceService';

import type {
  ComplianceSummary,
  ComplianceRecall,
  ComplianceTransfer,
  ComplianceExpiry,
} from '../types/compliance';

export default function Compliance() {

  const [
    summary,
    setSummary,
  ] =
    useState<ComplianceSummary | null>(
      null,
    );

  const [
    recalls,
    setRecalls,
  ] =
    useState<ComplianceRecall[]>([]);

  const [
    transfers,
    setTransfers,
  ] =
    useState<ComplianceTransfer[]>([]);

  const [
    expiry,
    setExpiry,
  ] =
    useState<ComplianceExpiry[]>([]);

  const [
    activeTab,
    setActiveTab,
  ] = useState<
    'recalls' |
    'transfers' |
    'expiry'
  >(
    'recalls',
  );

  useEffect(() => {

    const load =
      async () => {

        const s =
          await complianceService
            .getSummary();

        const r =
          await complianceService
            .getRecalls();

        const t =
          await complianceService
            .getTransfers();

        const e =
          await complianceService
            .getExpiry();

        setSummary(s);
        setRecalls(r);
        setTransfers(t);
        setExpiry(e);

      };

    load();

  }, []);

  if (!summary) {

    return (
      <div>
        Loading...
      </div>
    );

  }

  const exportPdf =
    async () => {

      try {

        const pdf =
          await complianceService.exportPdf();

        const url =
          window.URL.createObjectURL(
            new Blob([pdf]),
          );

        const link =
          document.createElement('a');

        link.href = url;

        link.download =
          'Compliance_Report.pdf';

        document.body.appendChild(
          link,
        );

        link.click();

        link.remove();

        window.URL.revokeObjectURL(
          url,
        );

      } catch {

        toast.error(
          'Unable to export PDF',
        );

      }

    };

  return (

    <DashboardLayout>

      <div className="space-y-8">

        {/* Hero */}

        <div className="rounded-3xl bg-gradient-to-r from-[#0F4C81] via-[#155A94] to-[#2E8B57] p-8 text-white shadow-xl">

          <div className="flex items-center justify-between">

            <div>

              <h1 className="text-4xl font-bold">
                Compliance Reports
              </h1>

              <p className="mt-2 text-teal-100">
                Regulatory monitoring, pharmaceutical safety and audit reporting
              </p>

            </div>

            <div className="flex gap-3">

              <Button
                variant="light"
                onClick={exportPdf}
              >
                Export PDF
              </Button>

              <Button>
                Export CSV
              </Button>

            </div>

          </div>

        </div>

        {/* KPI */}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">

          <Card>

            <p className="text-sm text-slate-500">
              Total Batches
            </p>

            <p className="mt-3 text-4xl font-bold">
              {summary.totalBatches}
            </p>

          </Card>

          <Card>

            <p className="text-sm text-slate-500">
              Active
            </p>

            <p className="mt-3 text-4xl font-bold text-green-600">
              {summary.activeBatches}
            </p>

          </Card>

          <Card>

            <p className="text-sm text-slate-500">
              Recalled
            </p>

            <p className="mt-3 text-4xl font-bold text-red-600">
              {summary.recalledBatches}
            </p>

          </Card>

          <Card>

            <p className="text-sm text-slate-500">
              Transfers
            </p>

            <p className="mt-3 text-4xl font-bold text-blue-600">
              {summary.totalTransfers}
            </p>

          </Card>

          <Card>

            <p className="text-sm text-slate-500">
              Recalls
            </p>

            <p className="mt-3 text-4xl font-bold text-orange-600">
              {summary.totalRecalls}
            </p>

          </Card>

        </div>

        {/* Tabs */}

        <div className="flex flex-wrap gap-3">

          <button
            onClick={() =>
              setActiveTab('recalls')
            }
            className={`rounded-xl px-6 py-3 font-semibold transition ${
              activeTab === 'recalls'
                ? 'bg-teal-600 text-white shadow'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Recall Report
          </button>

          <button
            onClick={() =>
              setActiveTab('transfers')
            }
            className={`rounded-xl px-6 py-3 font-semibold transition ${
              activeTab === 'transfers'
                ? 'bg-teal-600 text-white shadow'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Transfer Report
          </button>

          <button
            onClick={() =>
              setActiveTab('expiry')
            }
            className={`rounded-xl px-6 py-3 font-semibold transition ${
              activeTab === 'expiry'
                ? 'bg-teal-600 text-white shadow'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Expiry Report
          </button>

        </div>

        {/* RECALL REPORT */}

        {activeTab === 'recalls' && (

          <Card className="overflow-hidden p-0">

            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-5">

              <div>

                <h2 className="text-xl font-bold text-slate-800">
                  Recall Report
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Active pharmaceutical recalls across the network
                </p>

              </div>

              <div className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
                {recalls.length} Records
              </div>

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead className="sticky top-0 bg-slate-100">

                  <tr>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Recall
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Drug
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Severity
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {recalls.length === 0 && (

                    <tr>

                      <td
                        colSpan={4}
                        className="py-16 text-center"
                      >

                        <div className="text-6xl">
                          🚨
                        </div>

                        <h3 className="mt-5 text-xl font-bold text-slate-800">
                          No Recall Reports
                        </h3>

                        <p className="mt-2 text-slate-500">
                          There are currently no recall records available.
                        </p>

                      </td>

                    </tr>

                  )}

                  {recalls.map((recall, index) => (

                    <tr
                      key={recall.id}
                      className={`transition hover:bg-teal-50 ${
                        index % 2 === 0
                          ? 'bg-white'
                          : 'bg-slate-50/40'
                      }`}
                    >

                      <td className="px-6 py-5 font-semibold text-slate-800">
                        {recall.recallNumber}
                      </td>

                      <td className="px-6 py-5">

                        <div>

                          <p className="font-semibold text-slate-800">
                            {recall.batch.drugName}
                          </p>

                          <p className="text-sm text-slate-500">
                            {recall.batch.batchNumber}
                          </p>

                        </div>

                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            recall.severity === 'CRITICAL'
                              ? 'bg-red-100 text-red-700'
                              : recall.severity === 'HIGH'
                              ? 'bg-orange-100 text-orange-700'
                              : recall.severity === 'MEDIUM'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {recall.severity}
                        </span>

                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            recall.status === 'ACTIVE'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {recall.status}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </Card>

        )}

        {/* TRANSFER REPORT */}

              {/* RECALL REPORT */}

        {activeTab === 'recalls' && (

          <Card className="overflow-hidden p-0">

            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-5">

              <div>

                <h2 className="text-xl font-bold text-slate-800">
                  Recall Report
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Active pharmaceutical recalls across the network
                </p>

              </div>

              <div className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
                {recalls.length} Records
              </div>

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead className="sticky top-0 bg-slate-100">

                  <tr>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Recall
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Drug
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Severity
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {recalls.length === 0 && (

                    <tr>

                      <td
                        colSpan={4}
                        className="py-16 text-center"
                      >

                        <div className="text-6xl">
                          🚨
                        </div>

                        <h3 className="mt-5 text-xl font-bold text-slate-800">
                          No Recall Reports
                        </h3>

                        <p className="mt-2 text-slate-500">
                          There are currently no recall records available.
                        </p>

                      </td>

                    </tr>

                  )}

                  {recalls.map((recall, index) => (

                    <tr
                      key={recall.id}
                      className={`transition hover:bg-teal-50 ${
                        index % 2 === 0
                          ? 'bg-white'
                          : 'bg-slate-50/40'
                      }`}
                    >

                      <td className="px-6 py-5 font-semibold text-slate-800">
                        {recall.recallNumber}
                      </td>

                      <td className="px-6 py-5">

                        <div>

                          <p className="font-semibold text-slate-800">
                            {recall.batch.drugName}
                          </p>

                          <p className="text-sm text-slate-500">
                            {recall.batch.batchNumber}
                          </p>

                        </div>

                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            recall.severity === 'CRITICAL'
                              ? 'bg-red-100 text-red-700'
                              : recall.severity === 'HIGH'
                              ? 'bg-orange-100 text-orange-700'
                              : recall.severity === 'MEDIUM'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {recall.severity}
                        </span>

                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            recall.status === 'ACTIVE'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {recall.status}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </Card>

        )}

        {/* TRANSFER REPORT */}

        {activeTab === 'transfers' && (

          <Card className="overflow-hidden p-0">

            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-5">

              <div>

                <h2 className="text-xl font-bold text-slate-800">
                  Transfer Report
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Monitor pharmaceutical movement across the supply chain
                </p>

              </div>

              <div className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                {transfers.length} Records
              </div>

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead className="sticky top-0 bg-slate-100">

                  <tr>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Batch
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Drug
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Quantity
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {transfers.length === 0 && (

                    <tr>

                      <td
                        colSpan={4}
                        className="py-16 text-center"
                      >

                        <div className="text-6xl">
                          🚚
                        </div>

                        <h3 className="mt-5 text-xl font-bold text-slate-800">
                          No Transfer Records
                        </h3>

                        <p className="mt-2 text-slate-500">
                          No pharmaceutical transfers are currently available.
                        </p>

                      </td>

                    </tr>

                  )}

                  {transfers.map((transfer, index) => (

                    <tr
                      key={transfer.id}
                      className={`transition hover:bg-blue-50 ${
                        index % 2 === 0
                          ? 'bg-white'
                          : 'bg-slate-50/40'
                      }`}
                    >

                      <td className="px-6 py-5 font-semibold text-slate-800">
                        {transfer.batch.batchNumber}
                      </td>

                      <td className="px-6 py-5">

                        <div>

                          <p className="font-semibold text-slate-800">
                            {transfer.batch.drugName}
                          </p>

                          <p className="text-sm text-slate-500">
                            Supply Chain Transfer
                          </p>

                        </div>

                      </td>

                      <td className="px-6 py-5 font-semibold">
                        {transfer.quantity}
                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            transfer.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-700'
                              : transfer.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-700'
                              : transfer.status === 'IN_TRANSIT'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {transfer.status}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </Card>

        )}

                {/* EXPIRY REPORT */}

        {activeTab === 'expiry' && (

          <Card className="overflow-hidden p-0">

            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-5">

              <div>

                <h2 className="text-xl font-bold text-slate-800">
                  Expiry Report
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Medicines approaching expiry or already expired
                </p>

              </div>

              <div className="rounded-xl bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
                {expiry.length} Records
              </div>

            </div>

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead className="sticky top-0 bg-slate-100">

                  <tr>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Batch
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Drug
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Expiry Date
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Reason
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {expiry.length === 0 && (

                    <tr>

                      <td
                        colSpan={5}
                        className="py-16 text-center"
                      >

                        <div className="text-6xl">
                          📅
                        </div>

                        <h3 className="mt-5 text-xl font-bold text-slate-800">
                          No Expiry Records
                        </h3>

                        <p className="mt-2 text-slate-500">
                          No batches are approaching expiry.
                        </p>

                      </td>

                    </tr>

                  )}

                  {expiry.map((item, index) => (

                    <tr
                      key={item.id}
                      className={`transition hover:bg-amber-50 ${
                        index % 2 === 0
                          ? 'bg-white'
                          : 'bg-slate-50/40'
                      }`}
                    >

                      <td className="px-6 py-5 font-semibold text-slate-800">
                        {item.batchNumber}
                      </td>

                      <td className="px-6 py-5">

                        <div>

                          <p className="font-semibold text-slate-800">
                            {item.drugName}
                          </p>

                          <p className="text-sm text-slate-500">
                            Pharmaceutical Product
                          </p>

                        </div>

                      </td>

                      <td className="px-6 py-5">
                        {new Date(
                          item.expiryDate,
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.status === 'EXPIRED'
                              ? 'bg-red-100 text-red-700'
                              : item.status === 'EXPIRING'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {item.status}
                        </span>

                      </td>

                      <td className="px-6 py-5 text-slate-600">
                        {item.revocationReason ?? '—'}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </Card>

        )}

      </div>

    </DashboardLayout>

  );

}