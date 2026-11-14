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



export default function ActivateAccount() {


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
    confirmPassword,
    setConfirmPassword,
  ] =
    useState('');



  const [
    loading,
    setLoading,
  ] =
    useState(false);





  const activate =
    async () => {


      if (!token) {


        alert(
          'Invalid activation link.',
        );


        return;


      }




      if (
        password !==
        confirmPassword
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

          '/auth/activate',

          {

            token,

            password,

          },

        );



        alert(
          'Account activated successfully.',
        );



        navigate(
          '/login',
        );



      } catch (
        error: any
      ) {


        alert(

          error?.response?.data?.message ||

          'Activation failed.',

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

            WELCOME TO PHARMAGUARD AI

          </p>




          <h1 className="mt-5 text-5xl font-bold leading-tight text-slate-900">

            Activate Your Account

          </h1>




          <p className="mt-6 text-lg leading-8 text-slate-600">

            Your organization has been approved. Create a secure password to activate your PharmaGuard AI account and start managing pharmaceutical supply chains.

          </p>





          <div className="mt-10 space-y-5">





            <div className="flex gap-4">


              <div className="h-12 w-12 rounded-xl bg-teal-600 text-white flex items-center justify-center text-xl">

                ✅

              </div>



              <div>


                <h3 className="font-semibold text-lg">

                  Registration Approved

                </h3>



                <p className="text-slate-500">

                  Your organization has successfully passed verification.

                </p>


              </div>


            </div>







            <div className="flex gap-4">


              <div className="h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl">

                🔐

              </div>



              <div>


                <h3 className="font-semibold text-lg">

                  Create Password

                </h3>



                <p className="text-slate-500">

                  Set a strong password for secure access.

                </p>


              </div>


            </div>







            <div className="flex gap-4">


              <div className="h-12 w-12 rounded-xl bg-green-600 text-white flex items-center justify-center text-xl">

                🚀

              </div>



              <div>


                <h3 className="font-semibold text-lg">

                  Start Using PharmaGuard

                </h3>



                <p className="text-slate-500">

                  Access blockchain verification and inventory management.

                </p>


              </div>


            </div>





          </div>



        </div>







        {/* RIGHT SECTION */}




        <Card className="rounded-3xl p-10 shadow-2xl">



          <div className="text-center">


            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 text-4xl">

              🎉

            </div>




            <h2 className="text-3xl font-bold">

              Activate Account

            </h2>




            <p className="mt-3 text-slate-500">

              Create your password to finish activating your account.

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

              value={confirmPassword}

              onChange={(e) =>
                setConfirmPassword(
                  e.target.value,
                )
              }

            />



          </div>







          <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-4">


            <h3 className="font-semibold text-teal-800">

              Security Recommendation

            </h3>




            <p className="mt-2 text-sm leading-6 text-slate-600">

              Choose a strong password with uppercase letters, lowercase letters, numbers and special characters to protect your account.

            </p>


          </div>







          <Button

            className="mt-6 w-full py-3"

            disabled={loading}

            onClick={activate}

          >


            {loading

              ? 'Activating...'

              : 'Activate Account'

            }


          </Button>







          <div className="mt-6 text-center text-slate-600">


            Already activated?



            <button

              onClick={() =>
                navigate('/login')
              }

              className="ml-2 font-semibold text-teal-700 hover:underline"

            >

              Login

            </button>



          </div>





        </Card>





      </div>



    </div>

  );

}