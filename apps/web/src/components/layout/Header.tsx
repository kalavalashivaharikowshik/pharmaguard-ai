import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Bell,
  LogOut,
  Menu,
} from 'lucide-react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  socket,
} from '../../socket';

import {
  useNotifications,
} from '../../context/NotificationContext';

import {
  useAuth,
} from '../../auth/AuthContext';

import NotificationToast from '../notifications/NotificationToast';
import ThemeToggle from '../ui/ThemeToggle';
import { useLocation } from 'react-router-dom';
import { ROLE_LABEL } from '../../auth/roles';

import type {
  Notification,
} from '../../types/notification';

interface HeaderProps {

  sidebarOpen: boolean;

  toggleSidebar(): void;

}

export default function Header({

  sidebarOpen,

  toggleSidebar,

}: HeaderProps) {

  const navigate =
    useNavigate();

  const location = useLocation();
  const TITLES: Record<string, string> = {
    '/': 'Dashboard', '/ai-insights': 'AI Insights', '/assistant': 'AI Assistant', '/analytics': 'Analytics',
    '/batches': 'Batches', '/inventory': 'Inventory', '/transfers': 'Transfers', '/manufacturers': 'Manufacturers',
    '/map': 'Stock Map', '/recalls': 'Recalls', '/revocation': 'Revocation', '/disposals': 'Disposal & Returns',
    '/blockchain': 'Blockchain', '/compliance': 'Compliance', '/violations': 'Violations',
    '/notifications': 'Notifications', '/users': 'Users', '/registration': 'Registration Requests', '/settings': 'Settings',
  };
  const pageTitle = TITLES[location.pathname] ?? 'PharmaGuard AI';

  const { logout } =
    useAuth();

  const {

    unread,

    notifications,

  } =
    useNotifications();

  const [

    open,

    setOpen,

  ] =
    useState(false);

  const [

    toast,

    setToast,

  ] =
    useState<Notification | null>(
      null,
    );

  const toastTimer =
    useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );

  const user =
    JSON.parse(

      localStorage.getItem(
        'user',
      ) || '{}',

    );

  const initial =

    user?.fullName?.charAt(0)?.toUpperCase()

    ||

    user?.email?.charAt(0)?.toUpperCase()

    ||

    'U';

  useEffect(() => {

    const handler = (

      notification: Notification,

    ) => {

      setToast(
        notification,
      );

      if (

        toastTimer.current

      ) {

        clearTimeout(

          toastTimer.current,

        );

      }

      toastTimer.current =

        setTimeout(() => {

          setToast(null);

        }, 5000);

    };

    socket.on(
      'notification',
      handler,
    );

    return () => {

      socket.off(
        'notification',
        handler,
      );

    };

  }, []);

  function handleLogout() {

    logout();

    localStorage.removeItem(
      'user',
    );

    localStorage.removeItem(
      'role',
    );

    navigate('/login');

  }

  return (

<>

<header

className="

sticky

top-0

z-40

h-20

bg-white/90

backdrop-blur-md

border-b

border-slate-200

shadow-sm

flex

items-center

justify-between gap-3 px-4 sm:px-8"

>

<div

className="

flex

items-center gap-2 sm:gap-5"

>

<button

onClick={toggleSidebar}

aria-expanded={sidebarOpen}

className="

h-11

w-11

rounded-xl

border

border-slate-200

flex

items-center

justify-center

hover:bg-slate-100

transition

"

>

<Menu size={22} />

</button>

<div>

<h2

className="

text-lg sm:text-2xl font-bold text-slate-800 truncate" >{pageTitle}</h2>

<p

className="

hidden sm:block text-sm text-slate-500" >PharmaGuard AI · {ROLE_LABEL[localStorage.getItem('role') ?? ''] ?? ''}</p>

</div>

</div>

<div

className="

flex

items-center

gap-5

"

>

<ThemeToggle />

<div className="relative">

<button

onClick={()=>

setOpen(

!open,

)

}

className="

relative

h-11

w-11

rounded-xl

hover:bg-slate-100

transition

"

>

<Bell

size={24}

className="mx-auto"

/>

{

unread>0&&(

<span

className="

absolute

top-1

right-1

h-5

w-5

rounded-full

bg-red-500

text-white

text-[11px]

flex

items-center

justify-center

font-semibold

"

>

{unread}

</span>

)

}

</button>

{

open&&(

<div

className="

absolute

right-0

mt-4

w-96

bg-white

rounded-2xl

shadow-2xl

border

overflow-hidden

"

>

<div

className="

px-5

py-4

border-b

"

>

<h3

className="font-bold"

>

Notifications

</h3>

</div>

<div

className="

max-h-96

overflow-y-auto

"

>

{

notifications.length===0?

(

<div

className="

p-8

text-center

text-slate-500

"

>

No Notifications

</div>

)

:

notifications.map(

item=>(

<div

key={item.id}

className="

p-4

border-b

hover:bg-slate-50

transition

"

>

<p

className="font-semibold"

>

{item.title}

</p>

<p

className="

text-sm

text-slate-500

mt-1

"

>

{item.message}

</p>

</div>

)

)

}

</div>

<button

onClick={()=>{

setOpen(false);

navigate(

'/notifications',

);

}}

className="

w-full

py-4

font-semibold

text-teal-700

hover:bg-slate-50

"

>

View All Notifications →

</button>

</div>

)

}

</div>

<div

className="

flex

items-center

gap-4

"

>

<div

className="

hidden sm:flex h-12 w-12 shrink-0 rounded-full bg-teal-700

text-white

font-bold


items-center

justify-center

text-lg

"

>

{initial}

</div>

<div className="hidden md:block">
<p
className="font-semibold text-slate-800"
>
{user.fullName}
</p>

<p

className="

text-xs

text-slate-500

"

>

{user.role}

</p>

</div>

<button

onClick={handleLogout}

className="

flex

items-center

gap-2

bg-red-600

hover:bg-red-700

text-white

px-3 sm:px-4 py-2.5 rounded-xl transition " aria-label="Logout" >

<LogOut
size={18}
/>
<span className="hidden sm:inline">Logout</span>
</button>

</div>

</div>

</header>

{

toast&&(

<div

className="

fixed

bottom-5

right-5

z-[999]

"

>

<NotificationToast

title={toast.title}

message={toast.message}

/>

</div>

)

}

</>

);

}