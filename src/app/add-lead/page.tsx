"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CRMLayout } from '@/components/layout/crm-layout';
import { useCRM } from '@/lib/crm-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

export default function AddLeadPage() {
  const { addLead, config } = useCRM();
  const router = useRouter();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    instagram: '',
    phone: '',
    niche: '',
    service: '',
    sentAt: new Date().toISOString().split('T')[0],
    notes: '',
    potentialValue: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.niche || !formData.service) {
      toast({
        title: "Erro",
        description: "Preencha os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    addLead({
      ...formData,
      potentialValue: formData.potentialValue ? parseFloat(formData.potentialValue) : undefined,
    });

    toast({
      title: "Sucesso!",
      description: "Lead adicionado com sucesso.",
    });

    router.push('/leads');
  };

  return (
    <CRMLayout>
      <div className="p-8 max-w-2xl mx-auto w-full">
        <Card className="bg-card border-border shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Adicionar Novo Lead</CardTitle>
            <CardDescription>Insira as informações básicas para iniciar o acompanhamento.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input 
                    id="name" 
                    placeholder="Ex: João Silva" 
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input 
                    id="instagram" 
                    placeholder="@usuario" 
                    value={formData.instagram}
                    onChange={e => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">WhatsApp / Telefone</Label>
                  <Input 
                    id="phone" 
                    placeholder="(00) 00000-0000" 
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sentAt">Data de Envio</Label>
                  <Input 
                    id="sentAt" 
                    type="date" 
                    value={formData.sentAt}
                    onChange={e => setFormData(prev => ({ ...prev, sentAt: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nicho *</Label>
                  <Select onValueChange={v => setFormData(prev => ({ ...prev, niche: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nicho" />
                    </SelectTrigger>
                    <SelectContent>
                      {config.niches.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Serviço *</Label>
                  <Select onValueChange={v => setFormData(prev => ({ ...prev, service: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {config.services.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Valor Potencial (R$)</Label>
                <Input 
                  id="value" 
                  type="number" 
                  placeholder="0.00" 
                  value={formData.potentialValue}
                  onChange={e => setFormData(prev => ({ ...prev, potentialValue: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações Iniciais</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Conteúdo da primeira mensagem, detalhes do perfil..."
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button>
                <Button type="submit" className="bg-primary text-white">Adicionar Lead</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </CRMLayout>
  );
}
