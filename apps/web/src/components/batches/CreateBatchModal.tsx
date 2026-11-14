import {
  useState,
} from 'react';

import {
  batchService,
} from '../../services/batchService';

import Card
from '../ui/Card';

import Input
from '../ui/Input';

import Button
from '../ui/Button';


interface Props {
  open: boolean;

  onClose: () => void;

  onCreated: () => void;
}


export default function CreateBatchModal({

  open,

  onClose,

  onCreated,

}: Props) {


  const [
    drugName,
    setDrugName,
  ] =
  useState('');


  const [
    batchNumber,
    setBatchNumber,
  ] =
  useState('');


  const [
    manufactureDate,
    setManufactureDate,
  ] =
  useState('');


  const [
    expiryDate,
    setExpiryDate,
  ] =
  useState('');


  const [
    quantity,
    setQuantity,
  ] =
  useState(0);


  const [
    loading,
    setLoading,
  ] =
  useState(false);


  const [
    error,
    setError,
  ] =
  useState('');


  const [
    success,
    setSuccess,
  ] =
  useState('');


  if (!open) {
    return null;
  }


  const submit =
    async () => {


      setError('');

      setSuccess('');


      if (!drugName.trim()) {

        setError(
          'Drug name is required',
        );

        return;

      }


      if (!batchNumber.trim()) {

        setError(
          'Batch number is required',
        );

        return;

      }


      if (!manufactureDate) {

        setError(
          'Manufacture date is required',
        );

        return;

      }


      if (!expiryDate) {

        setError(
          'Expiry date is required',
        );

        return;

      }


      if (
        new Date(expiryDate)
        <=
        new Date(manufactureDate)
      ) {

        setError(
          'Expiry date must be after manufacture date',
        );

        return;

      }


      if (quantity <= 0) {

        setError(
          'Quantity must be greater than 0',
        );

        return;

      }


      try {


        setLoading(true);


        await batchService.create({

          drugName,

          batchNumber,

          manufactureDate,

          expiryDate,

          quantity,

        });


        setSuccess(
          'Batch created successfully 🎉',
        );


        await onCreated();


        setTimeout(() => {

          onClose();

        }, 1500);



      } catch (err: any) {


        const message =
          err?.response?.data?.message;


        if (
          typeof message === 'string'
        ) {

          setError(
            message,
          );

        } else {

          setError(
            'Failed to create batch',
          );

        }


      } finally {

        setLoading(false);

      }


    };



  return (

    <div className="
      fixed inset-0
      z-50
      flex
      items-center
      justify-center
      bg-black/60
      backdrop-blur-sm
      px-6
    ">


      <Card
        className="
          w-full
          max-w-2xl
          rounded-3xl
          shadow-2xl
          border-0
        "
      >


        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-200
            pb-5
          "
        >


          <div>

            <p
              className="
                text-sm
                font-semibold
                uppercase
                tracking-[0.25em]
                text-teal-600
              "
            >

              Batch Management

            </p>


            <h2
              className="
                mt-2
                text-3xl
                font-bold
                text-slate-900
              "
            >

              Create New Batch

            </h2>


            <p
              className="
                mt-2
                text-slate-500
              "
            >

              Register a pharmaceutical batch into PharmaGuard AI.

            </p>


          </div>


          <button

            onClick={onClose}

            className="
              rounded-xl
              p-2
              text-slate-500
              hover:bg-slate-100
            "

          >

            ✕

          </button>


        </div>
            {error && (

          <div
            className="
              mt-6
              rounded-2xl
              border
              border-red-200
              bg-red-50
              p-4
              text-red-700
            "
          >

            {error}

          </div>

        )}



        {success && (

          <div
            className="
              mt-6
              rounded-2xl
              border
              border-green-200
              bg-green-50
              p-4
              text-green-700
            "
          >

            {success}

          </div>

        )}



        <div
          className="
            mt-8
            grid
            grid-cols-2
            gap-5
          "
        >


          <div
            className="
              col-span-2
            "
          >

            <Input

              placeholder="Drug Name"

              value={drugName}

              onChange={(e) =>
                setDrugName(
                  e.target.value,
                )
              }

            />

          </div>



          <Input

            placeholder="Batch Number"

            value={batchNumber}

            onChange={(e) =>
              setBatchNumber(
                e.target.value,
              )
            }

          />



          <Input

            type="number"

            placeholder="Quantity"

            value={
              quantity || ''
            }

            onChange={(e) =>
              setQuantity(
                Number(
                  e.target.value,
                ),
              )
            }

          />



          <div>

            <label
              className="
                mb-2
                block
                text-sm
                font-medium
                text-slate-600
              "
            >

              Manufacture Date

            </label>


            <Input

              type="date"

              value={manufactureDate}

              onChange={(e) =>
                setManufactureDate(
                  e.target.value,
                )
              }

            />

          </div>



          <div>

            <label
              className="
                mb-2
                block
                text-sm
                font-medium
                text-slate-600
              "
            >

              Expiry Date

            </label>


            <Input

              type="date"

              value={expiryDate}

              onChange={(e) =>
                setExpiryDate(
                  e.target.value,
                )
              }

            />

          </div>


        </div>



        <div
          className="
            mt-8
            rounded-2xl
            border
            border-teal-100
            bg-teal-50
            p-5
          "
        >

          <h3
            className="
              font-semibold
              text-teal-800
            "
          >

            Batch Registration

          </h3>


          <p
            className="
              mt-2
              text-sm
              leading-6
              text-slate-600
            "
          >

            The batch will receive a QR code and blockchain hash after successful creation. Ensure all information is accurate before submitting.

          </p>


        </div>




        <div
          className="
            mt-8
            flex
            justify-end
            gap-4
            border-t
            border-slate-200
            pt-6
          "
        >


          <Button

            variant="secondary"

            onClick={onClose}

          >

            Cancel

          </Button>



          <Button

            onClick={submit}

            disabled={loading}

          >

            {loading

              ? 'Creating Batch...'

              : 'Create Batch'

            }

          </Button>


        </div>



      </Card>


    </div>

  );

}