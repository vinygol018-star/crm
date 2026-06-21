
"use client";

import { useState, useEffect } from 'react';
import { CRMLayout } from '@/components/layout/crm-layout';
import { useCRM } from '@/lib/crm-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  Building,
  Target,
  Briefcase
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { config, saveConfig } = useCRM();
  const { toast } = useToast();
  const [localConfig, setLocalConfig] = useState(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleSave = () => {
    saveConfig(localConfig);
    toast({ title: "Configurações salvas", description: "As mudanças foram aplicadas com sucesso." });
  };

  const addNiche = (niche: string) => {
    if (!niche) return;
    setLocalConfig(prev => ({ ...prev, niches: [...prev.niches, niche] }));
  };

  const addService = (service: string) => {
    if (!service) return;
    setLocalConfig(prev => ({ ...prev, services: [...prev.services, service] }));
  };

  const removeNiche = (niche: string) => {
    setLocalConfig(prev => ({ ...prev, niches: prev.niches.filter(n => n !== niche) }));
  };

  const removeService = (service: string) => {
    setLocalConfig(prev => ({ ...prev, services: prev.services.filter(s => s !== service) }));
  };

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
                <Input 
                  value={localConfig.operationName} 
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, operationName: e.target.value }))}
                  className="bg-secondary" 
                />
              </div>
              <div className="space-y-2">
                <Label>Valor Padrão de Serviço (R$)</Label>
                <Input 
                  type="number" 
                  value={localConfig.defaultServiceValue} 
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, defaultServiceValue: parseFloat(e.target.value) }))}
                  className="bg-secondary" 
                />
              </div>
              <Button onClick={handleSave} className="w-full bg-primary text-white">Salvar Alterações</Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-primary" />
                Nichos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input id="new-niche" placeholder="Adicionar nicho..." className="bg-secondary" onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addNiche(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }} />
              </div>
              <div className="flex flex-wrap gap-2">
                {localConfig.niches.map(n => (
                  <Badge key={n} variant="secondary" className="pl-3 pr-1 py-1 gap-2 border border-border">
                    {n}
                    <Button variant="ghost" size="icon" className="w-4 h-4 p-0 text-muted-foreground hover:text-red-500" onClick={() => removeNiche(n)}>
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
                <Input placeholder="Adicionar serviço..." className="bg-secondary" onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addService(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }} />
              </div>
              <div className="flex flex-col gap-2">
                {localConfig.services.map(s => (
                  <div key={s} className="flex items-center justify-between p-2 rounded-lg bg-secondary border border-border">
                    <span className="text-sm">{s}</span>
                    <Button variant="ghost" size="icon" className="w-6 h-6 text-muted-foreground hover:text-red-500" onClick={() => removeService(s)}>
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
