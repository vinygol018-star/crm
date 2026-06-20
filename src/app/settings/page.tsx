"use client";

import { CRMLayout } from '@/components/layout/crm-layout';
import { useCRM } from '@/lib/crm-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Trash2, 
  Save,
  Building,
  Target,
  Briefcase
} from 'lucide-react';

export default function SettingsPage() {
  const { config } = useCRM();

  return (
    <CRMLayout>
      <div className="p-8 max-w-4xl mx-auto w-full space-y-8">
        <div>
          <h2 className="text-3xl font-headline font-bold">Configurações</h2>
          <p className="text-muted-foreground">Customize as etapas e preferências da sua operação.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building className="w-5 h-5 text-primary" />
                Informações da Operação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da Agência / Operação</Label>
                <Input defaultValue={config.operationName} className="bg-secondary" />
              </div>
              <div className="space-y-2">
                <Label>Valor Padrão de Serviço (R$)</Label>
                <Input type="number" defaultValue={config.defaultServiceValue} className="bg-secondary" />
              </div>
              <Button className="w-full bg-primary text-white">Salvar Alterações</Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-primary" />
                Niches
              </CardTitle>
              <CardDescription>Mercados que você costuma abordar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Adicionar nicho..." className="bg-secondary" />
                <Button size="icon"><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {config.niches.map(n => (
                  <Badge key={n} variant="secondary" className="pl-3 pr-1 py-1 gap-2 border border-border">
                    {n}
                    <Button variant="ghost" size="icon" className="w-4 h-4 p-0 text-muted-foreground hover:text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="w-5 h-5 text-primary" />
                Serviços Oferecidos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Adicionar serviço..." className="bg-secondary" />
                <Button size="icon"><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="flex flex-col gap-2">
                {config.services.map(s => (
                  <div key={s} className="flex items-center justify-between p-2 rounded-lg bg-secondary border border-border">
                    <span className="text-sm">{s}</span>
                    <Button variant="ghost" size="icon" className="w-6 h-6 text-muted-foreground hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CRMLayout>
  );
}

// Minimal Badge helper locally since types are dynamic here
function Badge({ children, variant, className }: any) {
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </div>
  );
}
