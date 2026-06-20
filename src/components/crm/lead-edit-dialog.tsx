
"use client";

import { useState, useEffect } from 'react';
import { Lead, LeadStatus, ResponseLevel } from '@/lib/types';
import { useCRM } from '@/lib/crm-context';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface LeadEditDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadEditDialog({ lead, open, onOpenChange }: LeadEditDialogProps) {
  const { updateLead } = useCRM();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Lead>>({});

  useEffect(() => {
    if (lead) {
      setFormData(lead);
    }
  }, [lead]);

  const handleSave = () => {
    if (lead) {
      updateLead(lead.id, formData);
      toast({ title: "Lead atualizado", description: "As informações foram salvas com sucesso." });
      onOpenChange(false);
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle>Editar Lead: {lead.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v) => setFormData(prev => ({ ...prev, status: v as LeadStatus }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mensagem enviada">Mensagem enviada</SelectItem>
                  <SelectItem value="Não respondeu">Não respondeu</SelectItem>
                  <SelectItem value="Aguardando resposta">Aguardando resposta</SelectItem>
                  <SelectItem value="Follow-up pendente">Follow-up pendente</SelectItem>
                  <SelectItem value="Respondeu">Respondeu</SelectItem>
                  <SelectItem value="Reunião marcada">Reunião marcada</SelectItem>
                  <SelectItem value="Venda fechada">Venda fechada</SelectItem>
                  <SelectItem value="Não vendido">Não vendido</SelectItem>
                  <SelectItem value="Remover do CRM">Remover do CRM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.status === 'Respondeu' && (
              <div className="space-y-2">
                <Label>Nível do Resposta</Label>
                <Select 
                  value={formData.responseLevel} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, responseLevel: v as ResponseLevel }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nível 1 — Respondeu pouco">Nível 1 — Curto/Simples</SelectItem>
                    <SelectItem value="Nível 2 — Em conversa">Nível 2 — Interessado</SelectItem>
                    <SelectItem value="Nível 3 — Quente">Nível 3 — Quente/CTA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Valor Potencial (R$)</Label>
            <Input 
              type="number" 
              value={formData.potentialValue || ''} 
              onChange={(e) => setFormData(prev => ({ ...prev, potentialValue: parseFloat(e.target.value) }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Notas / Histórico</Label>
            <Textarea 
              value={formData.notes || ''} 
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Descreva a conversa ou motivo da perda..."
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} className="bg-primary text-white">Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
