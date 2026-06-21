
"use client";

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CRMSidebar } from './crm-sidebar';
import { useCRM } from '@/lib/crm-context';

export function CRMLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const { isLoading } = useCRM();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0C0E] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <CRMSidebar />
      <main className="flex-1 flex flex-col min-w-0 bg-[#0A0C0E]">
        {isLoading && (
           <div className="fixed top-0 left-0 w-full h-1 bg-primary/20 z-50 overflow-hidden">
             <div className="h-full bg-primary animate-progress origin-left"></div>
           </div>
        )}
        {children}
      </main>
    </div>
  );
}
