import { useNavigate } from 'react-router-dom';

import DashboardLayout
from '../components/layout/DashboardLayout';

import Button
from '../components/ui/Button';

export default function AccessDenied() {

  const navigate =
    useNavigate();

  return (

    <DashboardLayout>

      <div className="flex items-center justify-center py-20">

        <div className="w-full max-w-4xl rounded-3xl bg-white p-12 shadow-xl border border-slate-200 text-center">

          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-amber-100 text-6xl">

            🚫

          </div>

          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.3em] text-amber-600">

            403 FORBIDDEN

          </p>

          <h1 className="mt-4 text-5xl font-bold text-slate-900">

            Access Denied

          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">

            You don't have permission to access this page.
            If you believe this is an error, please contact your system administrator.

          </p>

          <div className="mt-10 flex justify-center gap-4">

            <Button
              className="px-8 py-3"
              onClick={() =>
                navigate('/')
              }
            >

              Dashboard

            </Button>

            <Button
              variant="secondary"
              className="px-8 py-3"
              onClick={() =>
                navigate('/login')
              }
            >

              Login

            </Button>

          </div>

        </div>

      </div>

    </DashboardLayout>

  );

}