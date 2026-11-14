import {
  useEffect,
  useState,
} from 'react';

import {
  toast,
} from 'react-hot-toast';

import DashboardLayout
from '../components/layout/DashboardLayout';

import Card
from '../components/ui/Card';

import Input
from '../components/ui/Input';

import Button
from '../components/ui/Button';

import {
  userService,
} from '../services/userService';


export default function Settings() {


  const [
    profile,
    setProfile,
  ] =
    useState<any>(null);


  const [
    currentPassword,
    setCurrentPassword,
  ] =
    useState('');


  const [
    newPassword,
    setNewPassword,
  ] =
    useState('');



  useEffect(() => {


    const load =
      async () => {


        const data =
          await userService
            .getProfile();


        setProfile(
          data,
        );


      };


    load();


  }, []);




  const changePassword =
    async () => {


      try {


        const result =
          await userService
            .changePassword({

              currentPassword,

              newPassword,

            });



        toast.success(
          result.message,
        );



        setCurrentPassword('');

        setNewPassword('');



      } catch {


        toast.error(
          'Password update failed',
        );


      }


    };




  if (!profile) {

    return (

      <DashboardLayout>

        <div className="flex h-[70vh] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />

            <p className="mt-4 text-slate-500">

              Loading profile...

            </p>

          </div>

        </div>

      </DashboardLayout>

    );

  }




  return (

    <DashboardLayout>


      <div className="space-y-8">



        {/* HERO */}


        <div className="rounded-3xl bg-gradient-to-r from-[#0F766E] via-[#0D9488] to-[#14B8A6] p-8 shadow-xl">


          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">


            <div>


              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-100">

                ACCOUNT SETTINGS

              </p>



              <h1 className="mt-3 text-4xl font-bold text-white">

                Settings

              </h1>



              <p className="mt-3 max-w-2xl text-lg text-teal-100">

                Manage your profile, security settings and PharmaGuard AI account information.

              </p>


            </div>



            <div className="rounded-2xl bg-white/20 px-6 py-4 text-center backdrop-blur">


              <p className="text-sm text-teal-100">

                Platform

              </p>


              <p className="mt-2 text-3xl font-bold text-white">

                v1.0.0

              </p>


            </div>


          </div>


        </div>





        {/* KPI CARDS */}


        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">


          <Card className="border-l-4 border-teal-600">


            <p className="text-sm text-slate-500">

              Role

            </p>


            <h2 className="mt-3 text-2xl font-bold">

              {profile.role}

            </h2>


          </Card>




          <Card className="border-l-4 border-blue-600">


            <p className="text-sm text-slate-500">

              Organization

            </p>


            <h2 className="mt-3 text-xl font-bold">

              {profile.organizationName || '-'}

            </h2>


          </Card>




          <Card className="border-l-4 border-green-600">


            <p className="text-sm text-slate-500">

              Account Status

            </p>


            <h2 className="mt-3 text-2xl font-bold text-green-600">

              {profile.status}

            </h2>


          </Card>


        </div>





        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">


          {/* PROFILE */}


          <Card>


            <div className="mb-6 flex items-center gap-4">


              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-2xl font-bold text-teal-700">


                {profile.fullName.charAt(0)}


              </div>



              <div>


                <h2 className="text-2xl font-bold">

                  {profile.fullName}

                </h2>


                <p className="text-slate-500">

                  {profile.email}

                </p>


              </div>


            </div>



            <h3 className="mb-5 text-lg font-semibold">

              Profile Information

            </h3>
                      <div className="space-y-1">


              <div className="flex justify-between border-b py-3">

                <span className="font-medium text-slate-500">

                  Name

                </span>


                <span className="font-semibold">

                  {profile.fullName}

                </span>


              </div>



              <div className="flex justify-between border-b py-3">

                <span className="font-medium text-slate-500">

                  Email

                </span>


                <span className="font-semibold">

                  {profile.email}

                </span>


              </div>




              <div className="flex justify-between border-b py-3">

                <span className="font-medium text-slate-500">

                  Role

                </span>


                <span className="font-semibold">

                  {profile.role}

                </span>


              </div>




              <div className="flex justify-between border-b py-3">

                <span className="font-medium text-slate-500">

                  Organization

                </span>


                <span className="font-semibold">

                  {profile.organizationName || '-'}

                </span>


              </div>




              <div className="flex justify-between py-3">

                <span className="font-medium text-slate-500">

                  Phone

                </span>


                <span className="font-semibold">

                  {profile.phone || '-'}

                </span>


              </div>



            </div>


          </Card>





          {/* PASSWORD */}


          <Card>


            <h2 className="mb-6 text-xl font-bold">

              Security

            </h2>



            <div className="space-y-4">


              <Input

                type="password"

                placeholder="Current Password"

                value={currentPassword}

                onChange={(e) =>
                  setCurrentPassword(
                    e.target.value,
                  )
                }

              />



              <Input

                type="password"

                placeholder="New Password"

                value={newPassword}

                onChange={(e) =>
                  setNewPassword(
                    e.target.value,
                  )
                }

              />



              <Button

                className="w-full py-3"

                onClick={
                  changePassword
                }

              >

                Update Password

              </Button>



            </div>


          </Card>



        </div>





        {/* SYSTEM INFORMATION */}


        <Card>


          <h2 className="mb-6 text-xl font-bold">

            System Information

          </h2>



          <div className="space-y-1">



            <div className="flex justify-between border-b py-3">

              <span className="text-slate-500">

                Version

              </span>


              <span className="font-semibold">

                1.0.0

              </span>


            </div>




            <div className="flex justify-between border-b py-3">

              <span className="text-slate-500">

                Environment

              </span>


              <span className="font-semibold">

                Development

              </span>


            </div>




            <div className="flex justify-between py-3">

              <span className="text-slate-500">

                Blockchain

              </span>


              <span className="font-semibold text-green-600">

                Connected

              </span>


            </div>



          </div>


        </Card>



      </div>


    </DashboardLayout>

  );

}