import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../utils/supabase';

export const AuthComponent = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-[500px]">
      <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-[50rem] space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            🐔 ChickenCare
          </h2>
          <p className="mt-1 text-center text-lg font-medium text-indigo-600">
            Egg-ceptional flock management
          </p>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage your flock
          </p>
        </div>
        <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-lg shadow-md">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#10b981',
                    brandAccent: '#059669',
                  },
                },
              },
            }}
            providers={['google']}
            redirectTo={`${window.location.origin}/`}
          />
        </div>
      </div>
    </div>
  );
};
