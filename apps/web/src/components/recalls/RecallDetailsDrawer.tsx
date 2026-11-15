import { aiService } from '../../services/aiService';
import RecallAgentDetails from './RecallAgentDetails';
import {
  useEffect,
  useState,
} from 'react';



import type {
  Recall,
} from '../../types/recall';

import Card from '../ui/Card';

interface Props {

  recall: Recall | null;

  onClose: () => void;

}


export default function RecallDetailsDrawer({
  recall,
  onClose,
}: Props) {


  const [
    summary,
    setSummary,
  ] = useState('');


  useEffect(() => {

    const load =
      async () => {

        if (!recall) {
          return;
        }

        const result =
          await aiService.summary(
            recall.id,
          );

        setSummary(
          result.summary,
        );

      };


    load();

  }, [recall]);


  if (!recall) {
    return null;
  }


  return (

    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">


      <div className="h-full w-full max-w-3xl overflow-y-auto bg-slate-100 shadow-2xl">


        {/* HEADER */}

        <div className="sticky top-0 z-20 border-b border-slate-200 bg-white px-8 py-6">


          <div className="flex items-start justify-between">


            <div>

              <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-600">

                RECALL DETAILS

              </p>


              <h2 className="mt-2 text-3xl font-bold text-slate-900">

                {recall.batch.drugName}

              </h2>


              <p className="mt-2 text-slate-500">

                {recall.recallNumber}

              </p>


            </div>


            <button

              onClick={onClose}

              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"

            >

              ✕

            </button>


          </div>



          <div className="mt-5 flex flex-wrap gap-3">


            <span

              className={`rounded-full px-4 py-2 text-sm font-semibold
              
              ${
                recall.severity === 'CRITICAL'
                  ? 'bg-red-100 text-red-700'
                  : recall.severity === 'HIGH'
                  ? 'bg-orange-100 text-orange-700'
                  : recall.severity === 'MEDIUM'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-blue-100 text-blue-700'
              }

              `}

            >

              {recall.severity}

            </span>



            <span

              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"

            >

              {recall.status}

            </span>


          </div>


        </div>



        {/* BODY */}


        <div className="space-y-6 p-8">


          <Section title="Recall Information">


            <Field

              label="Recall Number"

              value={
                recall.recallNumber
              }

            />


            <Field

              label="Drug Name"

              value={
                recall.batch.drugName
              }

            />


            <Field

              label="Batch Number"

              value={
                recall.batch.batchNumber
              }

            />


            <Field

              label="Severity"

              value={
                recall.severity
              }

            />


            <Field

              label="Status"

              value={
                recall.status
              }

            />


            <Field

              label="Reason"

              value={
                recall.reason
              }

            />


          </Section>




          {recall && <RecallAgentDetails recallId={recall.id} status={recall.status} />}

          {/* AI SUMMARY */}


          <Card className="rounded-3xl border-0 bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 shadow-lg">


            <div className="flex items-center gap-4">


              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-2xl">

                🤖

              </div>



              <div>

                <h3 className="text-xl font-bold text-orange-800">

                  AI Recall Assessment

                </h3>


                <p className="text-sm text-slate-500">

                  Generated Recall Risk Analysis

                </p>


              </div>


            </div>



            <div className="mt-6 rounded-2xl bg-white p-5 leading-7 text-slate-700 shadow-sm">


              {
                summary ||
                'Generating AI assessment...'
              }


            </div>


          </Card>



        </div>


      </div>


    </div>

  );

}




function Section({

  title,

  children,

}: {

  title: string;

  children: React.ReactNode;

}) {


  return (

    <Card className="rounded-3xl border-0 shadow-lg">


      <h3 className="mb-6 text-xl font-bold text-slate-900">

        {title}

      </h3>



      <div className="grid grid-cols-2 gap-6">


        {children}


      </div>


    </Card>

  );

}




function Field({

  label,

  value,

}: {

  label: string;

  value: string;

}) {


  return (

    <div>


      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">

        {label}

      </p>



      <p className="mt-2 break-words text-base font-semibold text-slate-800">

        {value}

      </p>


    </div>

  );

}