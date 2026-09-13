'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ApprovalsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-2">
      <div className="w-8 h-8 rounded-full border-2 border-[#4239C4] border-t-transparent animate-spin"></div>
      <p className="text-xs text-slate-500 font-medium">Redirecting to Dashboard...</p>
    </div>
  );
}
