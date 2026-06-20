"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CRMLayout } from '@/components/layout/crm-layout';
import { useCRM } from '@/lib/crm-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ListPlus, CheckCircle } from 'lucide-react';

export default function ImportPage() {
  const { bulkAddLeads } = useCRM();
  const router = useRouter();
  const { toast } = useToast();
  
  const [rawText, setRawText] = useState('');
  const [defaultNiche, setDefaultNiche] = useState('');
  const [defaultService, setDefaultService] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImport = () => {
    if (!rawText || !defaultNiche || !defaultService) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, defina o nicho e serviço padrão, além de colar os dados dos leads.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const lines = rawText.split('\n').filter(l => l.trim() !== '');
      const leadsToAdd = lines.map(line => {
        const parts = line.split('|').map(p => p.trim());
        return {
          name: parts[0] || 'Desconhecido',
          instagram: parts[1] || '',
          phone: parts[2] || '',
          // Aplica o valor da linha se existir, caso contrário usa o padrão manual
          niche: parts[3] || defaultNiche,
          service: parts[4] || defaultService,
          sentAt: new Date().toISOString().split('T')[0],
          notes: 'Importado em massa.',
        };
      });

      bulkAddLeads(leadsToAdd);
      
      toast({
        title: "Importação concluída",
        description: `${leadsToAdd.length} leads foram adicionados com os padrões: ${defaultNiche} / ${defaultService}.`,
      });
      
      router.push('/leads');
    } catch (e) {
      toast({
        title: "Erro na importação",
        description: "Verifique se a formatação dos dados segue o padrão: Nome | Instagram | WhatsApp",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <CRMLayout>
      <div className="p-8 max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-headline font-bold">Importação em Massa</h2>
          <p className="text-muted-foreground">Adicione centenas de leads de uma só vez colando sua lista.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListPlus className="w-5 h-5 text-primary" />
                Dados dos Leads
              </CardTitle>
              <CardDescription>
                Cole os dados no formato: <strong>Nome | Instagram | WhatsApp</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                className="min-h-[400px] font-mono text-sm bg-secondary border-border focus-visible:ring-primary"
                placeholder="Exemplo:&#10;João Silva | @joao_trafego | 11999999999&#10;Maria Oliveira | @maria.mkt | 21988888888"
                value={rawText}
                onChange={e => setRawText(e.target.value)}
              />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Configurações Base</CardTitle>
                <CardDescription>Estes valores serão aplicados a todos os leads desta lista.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default-niche">Nicho Padrão</Label>
                  <Input 
                    id="default-niche"
                    placeholder="Ex: Academia, Estética, Clínica..." 
                    className="bg-secondary border-border focus-visible:ring-primary"
                    value={defaultNiche}
                    onChange={e => setDefaultNiche(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-service">Serviço Padrão</Label>
                  <Input 
                    id="default-service"
                    placeholder="Ex: Tráfego Pago, Social Media..." 
                    className="bg-secondary border-border focus-visible:ring-primary"
                    value={defaultService}
                    onChange={e => setDefaultService(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Button 
              className="w-full bg-primary text-white h-12 text-lg font-bold shadow-lg shadow-primary/20"
              onClick={handleImport}
              disabled={isProcessing}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Processar Importação
            </Button>
          </div>
        </div>
      </div>
    </CRMLayout>
  );
}
