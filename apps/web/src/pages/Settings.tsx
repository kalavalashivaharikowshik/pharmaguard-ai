import PreferencesPanel from '../components/settings/PreferencesPanel';
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

import { profileService } from '../services/extraServices';


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

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '', city: '', address: '' });

  const startEdit = () => {
    setForm({
      fullName: profile?.fullName ?? '',
      phone: profile?.phone ?? '',
      city: profile?.city ?? '',
      address: profile?.address ?? '',
    });
    setEditing(true);
  };

  const saveProfile = async () => {
    const phone = form.phone.trim();
    if (phone && phone.replace(/\D/g, '').length < 10) {
      toast.error('Enter a valid mobile number, e.g. 98765 43210 or +91 98765 43210');
      return;
    }
    setSaving(true);
    try {
      const updated = await profileService.update({
        fullName: form.fullName.trim() || undefined,
        phone: phone || undefined,
        city: form.city.trim() || undefined,
        address: form.address.trim() || undefined,
      });
      setProfile({ ...profile, ...updated });
      setEditing(false);
      toast.success('Profile updated');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };



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


        <div className="rounded-3xl bg-gradient-to-r from-[#0F4C81] via-[#155A94] to-[#2E8B57] p-8 shadow-xl">


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



            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Profile Information</h3>
              {!editing && (
                <button
                  onClick={startEdit}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Edit
                </button>
              )}
            </div>

            {editing && (
              <div className="mb-6 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <label className="block text-sm font-medium text-slate-600">
                  Full name
                  <Input className="mt-1" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                </label>
                <label className="block text-sm font-medium text-slate-600">
                  Mobile number (for SMS alerts)
                  <Input
                    className="mt-1"
                    type="tel"
                    placeholder="98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </label>
                <label className="block text-sm font-medium text-slate-600">
                  City
                  <Input className="mt-1" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </label>
                <label className="block text-sm font-medium text-slate-600">
                  Address
                  <Input className="mt-1" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </label>
                <div className="flex gap-3 pt-1">
                  <Button onClick={saveProfile} disabled={saving}>
                    {saving ? 'Saving…' : 'Save'}
                  </Button>
                  <Button variant="secondary" onClick={() => setEditing(false)} disabled={saving}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
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





          <div className="lg:col-span-2"><PreferencesPanel /></div>

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