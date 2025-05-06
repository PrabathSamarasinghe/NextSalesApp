import { useState, useEffect } from 'react';

export default function EnhancedLoadingScreen() {
  // State for pulse animation
  const [opacity, setOpacity] = useState(0.6);
  
  // Create subtle pulsing effect
  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity(prev => prev === 0.6 ? 0.9 : 0.6);
    }, 1200);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      {/* Main loader container */}
      <div className="relative">
        {/* Outer pulsing circle */}
        <div 
          className="absolute inset-0 rounded-full bg-gray-100 animate-ping"
          style={{ 
            opacity: opacity,
            animationDuration: '2s',
          }}
        ></div>
        
        {/* Spinning loader */}
        <svg
          className="relative z-10 animate-spin h-16 w-16 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            fill="none"
            strokeWidth="3"
            stroke="currentColor"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8V2.5a9.5 9.5 0 1 0 9.5 9.5H20a8 8 0 0 1-16 0z"
          ></path>
        </svg>
      </div>
      
      {/* Loading text */}
      <div className="mt-6 text-gray-600 font-medium text-lg tracking-wider">
        <span className="inline-block animate-pulse">Loading</span>
        <span className="inline-block ml-1 animate-bounce delay-100">.</span>
        <span className="inline-block ml-1 animate-bounce delay-200">.</span>
        <span className="inline-block ml-1 animate-bounce delay-300">.</span>
      </div>
    </div>
  );
}