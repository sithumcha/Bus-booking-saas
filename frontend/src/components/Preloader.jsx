import React, { useEffect, useState } from 'react';
import { Bus } from 'lucide-react';

const Preloader = ({ onComplete }) => {
  const [stage, setStage] = useState(0); // 0: loading, 1: fading out

  useEffect(() => {
    // Stage 0 -> 1 after 1.5 seconds
    const timer1 = setTimeout(() => {
      setStage(1);
    }, 1500);

    // Stage 1 -> unmount after 2 seconds
    const timer2 = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-dark flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${stage === 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
    >
      <div className="relative">
        <div className="absolute -inset-4 bg-secondary/20 rounded-full blur-xl animate-pulse-soft"></div>
        <div className="bg-secondary text-dark p-6 rounded-3xl shadow-[0_0_50px_rgba(250,204,21,0.3)] relative z-10 animate-bounce">
          <Bus className="w-16 h-16 stroke-[2]" />
        </div>
      </div>
      
      <div className="mt-8 flex flex-col items-center">
        <h1 className="text-4xl font-heading font-black text-white tracking-tight flex items-center">
          Bus<span className="text-secondary">SaaS</span>
        </h1>
        <div className="mt-4 flex gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
