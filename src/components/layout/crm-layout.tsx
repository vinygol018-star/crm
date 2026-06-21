"use client";

import { useUser, useIsFirebaseConfigured } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CRMSidebar } from './crm-sidebar';
import { useCRM } from '@/lib/crm-context';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Terminal } from 'lucide-react';

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

  // Se o Firebase não estiver configurado, mostra um aviso em vez de travar
  if (!isConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0C0E] p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Firebase não configurado</AlertTitle>
            <AlertDescription>
              A persistência de dados está desativada. Adicione suas credenciais no arquivo <code>.env.local</code> para continuar.
            </AlertDescription>
          </Alert>
          <div className="bg-card p-6 rounded-xl border border-border space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary" />
              Instruções de Configuração
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
              <li>Crie um projeto no <strong>Firebase Console</strong>.</li>
              <li>Ative o <strong>Firestore Database</strong> e o <strong>Authentication</strong> (E-mail/Senha).</li>
              <li>Copie as chaves do SDK Web para o arquivo <code>.env.local</code>.</li>
              <li>Reinicie o servidor de desenvolvimento.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Mostra o spinner apenas enquanto a autenticação está sendo verificada
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0C0E] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se não estiver logado e estiver configurado, o useEffect cuidará do redirect.
  // Enquanto isso, retornamos nulo ou o children se você quiser permitir acesso offline (não recomendado por segurança).
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
