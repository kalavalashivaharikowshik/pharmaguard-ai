import {
  useEffect,
  useState,
} from 'react';

import {
  inventoryService,
} from '../../services/inventoryService';

import {
  transferService,
} from '../../services/transferService';

import {
  toast,
} from 'react-hot-toast';

import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

type Props = {

  open: boolean;

  onClose: () => void;

  onCreated: () => void;

};

export default function CreateTransferModal({

  open,

  onClose,

  onCreated,

}: Props) {

  const [
    inventory,
    setInventory,
  ] = useState<any[]>([]);

  const [
    users,
    setUsers,
  ] = useState<any[]>([]);

  const [
    batchId,
    setBatchId,
  ] = useState('');

  const [
    toUserId,
    setToUserId,
  ] = useState('');

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  const [
    loading,
    setLoading,
  ] = useState(false);


  useEffect(() => {

    if (!open) {
      return;
    }

    const load = async () => {

      const inv =
        await inventoryService.getInventory();

      const allUsers =
        await transferService.getTransferUsers();

      setInventory(inv);

      setUsers(allUsers);

    };

    load();

  }, [open]);


  const handleTransfer = async () => {

    if (
      !batchId ||
      !toUserId ||
      quantity <= 0
    ) {

      toast.error(
        'Please complete all required fields.',
      );

      return;

    }


    try {

      setLoading(true);


      await transferService.createTransfer({

        batchId,

        toUserId,

        quantity,

      });


      await onCreated();


      setBatchId('');

      setToUserId('');

      setQuantity(1);


      onClose();


      toast.success(
        'Inventory transferred successfully.',
      );


    } catch (error: any) {


      toast.error(

        error.response?.data?.message ??
        'Transfer failed.',

      );


    } finally {

      setLoading(false);

    }

  };


  if (!open) {
    return null;
  }


  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">

      <Card className="w-full max-w-2xl rounded-3xl border-0 shadow-2xl">


        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-200 pb-5">


          <div>

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-600">

              INVENTORY TRANSFER

            </p>


            <h2 className="mt-2 text-3xl font-bold text-slate-900">

              Create Transfer

            </h2>


            <p className="mt-2 text-slate-500">

              Transfer pharmaceutical inventory securely between organizations.

            </p>


          </div>


          <button

            onClick={onClose}

            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"

          >

            ✕

          </button>


        </div>



        {/* FORM */}


        <div className="mt-8 grid grid-cols-2 gap-5">


          {/* BATCH */}

          <div className="col-span-2">


            <label className="mb-2 block text-sm font-medium text-slate-600">

              Batch

            </label>


            <select

              value={batchId}

              onChange={(e) =>
                setBatchId(
                  e.target.value,
                )
              }

              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-teal-600 focus:outline-none"

            >


              <option value="">

                Select Batch

              </option>



              {inventory

                .filter(

                  item =>

                    item.batch.status === 'ACTIVE' &&

                    item.quantity > 0,

                )

                .map(item => (


                  <option

                    key={item.batch.id}

                    value={item.batch.id}

                  >

                    {item.batch.batchNumber}

                    {' - '}

                    {item.batch.drugName}

                    {' ('}

                    {item.quantity}

                    {' units)'}


                  </option>


                ))}


            </select>


          </div>



          {/* RECEIVER */}


          <div className="col-span-2">


            <label className="mb-2 block text-sm font-medium text-slate-600">

              Transfer To

            </label>


            <select

              value={toUserId}

              onChange={(e) =>
                setToUserId(
                  e.target.value,
                )
              }


              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-teal-600 focus:outline-none"

            >


              <option value="">

                Select Receiver

              </option>



              {users.map(user => (


                <option

                  key={user.id}

                  value={user.id}

                >


                  {user.fullName}

                  {' ('}

                  {user.role}

                  {')'}


                </option>


              ))}



            </select>


          </div>




          {/* QUANTITY */}


          <div className="col-span-2">


            <label className="mb-2 block text-sm font-medium text-slate-600">

              Quantity

            </label>


            <Input

              type="number"

              min={1}

              value={quantity}

              onChange={(e) =>

                setQuantity(

                  Number(
                    e.target.value,
                  ),

                )

              }

            />


          </div>



        </div>




        {/* INFORMATION */}


        <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">


          <h3 className="font-semibold text-blue-800">

            Transfer Information

          </h3>


          <p className="mt-2 text-sm leading-6 text-slate-600">

            The selected inventory will be transferred to the receiving organization and the transaction will be recorded for supply chain tracking.

          </p>


        </div>




        {/* FOOTER */}


        <div className="mt-8 flex justify-end gap-4 border-t border-slate-200 pt-6">


          <Button

            variant="secondary"

            onClick={onClose}

          >

            Cancel

          </Button>



          <Button

            onClick={handleTransfer}

            disabled={loading}

          >


            {

              loading

                ? 'Transferring...'

                : 'Create Transfer'

            }


          </Button>



        </div>


      </Card>


    </div>

  );

}