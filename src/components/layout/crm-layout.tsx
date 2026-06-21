"use client";

import { useUser, useIsFirebaseConfigured } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { CRMSidebar } from './crm-sidebar';
import { useCRM } from '@/lib/crm-context';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Terminal, HelpCircle } from 'lucide-react';

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
        <div className="max-w-xl w-full space-y-4">
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">Firebase não configurado</AlertTitle>
            <AlertDescription>
              A persistência de dados está desativada. Adicione suas credenciais no arquivo <code>.env.local</code> para continuar.
            </AlertDescription>
          </Alert>
          
          <div className="bg-card p-8 rounded-xl border border-border space-y-6 shadow-2xl">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary" />
              Guia de Configuração Rápida
            </h3>
            
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">1</span>
                <p>Acesse o <a href="https://console.firebase.google.com/" target="_blank" className="text-primary hover:underline">Firebase Console</a> e selecione seu projeto.</p>
              </div>
              
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">2</span>
                <p>Vá em <strong>Configurações do Projeto</strong> (ícone de engrenagem) &gt; <strong>Geral</strong>.</p>
              </div>

              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">3</span>
                <p>Em "Seus Apps", crie ou selecione um <strong>App Web (&lt;/&gt;)</strong>.</p>
              </div>

              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">4</span>
                <p>Copie os valores de <code>apiKey</code>, <code>authDomain</code>, etc., do objeto <code>firebaseConfig</code>.</p>
              </div>

              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">5</span>
                <div>
                  <p>Crie o arquivo <code>.env.local</code> na raiz do projeto com o prefixo <strong>NEXT_PUBLIC_</strong>:</p>
                  <pre className="mt-2 p-3 bg-secondary rounded-lg text-[10px] overflow-x-auto text-foreground">
                    NEXT_PUBLIC_FIREBASE_API_KEY=...{"\n"}
                    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...{"\n"}
                    NEXT_PUBLIC_FIREBASE_PROJECT_ID=...{"\n"}
                    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...{"\n"}
                    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...{"\n"}
                    NEXT_PUBLIC_FIREBASE_APP_ID=...
                  </pre>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">6</span>
                <p><strong>Reinicie o servidor</strong> de desenvolvimento para aplicar as mudanças.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs flex items-center gap-2 text-muted-foreground">
                <HelpCircle className="w-3 h-3" />
                Certifique-se de ativar o Firestore e o Auth (E-mail/Senha) no painel do Firebase.
              </p>
            </div>
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
