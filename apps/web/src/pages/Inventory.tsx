import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import DashboardLayout
from '../components/layout/DashboardLayout';

import Card
from '../components/ui/Card';

import {
  Search,
  Boxes,
  ArrowLeftRight,
  Package,
  ShieldAlert,
} from 'lucide-react';

import {
  inventoryService,
} from '../services/inventoryService';

import {
  transferService,
} from '../services/transferService';

import type {
  Inventory,
} from '../types/inventory';

import type {
  Transfer,
} from '../types/transfer';

export default function InventoryPage() {

  const [
    inventory,
    setInventory,
  ] =
    useState<Inventory[]>([]);

  const [
    transfers,
    setTransfers,
  ] =
    useState<Transfer[]>([]);

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<'inventory' | 'transfers'>(
      'inventory',
    );

  const [
    search,
    setSearch,
  ] =
    useState('');

  useEffect(() => {

    async function load() {

      const inv =
        await inventoryService.getInventory();

      const trx =
        await transferService.getAll();

      setInventory(inv);

      setTransfers(trx);

    }

    load();

  }, []);

  const filteredInventory =
    useMemo(() => {

      return inventory.filter(item =>

        item.batch.drugName
          .toLowerCase()
          .includes(search.toLowerCase())

        ||

        item.batch.batchNumber
          .toLowerCase()
          .includes(search.toLowerCase())

      );

    }, [inventory, search]);

  const getBatchStatusColor = (
    status: string,
  ) => {

    switch (status) {

      case 'ACTIVE':
        return 'bg-green-100 text-green-700';

      case 'RECALLED':
        return 'bg-red-100 text-red-700';

      case 'EXPIRED':
        return 'bg-orange-100 text-orange-700';

      case 'REVOKED':
        return 'bg-purple-100 text-purple-700';

      default:
        return 'bg-slate-100 text-slate-700';

    }

  };

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

  return (

<DashboardLayout>

<div className="space-y-10">

<div
className="
rounded-3xl
bg-gradient-to-r
from-cyan-700
via-teal-700
to-emerald-700
p-10
text-white
shadow-xl
"
>

<h1 className="text-4xl font-bold">

Inventory Management

</h1>

<p className="mt-3 text-lg text-cyan-100">

Monitor inventory holdings and transfer history across the pharmaceutical supply chain.

</p>

</div>

<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

<Card>

<div className="flex justify-between">

<div>

<p className="text-slate-500">

Inventory Units

</p>

<h2 className="mt-3 text-4xl font-bold">

{

inventory.reduce(

(total,item)=>

total+item.quantity,

0,

)

}

</h2>

</div>

<div className="rounded-2xl bg-teal-100 p-4">

<Boxes
size={34}
className="text-teal-700"
/>

</div>

</div>

</Card>

<Card>

<div className="flex justify-between">

<div>

<p className="text-slate-500">

Transfers

</p>

<h2 className="mt-3 text-4xl font-bold">

{transfers.length}

</h2>

</div>

<div className="rounded-2xl bg-blue-100 p-4">

<ArrowLeftRight
size={34}
className="text-blue-700"
/>

</div>

</div>

</Card>

<Card>

<div className="flex justify-between">

<div>

<p className="text-slate-500">

Active Batches

</p>

<h2 className="mt-3 text-4xl font-bold">

{

inventory.filter(

i=>i.batch.status==='ACTIVE',

).length

}

</h2>

</div>

<div className="rounded-2xl bg-green-100 p-4">

<Package
size={34}
className="text-green-700"
/>

</div>

</div>

</Card>

<Card>

<div className="flex justify-between">

<div>

<p className="text-slate-500">

Recalled

</p>

<h2 className="mt-3 text-4xl font-bold">

{

inventory.filter(

i=>i.batch.status==='RECALLED',

).length

}

</h2>

</div>

<div className="rounded-2xl bg-red-100 p-4">

<ShieldAlert
size={34}
className="text-red-700"
/>

</div>

</div>

</Card>

</div>

<div className="flex flex-wrap items-center justify-between gap-4">

<div className="flex gap-3">

<button

onClick={()=>setActiveTab('inventory')}

className={`

rounded-xl

px-6

py-3

font-semibold

transition

${

activeTab==='inventory'

?

'bg-teal-600 text-white shadow-lg'

:

'bg-white border border-slate-200 hover:bg-slate-50'

}

`}

>

Inventory

</button>

<button

onClick={()=>setActiveTab('transfers')}

className={`

rounded-xl

px-6

py-3

font-semibold

transition

${

activeTab==='transfers'

?

'bg-teal-600 text-white shadow-lg'

:

'bg-white border border-slate-200 hover:bg-slate-50'

}

`}

>

Transfers

</button>

</div>

<div className="relative">

<Search

size={18}

className="absolute left-4 top-3.5 text-slate-400"

/>

<input

value={search}

onChange={(e)=>

setSearch(e.target.value)

}

placeholder="Search batch or drug..."

className="

w-80

rounded-xl

border

border-slate-200

bg-white

py-3

pl-11

pr-4

outline-none

focus:ring-2

focus:ring-teal-500

"

/>

</div>

</div>

{/* INVENTORY TABLE */}

{activeTab === 'inventory' && (

<Card className="overflow-hidden p-0">

<div className="border-b bg-slate-50 px-6 py-5">

<h2 className="text-xl font-bold">

Inventory Holdings

</h2>

<p className="mt-1 text-sm text-slate-500">

Current inventory assigned to your organization

</p>

</div>

<div className="overflow-x-auto">

<table className="min-w-full">

<thead className="sticky top-0 bg-slate-100">

<tr>

<th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">

Drug

</th>

<th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">

Quantity

</th>

<th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">

Status

</th>

</tr>

</thead>

<tbody>

{filteredInventory.length===0&&(

<tr>

<td

colSpan={3}

className="py-20 text-center"

>

<div className="space-y-3">

<div className="text-6xl">

📦

</div>

<h3 className="text-xl font-semibold">

No Inventory Found

</h3>

<p className="text-slate-500">

No inventory matches your search.

</p>

</div>

</td>

</tr>

)}

{filteredInventory.map(item=>(

<tr

key={item.id}

className="border-b hover:bg-slate-50 transition-colors"

>

<td className="px-6 py-5">

<div>

<p className="font-semibold">

{item.batch.drugName}

</p>

<p className="mt-1 text-sm text-slate-500">

{item.batch.batchNumber}

</p>

</div>

</td>

<td className="px-6 py-5">

<span className="font-semibold">

{item.quantity.toLocaleString()} Units

</span>

</td>

<td className="px-6 py-5">

<span

className={`

inline-flex

rounded-full

px-4

py-2

text-xs

font-semibold

${getBatchStatusColor(

item.batch.status,

)}

`}

>

{item.batch.status}

</span>

</td>

</tr>

))}

</tbody>

</table>

</div>

</Card>

)}

{/* TRANSFERS */}

{activeTab==='transfers'&&(

<Card className="overflow-hidden p-0">

<div className="border-b bg-slate-50 px-6 py-5">

<h2 className="text-xl font-bold">

Transfer History

</h2>

<p className="mt-1 text-sm text-slate-500">

Recent inventory movement

</p>

</div>

<div className="overflow-x-auto">

<table className="min-w-full">

<thead className="sticky top-0 bg-slate-100">

<tr>

<th className="px-6 py-4 text-left">

Batch

</th>

<th className="px-6 py-4 text-left">

From

</th>

<th className="px-6 py-4 text-left">

To

</th>

<th className="px-6 py-4 text-left">

Quantity

</th>

<th className="px-6 py-4 text-left">

Status

</th>

</tr>

</thead>

<tbody>

{transfers.length===0&&(

<tr>

<td

colSpan={5}

className="py-20 text-center"

>

<div className="space-y-3">

<div className="text-6xl">

🚚

</div>

<h3 className="text-xl font-semibold">

No Transfers

</h3>

<p className="text-slate-500">

Transfer history will appear here.

</p>

</div>

</td>

</tr>

)}

{transfers.map(transfer=>(

<tr

key={transfer.id}

className="border-b hover:bg-slate-50 transition-colors"

>

<td className="px-6 py-5 font-semibold">

{transfer.batch.batchNumber}

</td>

<td className="px-6 py-5">

<div>

<p className="font-medium">

{transfer.fromUser.fullName}

</p>

<p className="text-xs text-slate-500">

{transfer.fromUser.role}

</p>

</div>

</td>

<td className="px-6 py-5">

<div>

<p className="font-medium">

{transfer.toUser.fullName}

</p>

<p className="text-xs text-slate-500">

{transfer.toUser.role}

</p>

</div>

</td>

<td className="px-6 py-5 font-semibold">

{transfer.quantity}

</td>

<td className="px-6 py-5">

<span

className={`

inline-flex

rounded-full

px-4

py-2

text-xs

font-semibold

${getTransferStatusColor(

transfer.status,

)}

`}

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

</div>

</DashboardLayout>

);

}