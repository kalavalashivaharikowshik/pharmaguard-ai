import Card from '../ui/Card';
import Button from '../ui/Button';

interface Props {

  open: boolean;

  title: string;

  message: string;

  confirmText?: string;

  cancelText?: string;

  onConfirm: () => void;

  onCancel: () => void;

}


export default function ConfirmationModal({

  open,

  title,

  message,

  confirmText = 'Confirm',

  cancelText = 'Cancel',

  onConfirm,

  onCancel,

}: Props) {


  if (!open) {

    return null;

  }


  return (

    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/60
        backdrop-blur-sm
        px-6
      "
    >


      <Card
        className="
          w-full
          max-w-md
          rounded-3xl
          border-0
          shadow-2xl
        "
      >


        {/* HEADER */}

        <div className="
          flex
          items-center
          gap-4
        ">


          <div className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-red-100
            text-3xl
          ">

            ⚠️

          </div>



          <div>


            <p className="
              text-xs
              font-bold
              uppercase
              tracking-[0.3em]
              text-red-600
            ">

              CONFIRM ACTION

            </p>



            <h2 className="
              mt-1
              text-2xl
              font-bold
              text-slate-900
            ">

              {title}

            </h2>


          </div>


        </div>





        {/* MESSAGE */}


        <div className="
          mt-6
          rounded-2xl
          border
          border-slate-200
          bg-slate-50
          p-5
        ">


          <p className="
            leading-7
            text-slate-600
          ">

            {message}

          </p>


        </div>





        {/* WARNING */}


        <div className="
          mt-6
          rounded-2xl
          border
          border-red-100
          bg-red-50
          p-4
        ">


          <p className="
            text-sm
            text-red-700
          ">

            This action may affect system records. Please confirm before continuing.

          </p>


        </div>





        {/* FOOTER */}


        <div className="
          mt-8
          flex
          justify-end
          gap-4
          border-t
          border-slate-200
          pt-6
        ">


          <Button

            variant="secondary"

            onClick={onCancel}

          >

            {cancelText}

          </Button>




          <Button

            onClick={onConfirm}

            className="
              bg-red-600
              hover:bg-red-700
            "

          >

            {confirmText}

          </Button>


        </div>



      </Card>


    </div>

  );

}