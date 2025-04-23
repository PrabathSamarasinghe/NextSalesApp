'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    useEffect(() => {
        console.error(error);
        setTimeout(() => {
            router.push('/'); // Redirect to home page after 5 seconds
        }
        , 5000); // Adjust the timeout as needed
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-red-600 mb-4">
                    Something went wrong!
                </h2>
                <p className="text-gray-600 mb-4">
                    {error.message || 'An unexpected error occurred'}
                </p>
                <button
                    onClick={reset}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}