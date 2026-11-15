import {
  useEffect,
  useState,
} from 'react';

import type {
  User,
} from '../../types/user';

import {
  userService,
} from '../../services/userService';

import ConfirmationModal
from '../common/ConfirmationModal';

import Card
from '../ui/Card';

import Button
from '../ui/Button';


interface Props {

  user: User | null;

  onClose: () => void;

  onUpdated: () => void;

}


export default function UserDetailsDrawer(props: Props) {
  // Hooks live in the content component so they always run in the same order.
  if (!props.user) {
    return null;
  }
  return <UserDetailsDrawerContent key={props.user.id} {...props} user={props.user} />;
}

function UserDetailsDrawerContent({

  user,

  onClose,

  onUpdated,

}: Props & { user: User }) {



  const [

    role,

    setRole,

  ] = useState('');


  const [

    status,

    setStatus,

  ] = useState('');


  const [

    loading,

    setLoading,

  ] = useState(false);


  const [

    success,

    setSuccess,

  ] = useState('');


  const [

    error,

    setError,

  ] = useState('');


  const [

    showSuspendModal,

    setShowSuspendModal,

  ] = useState(false);



  useEffect(() => {

    if (user) {

      setRole(user.role);

      setStatus(user.status);

    }

  }, [user]);



  const currentUser =

    JSON.parse(

      localStorage.getItem(

        'user',

      ) || '{}',

    );



  const isCurrentUser =

    currentUser.id === user.id;



  const handleUpdateRole =

    async () => {

      try {

        setLoading(true);

        setError('');

        setSuccess('');


        const updatedUser =

          await userService.updateRole(

            user.id,

            role,

          );


        setSuccess(

          'Role updated successfully',

        );


        setTimeout(() => {

          setSuccess('');

        }, 2000);



        user.role =

          updatedUser.role;



        await onUpdated();


      } catch (err: any) {


        setError(

          err.response?.data?.message ||

          'Failed to update role',

        );


      } finally {


        setLoading(false);


      }

    };



  const handleUpdateStatus =

    async () => {


      try {


        setLoading(true);

        setError('');

        setSuccess('');



        if (

          status === 'SUSPENDED'

        ) {


          setLoading(false);


          setShowSuspendModal(true);


          return;


        }



        const updatedUser =

          await userService.updateStatus(

            user.id,

            status,

          );



        setSuccess(

          'Status updated successfully',

        );



        setTimeout(() => {

          setSuccess('');

        }, 2000);



        user.status =

          updatedUser.status;



        await onUpdated();



      } catch(err:any){


        setError(

          err.response?.data?.message ||

          'Failed to update status',

        );


      } finally {


        setLoading(false);


      }

    };



  return (

    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">


      <div className="h-full w-[680px] overflow-y-auto bg-slate-100 shadow-2xl">



        {/* HEADER */}


        <div className="sticky top-0 z-20 border-b border-slate-200 bg-white px-8 py-6">


          <div className="flex items-start justify-between">


            <div>


              <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal-600">

                USER DETAILS

              </p>


              <h2 className="mt-2 text-3xl font-bold text-slate-900">

                {user.fullName}

              </h2>


              <p className="mt-2 text-slate-500">

                {user.email}

              </p>


            </div>



            <button

              onClick={onClose}

              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"

            >

              ✕

            </button>


          </div>



          <div className="mt-5 flex flex-wrap gap-3">


            <span

              className={`rounded-full px-4 py-2 text-sm font-semibold

              ${

                user.role === 'SUPER_ADMIN'

                ? 'bg-purple-100 text-purple-700'

                : user.role === 'REGULATOR'

                ? 'bg-red-100 text-red-700'

                : user.role === 'MANUFACTURER'

                ? 'bg-blue-100 text-blue-700'

                : user.role === 'DISTRIBUTOR'

                ? 'bg-amber-100 text-amber-700'

                : 'bg-green-100 text-green-700'

              }

              `}

            >

              {user.role}

            </span>



            <span

              className={`rounded-full px-4 py-2 text-sm font-semibold

              ${

                user.status === 'ACTIVE'

                ? 'bg-green-100 text-green-700'

                : user.status === 'INACTIVE'

                ? 'bg-yellow-100 text-yellow-700'

                : 'bg-red-100 text-red-700'

              }

              `}

            >

              {user.status}

            </span>


          </div>


        </div>



        {/* BODY */}


        <div className="space-y-6 p-8">


          <Section title="User Information">


            <Field

              label="Full Name"

              value={user.fullName}

            />


            <Field

              label="Email"

              value={user.email}

            />


            <Field

              label="Role"

              value={user.role}

            />


            <Field

              label="Organization"

              value={

                user.organizationName ||

                'Not Assigned'

              }

            />


          </Section>
                  <Section title="Account Information">


            <Field

              label="User ID"

              value={user.id}

            />


            <Field

              label="Created At"

              value={

                new Date(

                  user.createdAt,

                ).toLocaleString()

              }

            />


          </Section>




          <Section title="Role Management">


            <div className="col-span-2">


              <p className="mb-2 text-sm font-medium text-slate-600">

                Change Role

              </p>



              <select

                value={role}

                onChange={(e)=>

                  setRole(

                    e.target.value,

                  )

                }

                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-teal-600 focus:outline-none"

              >


                <option value="MANUFACTURER">

                  Manufacturer

                </option>


                <option value="DISTRIBUTOR">

                  Distributor

                </option>


                <option value="REGULATOR">

                  Regulator

                </option>


                <option value="PHARMACY">

                  Pharmacy

                </option>


              </select>




              {error && (


                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">


                  {error}


                </div>


              )}




              {success && (


                <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700">


                  {success}


                </div>


              )}




              <div className="mt-5">


                <Button

                  onClick={handleUpdateRole}

                  disabled={

                    loading ||

                    isCurrentUser ||

                    role === user.role

                  }

                >

                  {

                    loading

                    ? 'Updating...'

                    : 'Update Role'

                  }

                </Button>



                {isCurrentUser && (


                  <p className="mt-3 text-sm text-red-600">


                    You cannot modify your own account.


                  </p>


                )}


              </div>


            </div>


          </Section>





          <Section title="Account Status">


            <div className="col-span-2">


              <p className="mb-2 text-sm font-medium text-slate-600">

                Change Status

              </p>




              <select

                value={status}

                onChange={(e)=>

                  setStatus(

                    e.target.value,

                  )

                }

                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-teal-600 focus:outline-none"

              >


                <option value="ACTIVE">

                  Active

                </option>


                <option value="INACTIVE">

                  Inactive

                </option>


                <option value="SUSPENDED">

                  Suspended

                </option>


              </select>



              <div className="mt-5">


                <Button


                  onClick={handleUpdateStatus}


                  disabled={

                    loading ||

                    isCurrentUser ||

                    status === user.status

                  }


                >


                  {

                    loading

                    ? 'Updating...'

                    : 'Update Status'

                  }


                </Button>


              </div>


            </div>


          </Section>



        </div>


      </div>




      <ConfirmationModal

        open={showSuspendModal}

        title="Suspend Account"

        message="Are you sure you want to suspend this account? The user will no longer be able to log in until an administrator reactivates the account."

        confirmText="Suspend"

        cancelText="Cancel"


        onCancel={() =>

          setShowSuspendModal(

            false,

          )

        }


        onConfirm={async()=>{


          setShowSuspendModal(false);



          try {


            setLoading(true);


            setError('');


            setSuccess('');



            await userService.updateStatus(

              user.id,

              status,

            );



            setSuccess(

              'Status updated successfully',

            );



            await onUpdated();



            setTimeout(()=>{


              setSuccess('');


            },2000);



          } catch(err:any){



            setError(

              err.response?.data?.message ||

              'Failed to update status',

            );


          } finally {


            setLoading(false);


          }


        }}


      />


    </div>


  );

}




function Section({

  title,

  children,

}: {

  title:string;

  children:React.ReactNode;

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

}:{

  label:string;

  value:string;

}) {


  return (


    <div>


      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">


        {label}


      </p>



      <p className="mt-2 break-all text-base font-semibold text-slate-800">


        {value}


      </p>


    </div>


  );


}