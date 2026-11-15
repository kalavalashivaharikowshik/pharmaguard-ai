import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-surface)] p-6 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-600 text-white">
        <Compass size={30} />
      </div>
      <h1 className="text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-500">The page you are looking for does not exist or has moved.</p>
      <Link to="/" className="mt-6 rounded-xl bg-teal-600 px-5 py-2.5 font-medium text-white hover:bg-teal-700">
        Back to dashboard
      </Link>
    </div>
  );
}
