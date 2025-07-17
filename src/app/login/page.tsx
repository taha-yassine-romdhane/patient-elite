import { Suspense } from 'react';
import LoginForm from './LoginForm';

// A simple loading component
function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-700">Chargement...</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginForm />
    </Suspense>
  );
}
