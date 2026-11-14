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

import {
  revocationService,
} from '../services/revocationService';

import type {
  Revocation,
  RevocationSummary,
} from '../types/revocation';

import RevocationDetailsDrawer
from '../components/revocation/RevocationDetailsDrawer';


export default function Revocation() {

  const [
    revocations,
    setRevocations,
  ] =
    useState<Revocation[]>([]);


  const [
    summary,
    setSummary,
  ] =
    useState<RevocationSummary | null>(
      null,
    );


  const [
    selected,
    setSelected,
  ] =
    useState<Revocation | null>(
      null,
    );


  useEffect(() => {

    const load =
      async () => {

        const data =
          await revocationService
            .getAll();


        const stats =
          await revocationService
            .getSummary();


        setRevocations(
          data,
        );


        setSummary(
          stats,
        );

      };


    load();

  }, []);



  if (!summary) {

    return (

      <DashboardLayout>

        <div className="flex h-[70vh] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />

            <p className="mt-4 text-slate-500">
              Loading revocation data...
            </p>

          </div>

        </div>

      </DashboardLayout>

    );

  }



  const reasonColors = {

    EXPIRED:
      'bg-orange-100 text-orange-700',

    TAMPER_DETECTED:
      'bg-red-100 text-red-700',

    RECALL_COMPLETED:
      'bg-purple-100 text-purple-700',

    MANUAL_TEST:
      'bg-slate-100 text-slate-700',

  };



  return (

    <DashboardLayout>


      <div className="space-y-8">


        {/* HERO HEADER */}

        <div className="rounded-3xl bg-gradient-to-r from-[#0F766E] via-[#0D9488] to-[#14B8A6] p-8 shadow-xl">


          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">


            <div>


              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-100">

                PRODUCT REVOCATION

              </p>


              <h1 className="mt-3 text-4xl font-bold text-white">

                Revocation Dashboard

              </h1>


              <p className="mt-3 max-w-3xl text-lg text-teal-100">

                Track revoked pharmaceutical batches, investigate incidents and monitor product safety across the supply chain.

              </p>


            </div>



            <div className="rounded-2xl bg-white/20 px-6 py-4 text-center backdrop-blur">


              <p className="text-sm text-teal-100">

                Revoked Products

              </p>


              <p className="mt-2 text-4xl font-bold text-white">

                {summary.revokedBatches}

              </p>


            </div>


          </div>


        </div>




        {/* KPI CARDS */}


        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">


          <Card className="border-l-4 border-red-600">


            <p className="text-sm text-slate-500">

              Total Revoked

            </p>


            <h2 className="mt-3 text-4xl font-bold">

              {summary.revokedBatches}

            </h2>


          </Card>




          <Card className="border-l-4 border-orange-500">


            <p className="text-sm text-slate-500">

              Expired

            </p>


            <h2 className="mt-3 text-4xl font-bold text-orange-600">

              {summary.expired}

            </h2>


          </Card>




          <Card className="border-l-4 border-red-500">


            <p className="text-sm text-slate-500">

              Tampered

            </p>


            <h2 className="mt-3 text-4xl font-bold text-red-600">

              {summary.tampered}

            </h2>


          </Card>




          <Card className="border-l-4 border-purple-600">


            <p className="text-sm text-slate-500">

              Recall Completed

            </p>


            <h2 className="mt-3 text-4xl font-bold text-purple-600">

              {summary.recalled}

            </h2>


          </Card>


        </div>




        {/* TABLE */}

        <Card className="overflow-hidden p-0">


          <div className="max-h-[600px] overflow-y-auto">


            <table className="w-full">


              <thead className="sticky top-0 bg-slate-100">


                <tr className="border-b">


                  <th className="px-6 py-4 text-left">

                    Batch

                  </th>


                  <th className="px-6 py-4 text-left">

                    Drug

                  </th>


                  <th className="px-6 py-4 text-left">

                    Reason

                  </th>


                  <th className="px-6 py-4 text-left">

                    Revoked At

                  </th>


                  <th className="px-6 py-4 text-left">

                    Actions

                  </th>


                </tr>


              </thead>
                          <tbody>


                {revocations.length === 0 && (

                  <tr>

                    <td
                      colSpan={5}
                      className="py-20 text-center"
                    >

                      <div className="space-y-4">


                        <div className="text-6xl">

                          🚫

                        </div>


                        <h3 className="text-2xl font-bold">

                          No Revocations

                        </h3>


                        <p className="text-slate-500">

                          There are currently no revoked pharmaceutical batches.

                        </p>


                      </div>


                    </td>

                  </tr>

                )}



                {revocations.map(
                  (item) => (

                    <tr

                      key={item.id}

                      className="border-t transition hover:bg-red-50"

                    >


                      <td className="px-6 py-5">


                        <div>


                          <p className="font-semibold text-slate-800">

                            {item.batchNumber}

                          </p>


                          <p className="text-sm text-slate-500">

                            Batch Number

                          </p>


                        </div>


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


                        <span

                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            reasonColors[
                              item.revocationReason as keyof typeof reasonColors
                            ] || ''
                          }`}

                        >

                          {item.revocationReason}

                        </span>


                      </td>




                      <td className="px-6 py-5">


                        <div>


                          <p className="font-semibold">

                            {new Date(
                              item.revokedAt,
                            ).toLocaleDateString()}

                          </p>


                          <p className="text-sm text-slate-500">

                            Revocation Date

                          </p>


                        </div>


                      </td>




                      <td className="px-6 py-5">


                        <Button

                          className="px-4 py-2"

                          onClick={() =>
                            setSelected(
                              item,
                            )
                          }

                        >

                          View Details

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



      <RevocationDetailsDrawer

        revocation={selected}

        onClose={() =>
          setSelected(
            null,
          )
        }

      />


    </DashboardLayout>

  );

}