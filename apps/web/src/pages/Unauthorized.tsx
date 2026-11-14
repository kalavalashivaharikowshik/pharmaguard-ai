import { useNavigate } from 'react-router-dom';

import DashboardLayout
from '../components/layout/DashboardLayout';

import Button
from '../components/ui/Button';

export default function Unauthorized() {

  const navigate =
    useNavigate();

  return (

    <DashboardLayout>

      <div className="flex items-center justify-center py-20">

        <div className="w-full max-w-3xl rounded-3xl bg-white p-12 shadow-xl border border-slate-200 text-center">

          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-red-100 text-6xl">

            🔒

          </div>

          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-red-600">

            UNAUTHORIZED

          </p>

          <h1 className="mt-4 text-5xl font-bold text-slate-900">

            Access Restricted

          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600">

            Your account is not authorized to access this resource.
            Please sign in with an account that has the required permissions.

          </p>

          <div className="mt-10">

            <Button
              className="px-10 py-3"
              onClick={() =>
                navigate('/')
              }
            >

              Back to Dashboard

            </Button>

          </div>

        </div>

      </div>

    </DashboardLayout>

  );

}