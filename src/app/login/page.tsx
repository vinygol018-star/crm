"use client";

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth, useIsFirebaseConfigured } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Lock, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function LoginPage() {
  const auth = useAuth();
  const isConfigured = useIsFirebaseConfigured();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      toast({ 
        title: "Erro de Configuração", 
        description: "O Firebase não está configurado corretamente.", 
        variant: "destructive" 
      });
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Bem-vindo!", description: "Acesso autorizado com sucesso." });
      router.push('/');
    } catch (error: any) {
      toast({ 
        title: "Erro de Acesso", 
        description: "E-mail ou senha incorretos.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0C0E] p-4 font-body">
      <Card className="w-full max-w-md bg-card border-border shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <Lock className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-3xl font-headline font-bold">FluxFlow CRM</CardTitle>
          <CardDescription>Acesse sua operação comercial</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isConfigured && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="font-bold">Configuração Pendente</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                As variáveis <strong>NEXT_PUBLIC_FIREBASE_*</strong> não foram encontradas no ambiente. 
                Configure o arquivo <code>.env.local</code> para habilitar o login.
              </AlertDescription>
            </Alert>
          )}

          {isConfigured && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex gap-3 items-start">
              <Info className="w-4 h-4 text-primary mt-0.5" />
              <p className="text-[10px] text-muted-foreground">
                Utilize as credenciais que você cadastrou no menu <strong>Authentication</strong> do seu Firebase Console para entrar.
              </p>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="exemplo@agencia.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-secondary/50 border-border focus-visible:ring-primary"
                disabled={!isConfigured}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-secondary/50 border-border focus-visible:ring-primary"
                disabled={!isConfigured}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary text-white font-bold h-11 text-lg" 
              disabled={isLoading || !isConfigured}
            >
              {isLoading ? "Autenticando..." : "Acessar Sistema"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
