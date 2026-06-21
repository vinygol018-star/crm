
"use client";

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Lock } from 'lucide-react';

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

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
    <div className="min-h-screen flex items-center justify-center bg-[#0A0C0E] p-4">
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
        <CardContent>
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
                className="bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-secondary"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary text-white font-bold" 
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Acessar Sistema"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
