import {
  useState,
} from 'react';

import {
  useNavigate,
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


export default function ForgotPassword() {


  const navigate =
    useNavigate();



  const [
    email,
    setEmail,
  ] =
    useState('');



  const [
    loading,
    setLoading,
  ] =
    useState(false);




  const submit =
    async () => {

      try {


        setLoading(true);



        await api.post(

          '/auth/forgot-password',

          {
            email,
          },

        );



        alert(

          'If the account exists, a password reset email has been sent.',

        );



        navigate('/login');



      } finally {


        setLoading(false);


      }

    };





  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-cyan-50 to-teal-100 flex items-center justify-center px-6 py-12">


      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-10 items-center">





        {/* LEFT SECTION */}



        <div className="hidden lg:block">


          <p className="uppercase tracking-[0.3em] text-sm font-semibold text-teal-700">

            ACCOUNT RECOVERY

          </p>




          <h1 className="mt-5 text-5xl font-bold leading-tight text-slate-900">

            Forgot Your Password?

          </h1>




          <p className="mt-6 text-lg leading-8 text-slate-600">

            Don't worry. Enter your registered email address and we'll send you a secure password reset link.

          </p>





          <div className="mt-10 space-y-5">





            <div className="flex gap-4">


              <div className="h-12 w-12 rounded-xl bg-teal-600 text-white flex items-center justify-center text-xl">

                🔒

              </div>



              <div>


                <h3 className="font-semibold text-lg">

                  Secure Reset

                </h3>



                <p className="text-slate-500">

                  Password reset links expire automatically.

                </p>


              </div>


            </div>







            <div className="flex gap-4">


              <div className="h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl">

                📧

              </div>



              <div>


                <h3 className="font-semibold text-lg">

                  Email Verification

                </h3>



                <p className="text-slate-500">

                  Only verified accounts can receive reset links.

                </p>


              </div>


            </div>







            <div className="flex gap-4">


              <div className="h-12 w-12 rounded-xl bg-green-600 text-white flex items-center justify-center text-xl">

                🛡️

              </div>



              <div>


                <h3 className="font-semibold text-lg">

                  Enterprise Security

                </h3>



                <p className="text-slate-500">

                  Your credentials remain fully protected.

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

              Forgot Password

            </h2>




            <p className="mt-3 text-slate-500">

              Enter your registered email address.

            </p>



          </div>







          <div className="mt-8">


            <Input


              type="email"

              placeholder="Email Address"

              value={email}

              onChange={(e) =>
                setEmail(
                  e.target.value,
                )
              }


            />


          </div>








          <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-4">


            <h3 className="font-semibold text-teal-800">

              What happens next?

            </h3>



            <p className="mt-2 text-sm leading-6 text-slate-600">

              We'll send a password reset link to your email if an account exists. Follow the instructions in the email to create a new password.

            </p>


          </div>







          <Button


            className="mt-6 w-full py-3"


            disabled={loading}


            onClick={submit}


          >


            {loading

              ? 'Sending...'

              : 'Send Reset Link'

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