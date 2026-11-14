import type {
  Batch,
} from '../../types/batch';

import Card
from '../ui/Card';


interface Props {

  batch: Batch | null;

  onClose: () => void;

}



export default function BatchDetailsDrawer({

  batch,

  onClose,

}: Props) {


  if (!batch) return null;



  return (

    <div
      className="
        fixed
        inset-0
        z-50
        flex
        justify-end
        bg-black/60
        backdrop-blur-sm
      "
    >


      <div
        className="
          h-full
          w-full
          max-w-3xl
          overflow-y-auto
          bg-slate-100
          shadow-2xl
        "
      >


        {/* HEADER */}

        <div
          className="
            sticky
            top-0
            z-20
            bg-gradient-to-r
            from-[#0F766E]
            via-[#0D9488]
            to-[#14B8A6]
            px-8
            py-8
            text-white
            shadow-lg
          "
        >


          <div
            className="
              flex
              items-start
              justify-between
            "
          >


            <div>


              <p
                className="
                  text-sm
                  font-semibold
                  uppercase
                  tracking-[0.3em]
                  text-teal-100
                "
              >

                BATCH DETAILS

              </p>



              <h2
                className="
                  mt-3
                  text-4xl
                  font-bold
                "
              >

                {batch.drugName}

              </h2>



              <p
                className="
                  mt-2
                  text-lg
                  text-teal-100
                "
              >

                {batch.batchNumber}

              </p>


            </div>




            <button

              onClick={onClose}

              className="
                rounded-xl
                bg-white/20
                px-4
                py-2
                text-xl
                transition
                hover:bg-white/30
              "

            >

              ✕

            </button>


          </div>




          <div className="mt-6">


            <span

              className={`

                rounded-full

                px-5

                py-2

                text-sm

                font-semibold

                shadow


                ${
                  batch.status === 'ACTIVE'

                  ? 'bg-green-100 text-green-700'

                  : batch.status === 'REVOKED'

                  ? 'bg-red-100 text-red-700'

                  : 'bg-amber-100 text-amber-700'

                }

              `}

            >

              {batch.status}

            </span>


          </div>


        </div>




        <div
          className="
            space-y-6
            p-8
          "
        >


          {/* GENERAL */}

          <Section title="General Information">


            <Field

              label="Drug Name"

              value={batch.drugName}

            />



            <Field

              label="Batch Number"

              value={batch.batchNumber}

            />



            <Field

              label="Manufacturer"

              value={batch.manufacturer.name}

            />



            <Field

              label="Quantity"

              value={String(batch.quantity)}

            />


          </Section>





          {/* LIFECYCLE */}

          <Section title="Lifecycle Information">


            <Field

              label="Manufacture Date"

              value={
                new Date(
                  batch.manufactureDate,
                ).toLocaleDateString()
              }

            />



            <Field

              label="Expiry Date"

              value={
                new Date(
                  batch.expiryDate,
                ).toLocaleDateString()
              }

            />



            <Field

              label="Created At"

              value={
                new Date(
                  batch.createdAt,
                ).toLocaleString()
              }

            />


          </Section>





          {/* QR */}

          <Section title="QR Information">


            <Field

              label="QR Code"

              value={
                batch.qrCode ??
                'Not Generated'
              }

            />


          </Section>
                  {/* BLOCKCHAIN */}

          <Section title="Blockchain Information">


            <Field

              label="Status"

              value={
                batch.blockchainHash
                  ? 'Registered'
                  : 'Not Registered'
              }

            />



            <HashField

              label="Blockchain Hash"

              value={
                batch.blockchainHash ??
                'Not Registered'
              }

            />



            <HashField

              label="Transaction Hash"

              value={
                batch.transactionHash ??
                'Not Available'
              }

            />


          </Section>


        </div>


      </div>


    </div>

  );

}





function Section({

  title,

  children,

}: {

  title: string;

  children: React.ReactNode;

}) {


  return (

    <Card>


      <div
        className="
          mb-6
          flex
          items-center
          justify-between
        "
      >


        <h3
          className="
            text-xl
            font-bold
            text-slate-900
          "
        >

          {title}

        </h3>



        <div
          className="
            ml-5
            h-px
            flex-1
            bg-slate-200
          "
        />


      </div>




      <div
        className="
          grid
          grid-cols-2
          gap-6
        "
      >

        {children}

      </div>


    </Card>

  );

}





function Field({

  label,

  value,

}: {

  label: string;

  value: string;

}) {


  return (

    <div
      className="
        rounded-xl
        border
        border-slate-200
        bg-slate-50
        p-4
      "
    >


      <p
        className="
          text-xs
          font-semibold
          uppercase
          tracking-wide
          text-slate-500
        "
      >

        {label}

      </p>



      <p
        className="
          mt-2
          text-base
          font-semibold
          text-slate-900
        "
      >

        {value}

      </p>


    </div>

  );

}





function HashField({

  label,

  value,

}: {

  label: string;

  value: string;

}) {


  return (

    <div
      className="
        col-span-2
      "
    >


      <p
        className="
          mb-2
          text-xs
          font-semibold
          uppercase
          tracking-wide
          text-slate-500
        "
      >

        {label}

      </p>




      <div
        className="
          rounded-xl
          border
          border-slate-200
          bg-slate-900
          p-4
        "
      >


        <p
          className="
            break-all
            font-mono
            text-xs
            text-emerald-400
          "
        >

          {value}

        </p>


      </div>


    </div>

  );

}