import Card from '../ui/Card';

interface Props {

  title: string;

  message: string;

}


export default function NotificationToast({

  title,

  message,

}: Props) {


  return (

    <Card

      className="
        w-[380px]
        rounded-2xl
        border-0
        bg-white
        shadow-2xl
        overflow-hidden
        animate-[slideIn_0.35s_ease]
      "

    >


      <div className="
        flex
        items-start
        gap-4
        p-5
      ">


        <div
          className="
            flex
            h-12
            w-12
            flex-shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-teal-100
            text-2xl
          "
        >

          🔔

        </div>




        <div className="flex-1">


          <p
            className="
              text-xs
              font-bold
              uppercase
              tracking-[0.25em]
              text-teal-600
            "
          >

            NEW NOTIFICATION

          </p>




          <h3
            className="
              mt-1
              text-lg
              font-bold
              leading-tight
              text-slate-900
            "
          >

            {title}

          </h3>





          <p
            className="
              mt-2
              text-sm
              leading-6
              text-slate-600
            "
          >

            {message}

          </p>





          <div
            className="
              mt-4
              flex
              items-center
              gap-2
              text-xs
              font-medium
              text-slate-400
            "
          >


            <div
              className="
                h-2
                w-2
                rounded-full
                bg-green-500
                animate-pulse
              "
            />


            Just now


          </div>


        </div>


      </div>




      <div
        className="
          h-1
          bg-gradient-to-r
          from-teal-600
          via-blue-600
          to-cyan-500
        "
      />


    </Card>

  );

}