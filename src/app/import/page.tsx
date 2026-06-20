"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CRMLayout } from '@/components/layout/crm-layout';
import { useCRM } from '@/lib/crm-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { FileJson, ListPlus, CheckCircle } from 'lucide-react';

export default function ImportPage() {
  const { bulkAddLeads, config } = useCRM();
  const router = useRouter();
  const { toast } = useToast();
  
  const [rawText, setRawText] = useState('');
  const [defaultNiche, setDefaultNiche] = useState('');
  const [defaultService, setDefaultService] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImport = () => {
    if (!rawText || !defaultNiche || !defaultService) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos e insira os dados dos leads.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Logic to parse lines like: Name | Instagram | Phone
      const lines = rawText.split('\n').filter(l => l.trim() !== '');
      const leadsToAdd = lines.map(line => {
        const parts = line.split('|').map(p => p.trim());
        return {
          name: parts[0] || 'Desconhecido',
          instagram: parts[1] || '',
          phone: parts[2] || '',
          niche: defaultNiche,
          service: defaultService,
          sentAt: new Date().toISOString().split('T')[0],
          notes: 'Importado em massa.',
        };
      });

      bulkAddLeads(leadsToAdd);
      
      toast({
        title: "Sucesso!",
        description: `${leadsToAdd.length} leads importados com sucesso.`,
      });
      
      router.push('/leads');
    } catch (e) {
      toast({
        title: "Erro na importação",
        description: "Verifique a formatação dos dados.",
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
                className="min-h-[400px] font-mono text-sm bg-secondary"
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
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nicho Padrão</Label>
                  <Select onValueChange={setDefaultNiche}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {config.niches.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Serviço Padrão</Label>
                  <Select onValueChange={setDefaultService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {config.services.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
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
