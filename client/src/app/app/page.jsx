'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AppPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFBFA]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-[#4239C4] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-[#6C6782]">Loading Marky Command Center...</p>
      </div>
    </div>
  );
}
