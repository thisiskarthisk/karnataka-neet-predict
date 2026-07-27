'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { Card } from '@/components/CommonUI';

export default function ThankYouPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const totalDuration = 5; // Total redirect time in seconds

  /* useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const timeout = setTimeout(() => {
      router.push('/');
    }, totalDuration * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [router]); */

  // Calculate percentage width for the progress bar
  const progressWidth = (countdown / totalDuration) * 100;

  return (
    <div className="relative min-h-screen bg-slate-50 flex items-center justify-center p-4 overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-500 ease-out">
        {/* Soft outer ring for a high-end feel */}
        <div className="absolute inset-0 bg-white/40 rounded-[32px] scale-[1.02] -z-10 blur-[2px]" />
        
        <Card className="w-full bg-white/90 backdrop-blur-md border border-slate-100 p-8 sm:p-10 shadow-[0_20px_50px_rgba(15,23,42,0.08)] text-center rounded-[32px]">
          {/* Animated Success Icon Container */}
          <div className="relative w-20 h-20 mx-auto mb-8 flex items-center justify-center">
            {/* Pulsing outer ring */}
            <div className="absolute inset-0 rounded-3xl bg-emerald-100/50 animate-ping opacity-75 duration-1000" />
            
            {/* Inner ring & Icon */}
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-50 to-emerald-100/60 border border-emerald-200/50 flex items-center justify-center text-emerald-600 shadow-sm">
              <CheckCircle className="w-10 h-10 stroke-[2.25]" />
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
            Request Submitted!
          </h1>
          
          <p className="text-sm sm:text-base text-slate-500 font-medium mb-10 leading-relaxed max-w-xs mx-auto">
            Thank you for reaching out to <span className="font-semibold text-slate-800">Campus Continents</span>. Our expert medical admission counsellors have been notified and will contact you shortly.
          </p>

          {/* Interactive Countdown Progress Bar */}
          {/* <div className="pt-8 border-t border-slate-100/80">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">
              Redirecting to home in <span className="text-indigo-600 font-extrabold text-sm">{countdown}s</span>
            </p>

            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${progressWidth}%` }}
              />
            </div>
          </div> */}
        </Card>
      </div>
    </div>
  );
}