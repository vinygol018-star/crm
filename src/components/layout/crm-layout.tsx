"use client";

import { useUser, useIsFirebaseConfigured } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CRMSidebar } from './crm-sidebar';
import { useCRM } from '@/lib/crm-context';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Terminal, HelpCircle, Cloud } from 'lucide-react';

export function CRMLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const { isLoading } = useCRM();
  const isConfigured = useIsFirebaseConfigured();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && isConfigured) {
      router.push('/login');
    }
  }, [user, loading, router, isConfigured]);

  if (!isConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0C0E] p-4">
        <div className="max-w-2xl w-full space-y-4">
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">Firebase não configurado</AlertTitle>
            <AlertDescription>
              A persistência de dados está desativada. As variáveis de ambiente do Firebase não foram encontradas.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card p-6 rounded-xl border border-border space-y-4 shadow-2xl">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Terminal className="w-5 h-5 text-primary" />
                Local (.env.local)
              </h3>
              <div className="space-y-3 text-xs text-muted-foreground">
                <p>Crie o arquivo na raiz do projeto e reinicie o servidor:</p>
                <pre className="p-3 bg-secondary rounded-lg text-[9px] overflow-x-auto text-foreground border border-border">
                  NEXT_PUBLIC_FIREBASE_API_KEY=...{"\n"}
                  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...{"\n"}
                  NEXT_PUBLIC_FIREBASE_PROJECT_ID=...{"\n"}
                  NEXT_PUBLIC_FIREBASE_APP_ID=...
                </pre>
              </div>
            </div>

            <div className="bg-card p-6 rounded-xl border border-primary/20 space-y-4 shadow-2xl">
              <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                <Cloud className="w-5 h-5" />
                Produção (Netlify)
              </h3>
              <div className="space-y-3 text-xs text-muted-foreground">
                <p>Arquivos <code>.env.local</code> <strong>não funcionam</strong> em produção. Configure no painel:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Vá em <strong>Site configuration</strong></li>
                  <li><strong>Environment variables</strong></li>
                  <li>Adicione as chaves <code>NEXT_PUBLIC_FIREBASE_*</code></li>
                  <li>Faça um novo deploy (Clear cache)</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="pt-4 text-center">
            <p className="text-xs flex items-center justify-center gap-2 text-muted-foreground">
              <HelpCircle className="w-3 h-3" />
              Consulte o arquivo NETLIFY_ENV_SETUP.md na raiz do projeto para o guia completo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0C0E] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user && isConfigured) return null;

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
