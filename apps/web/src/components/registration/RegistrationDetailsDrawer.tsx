import {
  useEffect,
  useState,
} from 'react';

import type {
  Registration,
} from '../../types/registration';

import {
  registrationService,
} from '../../services/registrationService';

import Card from '../ui/Card';
import Button from '../ui/Button';

import ConfirmationModal from '../common/ConfirmationModal';


interface Props {

  registration: Registration | null;

  onClose: () => void;

  onUpdated: () => void;

}


export default function RegistrationDetailsDrawer({

  registration,

  onClose,

  onUpdated,

}: Props) {


  const [
    reason,
    setReason,
  ] = useState('');

  const [
    showRejectModal,
    setShowRejectModal,
  ] = useState(false);


  const [
    documents,
    setDocuments,
  ] = useState<any[]>([]);



  useEffect(() => {

    if (!registration) {
      return;
    }


    registrationService
      .getDocuments(
        registration.id,
      )
      .then(
        setDocuments,
      );


  }, [registration]);



  if (!registration) {
    return null;
  }



  const approve =
    async () => {

      await registrationService.approve(
        registration.id,
      );

      onUpdated();

      onClose();

    };



  const reject =
    async () => {


      if (!reason) {

        alert(
          'Enter rejection reason.',
        );

        return;

      }


      await registrationService.reject(

        registration.id,

        reason,

      );


      onUpdated();

      onClose();

    };



  return (


    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">


      <div className="h-full w-full max-w-3xl overflow-y-auto bg-slate-100 shadow-2xl">



        {/* HEADER */}


        <div className="sticky top-0 z-20 border-b border-slate-200 bg-white px-8 py-6">


          <div className="flex items-start justify-between">


            <div>


              <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal-600">

                REGISTRATION REQUEST

              </p>



              <h2 className="mt-2 text-3xl font-bold text-slate-900">

                {registration.organizationName}

              </h2>



              <p className="mt-2 text-slate-500">

                {registration.contactPerson}

              </p>


            </div>



            <button

              onClick={onClose}

              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"

            >

              ✕

            </button>


          </div>




          <div className="mt-5">


            <span

              className={`rounded-full px-4 py-2 text-sm font-semibold

              ${
                registration.status === 'APPROVED'
                  ? 'bg-green-100 text-green-700'
                  : registration.status === 'REJECTED'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }

              `}

            >

              {registration.status}

            </span>


          </div>


        </div>





        {/* BODY */}


        <div className="space-y-6 p-8">



          <Section title="Organization Information">


            <Field

              label="Organization"

              value={
                registration.organizationName
              }

            />


            <Field

              label="Contact Person"

              value={
                registration.contactPerson
              }

            />


            <Field

              label="Email"

              value={
                registration.email
              }

            />


            <Field

              label="Phone"

              value={
                registration.phone || '-'
              }

            />


            <Field

              label="Address"

              value={
                registration.address || '-'
              }

            />


            <Field

              label="License Number"

              value={
                registration.licenseNumber
              }

            />


            <Field

              label="Requested Role"

              value={
                registration.role
              }

            />


            <Field

              label="Current Status"

              value={
                registration.status
              }

            />


          </Section>





          {registration.reviewNotes && (


            <Card className="rounded-3xl border-0 shadow-lg">


              <h3 className="mb-4 text-xl font-bold text-slate-900">

                Review Notes

              </h3>



              <div className="rounded-2xl bg-slate-50 p-5 leading-7 text-slate-700">


                {registration.reviewNotes}


              </div>


            </Card>


          )}







          {/* DOCUMENTS */}



          <Card className="rounded-3xl border-0 shadow-lg">


            <h3 className="mb-5 text-xl font-bold text-slate-900">

              Uploaded Documents

            </h3>



            <div className="space-y-4">


              {
                documents.length === 0

                ?


                (

                  <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">

                    No documents uploaded.

                  </div>


                )


                :


                (

                  documents.map(
                    document => (

                      <a

                        key={document.id}

                        href={
                          `http://localhost:3000${document.fileUrl}`
                        }

                        target="_blank"

                        rel="noreferrer"

                        className="block rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-teal-500 hover:bg-white"

                      >


                        <p className="font-semibold text-slate-900">

                          {
                            document.documentType
                              .replaceAll(
                                '_',
                                ' ',
                              )
                          }

                        </p>



                        <p className="mt-1 text-sm text-slate-500">

                          {
                            document.fileName
                          }

                        </p>


                      </a>


                    ),
                  )

                )

              }


            </div>


          </Card>







          {/* APPROVAL */}



          {
            registration.status === 'PENDING' && (


              <Card className="rounded-3xl border-0 shadow-lg">


                <h3 className="mb-5 text-xl font-bold text-slate-900">

                  Review Decision

                </h3>




                <textarea

                  rows={5}

                  value={reason}

                  onChange={(e) =>
                    setReason(
                      e.target.value,
                    )
                  }

                  placeholder="Enter rejection reason (required if rejecting)..."

                  className="w-full rounded-2xl border border-slate-300 p-4 focus:border-teal-600 focus:outline-none"

                />





                <div className="mt-6 flex justify-end gap-4">


                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (!reason.trim()) {
                        alert('Enter rejection reason.');
                        return;
                      }

                      setShowRejectModal(true);
                    }}
                  >
                    Reject
                  </Button>





                  <Button

                    onClick={approve}

                  >

                    Approve Registration

                  </Button>



                </div>


              </Card>


            )

          }



        </div>

        <ConfirmationModal
          open={showRejectModal}
          title="Reject Registration"
          message={`Are you sure you want to reject ${registration.organizationName}?`}
          confirmText="Reject"
          cancelText="Cancel"
          onCancel={() => setShowRejectModal(false)}
          onConfirm={async () => {
            setShowRejectModal(false);
            await reject();
          }}
        />


      </div>


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

}: {

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