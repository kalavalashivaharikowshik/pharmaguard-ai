import {
  useState,
} from 'react';

import {
  userService,
} from '../../services/userService';

import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';


interface Props {

  open: boolean;

  onClose: () => void;

  onCreated: () => void;

}


export default function CreateUserModal({

  open,

  onClose,

  onCreated,

}: Props) {


  const [
    fullName,
    setFullName,
  ] = useState('');


  const [
    email,
    setEmail,
  ] = useState('');


  const [
    password,
    setPassword,
  ] = useState('');


  const [
    role,
    setRole,
  ] = useState(
    'PHARMACY',
  );


  const [
    organizationName,
    setOrganizationName,
  ] = useState('');


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState('');


  const [
    success,
    setSuccess,
  ] = useState('');



  if (!open)
    return null;



  const submit =
    async () => {


      setError('');

      setSuccess('');



      if (
        !fullName.trim()
      ) {

        setError(
          'Full name is required',
        );

        return;

      }



      if (
        !email.trim()
      ) {

        setError(
          'Email is required',
        );

        return;

      }



      if (
        !password.trim()
      ) {

        setError(
          'Password is required',
        );

        return;

      }



      try {


        setLoading(true);



        await userService.create({

          fullName,

          email,

          password,

          role,

          organizationName,

        });



        setSuccess(
          'User created successfully 🎉',
        );



        await onCreated();



        setTimeout(() => {


          onClose();


          setFullName('');

          setEmail('');

          setPassword('');

          setOrganizationName('');

          setRole(
            'PHARMACY',
          );


        }, 1000);



      } catch (
        err: any
      ) {



        const message =
          err?.response?.data?.message;



        if (
          typeof message ===
          'string'
        ) {

          setError(
            message,
          );


        } else {


          setError(
            'Failed to create user',
          );


        }



      } finally {


        setLoading(
          false,
        );


      }


    };



  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">


      <Card className="w-full max-w-2xl rounded-3xl border-0 shadow-2xl">


        {/* HEADER */}


        <div className="flex items-center justify-between border-b border-slate-200 pb-5">


          <div>


            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-600">

              USER MANAGEMENT

            </p>



            <h2 className="mt-2 text-3xl font-bold text-slate-900">

              Create New User

            </h2>



            <p className="mt-2 text-slate-500">

              Add a new organization user to the PharmaGuard AI platform.

            </p>


          </div>



          <button

            onClick={onClose}

            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"

          >

            ✕

          </button>


        </div>




        {/* ALERTS */}



        {error && (


          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">

            {error}

          </div>


        )}




        {success && (


          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700">

            {success}

          </div>


        )}






        {/* FORM */}



        <div className="mt-8 grid grid-cols-2 gap-5">



          <Input

            placeholder="Full Name"

            value={fullName}

            onChange={(e)=>
              setFullName(
                e.target.value,
              )
            }

          />



          <Input

            type="email"

            placeholder="Email Address"

            value={email}

            onChange={(e)=>
              setEmail(
                e.target.value,
              )
            }

          />



          <Input

            type="password"

            placeholder="Temporary Password"

            value={password}

            onChange={(e)=>
              setPassword(
                e.target.value,
              )
            }

          />



          <div>


            <select

              value={role}

              onChange={(e)=>
                setRole(
                  e.target.value,
                )
              }

              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:border-teal-600 focus:outline-none"

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


          </div>




          <div className="col-span-2">


            <Input

              placeholder="Organization Name"

              value={organizationName}

              onChange={(e)=>
                setOrganizationName(
                  e.target.value,
                )
              }

            />


          </div>



        </div>






        {/* INFORMATION */}



        <div className="mt-8 rounded-2xl border border-teal-100 bg-teal-50 p-5">


          <h3 className="font-semibold text-teal-800">

            User Account Information

          </h3>



          <p className="mt-2 text-sm leading-6 text-slate-600">

            The new user will receive access based on the selected role. Ensure the email address and organization details are correct before creating the account.

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

            onClick={submit}

            disabled={loading}

          >


            {

              loading

                ? 'Creating User...'

                : 'Create User'

            }


          </Button>



        </div>



      </Card>


    </div>

  );

}