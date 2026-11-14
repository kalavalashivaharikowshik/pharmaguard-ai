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
  registrationService,
} from '../services/registrationService';


export default function Register() {

  const navigate =
    useNavigate();


  const [
    organizationName,
    setOrganizationName,
  ] =
    useState('');


  const [
    contactPerson,
    setContactPerson,
  ] =
    useState('');


  const [
    email,
    setEmail,
  ] =
    useState('');


  const [
    phone,
    setPhone,
  ] =
    useState('');


  const [
    address,
    setAddress,
  ] =
    useState('');


  const [
    licenseNumber,
    setLicenseNumber,
  ] =
    useState('');


  const [
    role,
    setRole,
  ] =
    useState('MANUFACTURER');


  const [
    loading,
    setLoading,
  ] =
    useState(false);



  const handleSubmit =
    async () => {

      try {

        setLoading(true);


        await registrationService.submit({

          organizationName,

          contactPerson,

          email,

          phone,

          address,

          licenseNumber,

          role,

        });



        alert(
          'Registration submitted successfully.\n\nYour application is pending administrator approval.',
        );


        navigate('/login');


      } catch (error: any) {


        alert(

          error?.response?.data?.message ||

          'Registration failed.',

        );


      } finally {


        setLoading(false);


      }

    };



  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-cyan-50 to-teal-100 flex items-center justify-center px-6 py-12">


      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-10 items-center">



        {/* LEFT SIDE */}


        <div className="hidden lg:block">


          <p className="uppercase tracking-[0.3em] text-sm font-semibold text-teal-700">

            PHARMAGUARD AI

          </p>



          <h1 className="mt-5 text-5xl font-bold leading-tight text-slate-900">

            Join the Trusted Pharmaceutical Network

          </h1>



          <p className="mt-6 text-lg leading-8 text-slate-600">

            Register your organization to securely manufacture, distribute and verify medicines using blockchain technology and AI-powered monitoring.

          </p>




          <div className="mt-10 space-y-5">



            <div className="flex gap-4">


              <div className="h-12 w-12 rounded-xl bg-teal-600 text-white flex items-center justify-center text-xl">

                ✓

              </div>



              <div>


                <h3 className="font-semibold text-lg">

                  Blockchain Verification

                </h3>


                <p className="text-slate-500">

                  Immutable pharmaceutical records.

                </p>


              </div>


            </div>





            <div className="flex gap-4">


              <div className="h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl">

                ✓

              </div>



              <div>


                <h3 className="font-semibold text-lg">

                  AI Compliance

                </h3>


                <p className="text-slate-500">

                  Real-time recall and safety monitoring.

                </p>


              </div>


            </div>





            <div className="flex gap-4">


              <div className="h-12 w-12 rounded-xl bg-green-600 text-white flex items-center justify-center text-xl">

                ✓

              </div>



              <div>


                <h3 className="font-semibold text-lg">

                  Enterprise Security

                </h3>


                <p className="text-slate-500">

                  Trusted by manufacturers, regulators and pharmacies.

                </p>


              </div>


            </div>



          </div>


        </div>






        {/* RIGHT SIDE */}


        <Card className="rounded-3xl p-10 shadow-2xl">


          <div className="text-center mb-8">


            <div className="mx-auto mb-5 h-20 w-20 rounded-full bg-teal-100 flex items-center justify-center text-4xl">

              💊

            </div>



            <h2 className="text-3xl font-bold">

              Organization Registration

            </h2>



            <p className="mt-2 text-slate-500">

              Complete the form below to submit your application.

            </p>


          </div>





          <div className="grid md:grid-cols-2 gap-4">


            <Input

              placeholder="Organization Name"

              value={organizationName}

              onChange={(e) =>
                setOrganizationName(
                  e.target.value,
                )
              }

            />



            <Input

              placeholder="Contact Person"

              value={contactPerson}

              onChange={(e) =>
                setContactPerson(
                  e.target.value,
                )
              }

            />



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



            <Input

              placeholder="Phone Number"

              value={phone}

              onChange={(e) =>
                setPhone(
                  e.target.value,
                )
              }

            />


          </div>





          <div className="mt-4">


            <textarea

              rows={3}

              className="w-full rounded-xl border border-slate-300 p-3 focus:border-teal-600 focus:outline-none"

              placeholder="Organization Address"

              value={address}

              onChange={(e) =>
                setAddress(
                  e.target.value,
                )
              }

            />


          </div>





          <div className="grid md:grid-cols-2 gap-4 mt-4">


            <Input

              placeholder="License Number"

              value={licenseNumber}

              onChange={(e) =>
                setLicenseNumber(
                  e.target.value,
                )
              }

            />



            <select

              value={role}

              onChange={(e) =>
                setRole(
                  e.target.value,
                )
              }

              className="rounded-xl border border-slate-300 p-3 focus:border-teal-600 focus:outline-none"

            >


              <option value="MANUFACTURER">

                Manufacturer

              </option>


              <option value="DISTRIBUTOR">

                Distributor

              </option>


              <option value="PHARMACY">

                Pharmacy

              </option>


              <option value="HOSPITAL">

                Hospital

              </option>


            </select>


          </div>





          <div className="mt-6 rounded-2xl bg-teal-50 border border-teal-100 p-4">


            <h3 className="font-semibold text-teal-800">

              Registration Review

            </h3>



            <p className="mt-2 text-sm text-slate-600 leading-6">

              Your application will be reviewed by the PharmaGuard administrator. Approval normally takes 24–48 hours.

            </p>


          </div>





          <Button

            className="w-full mt-6 py-3"

            disabled={loading}

            onClick={handleSubmit}

          >

            {loading

              ? 'Submitting...'

              : 'Submit Registration'

            }

          </Button>





          <div className="mt-6 text-center text-slate-600">


            Already have an account?


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