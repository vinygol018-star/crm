"use client";

import { CRMSidebar } from './crm-sidebar';

export function CRMLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <CRMSidebar />
      <main className="flex-1 flex flex-col min-w-0 bg-[#0A0C0E]">
        {children}
      </main>
    </div>
  );
}
