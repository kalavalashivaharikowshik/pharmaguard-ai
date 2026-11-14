import {
  useState,
} from 'react';

import DashboardLayout
  from '../components/layout/DashboardLayout';

import Card
  from '../components/ui/Card';

import Button
  from '../components/ui/Button';

import Input
  from '../components/ui/Input';

import {
  blockchainService,
} from '../services/blockchainService';

import type {
  BlockchainVerification,
} from '../types/blockchain';

export default function Blockchain() {

  const [
    batchNumber,
    setBatchNumber,
  ] =
    useState('');

  const [
    error,
    setError,
  ] =
    useState('');

  const [
    result,
    setResult,
  ] =
    useState<BlockchainVerification | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const verify =
    async () => {

      if (!batchNumber) {
        return;
      }

      setLoading(true);
      setError('');
      setResult(null);

      try {

        const data =
          await blockchainService.verify(
            batchNumber,
          );

        setResult(data);

      } catch (error: any) {

        setError(
          error.response?.data?.message ||
          'Verification failed',
        );

      } finally {

        setLoading(false);

      }

    };

  return (

    <DashboardLayout>

      <div className="space-y-8">

        <div className="rounded-3xl bg-gradient-to-r from-[#0F766E] via-[#0D9488] to-[#14B8A6] p-8 text-white shadow-xl">

          <h1 className="text-4xl font-bold">

            Blockchain Verification

          </h1>

          <p className="mt-2 text-teal-100">

            Verify pharmaceutical authenticity using immutable blockchain records

          </p>

        </div>

        <Card>

          <h2 className="mb-5 text-xl font-semibold">

            Verify Batch

          </h2>

          <div className="flex flex-col gap-4 md:flex-row">

            <Input
              value={batchNumber}
              onChange={(e) =>
                setBatchNumber(
                  e.target.value,
                )
              }
              placeholder="Enter Batch Number (Example: PG-100245)"
              className="flex-1"
            />

            <Button
              onClick={verify}
              disabled={loading}
            >

              {loading
                ? 'Verifying...'
                : 'Verify Blockchain'}

            </Button>

          </div>

        </Card>

        {!result && !error && (

          <Card>

            <div className="py-12 text-center">

              <div className="text-6xl">

                🔗

              </div>

              <h3 className="mt-5 text-2xl font-bold">

                Ready to Verify

              </h3>

              <p className="mt-3 text-slate-500">

                Enter a pharmaceutical batch number to validate its blockchain authenticity.

              </p>

            </div>

          </Card>

        )}

        {error && (

          <Card>

            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">

              {error}

            </div>

          </Card>

        )}

        {result && (

          <>

            <Card>

              <div className="space-y-5">

                <div>

                  <h2 className="text-2xl font-bold text-slate-800">

                    Verification Result

                  </h2>

                  <p className="text-slate-500">

                    Blockchain integrity report

                  </p>

                </div>

                {result.verified ? (

                  <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-green-700">

                    ✅ Blockchain Verified

                  </div>

                ) : (

                  <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">

                    🚨 Tampering Detected

                  </div>

                )}

                {result.action && (

                  <div className="rounded-xl border border-orange-200 bg-orange-50 p-5 text-orange-700">

                    <strong>

                      Action:

                    </strong>

                    {' '}

                    {result.action}

                  </div>

                )}

              </div>

            </Card>

            <Card>

              <div className="space-y-8">

                <div>

                  <p className="text-sm font-medium uppercase tracking-wide text-slate-400">

                    Batch Number

                  </p>

                  <p className="mt-2 rounded-lg bg-slate-50 p-3 font-semibold break-all">

                    {result.batchNumber}

                  </p>

                </div>

                <div>

                  <p className="text-sm font-medium uppercase tracking-wide text-slate-400">

                    Current Hash

                  </p>

                  <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm break-all">

                    {result.currentHash}

                  </p>

                </div>

                <div>

                  <p className="text-sm font-medium uppercase tracking-wide text-slate-400">

                    Blockchain Hash

                  </p>

                  <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm break-all">

                    {result.blockchainHash}

                  </p>

                </div>

              </div>

            </Card>

          </>

        )}

      </div>

    </DashboardLayout>

  );

}