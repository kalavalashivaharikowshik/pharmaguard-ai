import type {
  Revocation,
} from '../../types/revocation';

import Card from '../ui/Card';

interface Props {
  revocation:
    Revocation | null;

  onClose: () => void;
}

export default function RevocationDetailsDrawer({
  revocation,
  onClose,
}: Props) {

  if (!revocation) {
    return null;
  }

  const reasonColors = {

    RECALL_COMPLETED:
      'bg-purple-100 text-purple-700',

    TAMPER_DETECTED:
      'bg-red-100 text-red-700',

    EXPIRED:
      'bg-orange-100 text-orange-700',

    MANUAL_TEST:
      'bg-slate-100 text-slate-700',

  };

  const statusConfig = {

    RECALL_COMPLETED: {

      panel:
        'bg-purple-50 border-purple-200',

      title:
        'Recall Completed',

      text:
        'This batch was revoked after a completed recall process. Distribution and sale are no longer permitted.',

    },

    TAMPER_DETECTED: {

      panel:
        'bg-red-50 border-red-200',

      title:
        'Tamper Detected',

      text:
        'Blockchain verification detected possible tampering. This batch has been quarantined for safety.',

    },

    EXPIRED: {

      panel:
        'bg-orange-50 border-orange-200',

      title:
        'Expired Product',

      text:
        'This batch has passed its expiry date and has been automatically removed from circulation.',

    },

    MANUAL_TEST: {

      panel:
        'bg-slate-50 border-slate-200',

      title:
        'Manual Revocation',

      text:
        'This batch was manually revoked for testing and validation purposes.',

    },

  };

  const currentStatus =
    statusConfig[
      revocation.revocationReason as keyof typeof statusConfig
    ];


  return (

    <div className="
      fixed
      inset-0
      z-50
      flex
      justify-end
      bg-black/60
      backdrop-blur-sm
    ">

      <div className="
        w-[700px]
        h-full
        overflow-y-auto
        bg-slate-100
        shadow-2xl
      ">


        {/* HEADER */}

        <div className="
          sticky
          top-0
          z-20
          border-b
          border-slate-200
          bg-white
          px-8
          py-6
        ">

          <div className="flex items-start justify-between">


            <div>

              <p className="
                text-xs
                font-bold
                uppercase
                tracking-[0.3em]
                text-red-600
              ">
                REVOCATION DETAILS
              </p>


              <h2 className="
                mt-2
                text-3xl
                font-bold
                text-slate-900
              ">

                {revocation.drugName}

              </h2>


              <p className="
                mt-2
                text-slate-500
              ">

                Batch {revocation.batchNumber}

              </p>


            </div>


            <button

              onClick={onClose}

              className="
                rounded-xl
                p-2
                text-slate-500
                transition
                hover:bg-slate-100
              "

            >

              ✕

            </button>


          </div>


          <div className="mt-5">

            <span

              className={`

                rounded-full

                px-4

                py-2

                text-sm

                font-semibold

                ${
                  reasonColors[
                    revocation.revocationReason as keyof typeof reasonColors
                  ] ||
                  'bg-slate-100 text-slate-700'
                }

              `}

            >

              {revocation.revocationReason}

            </span>


          </div>


        </div>



        {/* BODY */}

        <div className="space-y-6 p-8">


          <Section title="Drug Information">


            <Field

              label="Drug Name"

              value={
                revocation.drugName
              }

            />


            <Field

              label="Batch Number"

              value={
                revocation.batchNumber
              }

            />


          </Section>




          <Section title="Revocation Information">


            <Field

              label="Revocation Reason"

              value={
                revocation.revocationReason
              }

            />


            <Field

              label="Revoked Date"

              value={
                new Date(
                  revocation.revokedAt,
                ).toLocaleDateString(
                  'en-GB',
                  {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  },
                )
              }

            />


          </Section>





          <Card
            className={`
              rounded-3xl
              border
              shadow-lg
              ${currentStatus.panel}
            `}
          >


            <div className="
              flex
              items-start
              gap-4
            ">


              <div className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-white
                text-2xl
                shadow
              ">

                ⚠️

              </div>



              <div>

                <h3 className="
                  text-xl
                  font-bold
                  text-slate-900
                ">

                  {currentStatus.title}

                </h3>


                <p className="
                  mt-2
                  leading-7
                  text-slate-700
                ">

                  {currentStatus.text}

                </p>


              </div>


            </div>


          </Card>





          <Card
            className="
              rounded-3xl
              border-0
              shadow-lg
            "
          >


            <h3 className="
              mb-5
              text-xl
              font-bold
              text-slate-900
            ">

              Audit Information

            </h3>


            <Field

              label="Internal Batch Identifier"

              value={
                revocation.id
              }

            />


          </Card>



        </div>


      </div>


    </div>

  );

}





function Section({

  title,

  children,

}:{

  title:string;

  children:React.ReactNode;

}){


  return (

    <Card
      className="
        rounded-3xl
        border-0
        shadow-lg
      "
    >


      <h3 className="
        mb-6
        text-xl
        font-bold
        text-slate-900
      ">

        {title}

      </h3>



      <div className="
        grid
        grid-cols-2
        gap-6
      ">

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

}){


  return (

    <div>


      <p className="
        text-xs
        font-semibold
        uppercase
        tracking-wide
        text-slate-400
      ">

        {label}

      </p>



      <p className="
        mt-2
        break-all
        text-base
        font-semibold
        text-slate-800
      ">

        {value}

      </p>


    </div>

  );

}