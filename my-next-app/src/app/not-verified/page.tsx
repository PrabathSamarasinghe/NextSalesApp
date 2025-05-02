'use client';
import React from 'react';
import { AlertCircle, LogOut, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Updated import for Next.js 13+

const NotVerifiedPage: React.FC = () => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'with-credentials': 'true',
        },
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      // Redirect to login page after successful logout
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Account Not Verified
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Your account is currently not verified. Please contact the administrator to get your account verified.
            </p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center justify-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                isLoggingOut ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  OK, Log Me Out
                </>
              )}
            </button>

            <div className="mt-4 text-sm text-gray-500">
              <p>If you believe this is an error, please contact support.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotVerifiedPage;