import {
  useEffect,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  Activity,
  Bell,
  Boxes,
  Package,
  ShieldAlert,
  ShieldCheck,
  Warehouse,
} from 'lucide-react';

import DashboardLayout
from '../components/layout/DashboardLayout';

import Card
from '../components/ui/Card';

import {
  dashboardService,
} from '../services/dashboardService';

import type {
  DashboardSummary,
} from '../types/dashboard';

export default function Dashboard() {

  const [

    summary,

    setSummary,

  ] =
  useState<DashboardSummary | null>(
    null,
  );

  const navigate = useNavigate();

  useEffect(() => {

    async function load() {

      const data =
        await dashboardService
          .getSummary();

      setSummary(data);

    }

    load();

  }, []);

  if (!summary) {

    return (

      <DashboardLayout>

        <div className="flex h-96 items-center justify-center">

          <div className="text-slate-500 text-lg">

            Loading Dashboard...

          </div>

        </div>

      </DashboardLayout>

    );

  }

  return (

<DashboardLayout>

<div className="space-y-8">

<div
className="
rounded-3xl
bg-gradient-to-r
from-teal-700
via-cyan-700
to-sky-700
text-white
p-10
shadow-xl
"
>

<h1 className="text-4xl font-bold">

Welcome Back 👋

</h1>

<p className="mt-3 text-lg text-cyan-100">

PharmaGuard AI Enterprise Dashboard

</p>

</div>

<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

<Card>

<div className="flex items-center justify-between">

<div>

<p className="text-slate-500">

Total Batches

</p>

<h2 className="mt-3 text-4xl font-bold">

{summary.totalBatches}

</h2>

</div>

<div className="rounded-2xl bg-blue-100 p-4">

<Package
size={34}
className="text-blue-700"
/>

</div>

</div>

</Card>

<Card>

<div className="flex items-center justify-between">

<div>

<p className="text-slate-500">

Inventory

</p>

<h2 className="mt-3 text-4xl font-bold">

{summary.inventoryUnits}

</h2>

</div>

<div className="rounded-2xl bg-emerald-100 p-4">

<Warehouse
size={34}
className="text-emerald-700"
/>

</div>

</div>

</Card>

<Card>

<div className="flex items-center justify-between">

<div>

<p className="text-slate-500">

Active Batches

</p>

<h2 className="mt-3 text-4xl font-bold text-green-600">

{summary.activeBatches}

</h2>

</div>

<div className="rounded-2xl bg-green-100 p-4">

<Boxes
size={34}
className="text-green-700"
/>

</div>

</div>

</Card>

<Card>

<div className="flex items-center justify-between">

<div>

<p className="text-slate-500">

Active Recalls

</p>

<h2 className="mt-3 text-4xl font-bold text-amber-600">

{summary.activeRecalls}

</h2>

</div>

<div className="rounded-2xl bg-amber-100 p-4">

<ShieldAlert
size={34}
className="text-amber-700"
/>

</div>

</div>

</Card>

<Card>

<div className="flex items-center justify-between">

<div>

<p className="text-slate-500">

Notifications

</p>

<h2 className="mt-3 text-4xl font-bold text-cyan-700">

{summary.notifications}

</h2>

</div>

<div className="rounded-2xl bg-cyan-100 p-4">

<Bell
size={34}
className="text-cyan-700"
/>

</div>

</div>

</Card>

<Card>

<div className="flex items-center justify-between">

<div>

<p className="text-slate-500">

Revoked

</p>

<h2 className="mt-3 text-4xl font-bold text-red-600">

{summary.revokedBatches}

</h2>

</div>

<div className="rounded-2xl bg-red-100 p-4">

<Activity
size={34}
className="text-red-700"
/>

</div>

</div>

</Card>

</div>

<div className="grid gap-6 xl:grid-cols-2">

<Card>

<h2 className="text-xl font-bold">

Quick Actions

</h2>

<div className="mt-6 grid grid-cols-2 gap-4">

<button
  onClick={() =>
    navigate('/inventory')
  }
  className="rounded-xl bg-teal-600 py-4 font-semibold text-white hover:bg-teal-700"
>
  Manage Inventory
</button>

<button
  onClick={() =>
    navigate('/transfers')
  }
  className="rounded-xl bg-blue-600 py-4 font-semibold text-white hover:bg-blue-700"
>
  View Transfers
</button>

<button
  onClick={() =>
    navigate('/recalls')
  }
  className="rounded-xl bg-amber-500 py-4 font-semibold text-white hover:bg-amber-600"
>
  Recall Center
</button>

<button
  onClick={() =>
    navigate('/blockchain')
  }
  className="rounded-xl bg-emerald-600 py-4 font-semibold text-white hover:bg-emerald-700"
>
  Blockchain
</button>

</div>

</Card>

<Card>

<h2 className="text-xl font-bold">

System Status

</h2>

<div className="mt-6 space-y-4">

<div className="flex items-center justify-between">

<span>

Blockchain

</span>

<span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">

Online

</span>

</div>

<div className="flex items-center justify-between">

<span>

Inventory Service

</span>

<span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">

Healthy

</span>

</div>

<div className="flex items-center justify-between">

<span>

Notification Service

</span>

<span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">

Running

</span>

</div>

<div className="flex items-center justify-between">

<span>

Compliance Engine

</span>

<span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">

Ready

</span>

</div>

<ShieldCheck
size={70}
className="mx-auto mt-6 text-teal-600"
/>

</div>

</Card>

</div>

</div>

</DashboardLayout>

  );

}