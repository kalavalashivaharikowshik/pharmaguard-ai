import {
  useState,
} from 'react';

import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import Card
from '../components/ui/Card';

import Button
from '../components/ui/Button';

import Input
from '../components/ui/Input';

import {
  api,
} from '../services/api';



export default function ResetPassword() {


  const navigate =
    useNavigate();



  const [params] =
    useSearchParams();



  const token =
    params.get('token');



  const [
    password,
    setPassword,
  ] =
    useState('');



  const [
    confirm,
    setConfirm,
  ] =
    useState('');



  const [
    loading,
    setLoading,
  ] =
    useState(false);




  const submit =
    async () => {


      if (!token) {


        alert(
          'Invalid reset link.',
        );


        return;


      }




      if (
        password !== confirm
      ) {


        alert(
          'Passwords do not match.',
        );


        return;


      }





      try {


        setLoading(
          true,
        );



        await api.post(

          '/auth/reset-password',

          {

            token,

            password,

          },

        );



        alert(
          'Password updated successfully.',
        );



        navigate(
          '/login',
        );



      } finally {


        setLoading(
          false,
        );


      }


    };





  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-cyan-50 to-teal-100 flex items-center justify-center px-6 py-12">


      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-10 items-center">





        {/* LEFT SECTION */}



        <div className="hidden lg:block">


          <p className="uppercase tracking-[0.3em] text-sm font-semibold text-teal-700">

            SECURE PASSWORD RESET

          </p>




          <h1 className="mt-5 text-5xl font-bold leading-tight text-slate-900">

            Create a New Password

          </h1>




          <p className="mt-6 text-lg leading-8 text-slate-600">

            Choose a strong password to keep your PharmaGuard AI account secure.

          </p>





          <div className="mt-10 space-y-5">





            <div className="flex gap-4">


              <div className="h-12 w-12 rounded-xl bg-teal-600 text-white flex items-center justify-center text-xl">

                🔒

              </div>



              <div>


                <h3 className="font-semibold text-lg">

                  Strong Encryption

                </h3>



                <p className="text-slate-500">

                  Passwords are securely encrypted.

                </p>


              </div>


            </div>







            <div className="flex gap-4">


              <div className="h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl">

                🛡️

              </div>



              <div>


                <h3 className="font-semibold text-lg">

                  Protected Account

                </h3>



                <p className="text-slate-500">

                  Only you can access your account.

                </p>


              </div>


            </div>







            <div className="flex gap-4">


              <div className="h-12 w-12 rounded-xl bg-green-600 text-white flex items-center justify-center text-xl">

                ✅

              </div>



              <div>


                <h3 className="font-semibold text-lg">

                  Quick Recovery

                </h3>



                <p className="text-slate-500">

                  After resetting, you'll be redirected to login.

                </p>


              </div>


            </div>





          </div>



        </div>







        {/* RIGHT SECTION */}




        <Card className="rounded-3xl p-10 shadow-2xl">



          <div className="text-center">


            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 text-4xl">

              🔑

            </div>




            <h2 className="text-3xl font-bold">

              Reset Password

            </h2>




            <p className="mt-3 text-slate-500">

              Enter your new password below.

            </p>


          </div>







          <div className="mt-8 space-y-4">


            <Input

              type="password"

              placeholder="New Password"

              value={password}

              onChange={(e) =>
                setPassword(
                  e.target.value,
                )
              }

            />





            <Input

              type="password"

              placeholder="Confirm Password"

              value={confirm}

              onChange={(e) =>
                setConfirm(
                  e.target.value,
                )
              }

            />



          </div>







          <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-4">


            <h3 className="font-semibold text-teal-800">

              Password Tips

            </h3>




            <p className="mt-2 text-sm leading-6 text-slate-600">

              Use at least 8 characters with uppercase letters, lowercase letters, numbers and symbols for stronger security.

            </p>


          </div>







          <Button

            className="mt-6 w-full py-3"

            disabled={loading}

            onClick={submit}

          >


            {loading

              ? 'Updating Password...'

              : 'Reset Password'

            }


          </Button>







          <div className="mt-6 text-center text-slate-600">


            Remember your password?



            <button

              onClick={() =>
                navigate('/login')
              }

              className="ml-2 font-semibold text-teal-700 hover:underline"

            >

              Back to Login

            </button>



          </div>





        </Card>





      </div>



    </div>

  );

}