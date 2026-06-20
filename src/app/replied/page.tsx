
"use client";

import { useState } from 'react';
import { CRMLayout } from '@/components/layout/crm-layout';
import { useCRM } from '@/lib/crm-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Instagram, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  Edit2,
  CalendarCheck,
  UserX
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Lead, ResponseLevel } from '@/lib/types';
import { LeadEditDialog } from '@/components/crm/lead-edit-dialog';

export default function RepliedLeadsPage() {
  const { leads, updateLead, closeSale } = useCRM();
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const repliedLeads = leads.filter(l => l.status === 'Respondeu');

  const levels: ResponseLevel[] = [
    'Nível 1 — Respondeu pouco',
    'Nível 2 — Em conversa',
    'Nível 3 — Quente'
  ];

  const handleSale = (lead: Lead) => {
    closeSale(lead.id, {
      customerName: lead.name,
      amount: lead.potentialValue || 1500,
      paymentMethod: 'A definir',
      paymentStatus: 'Pendente',
      notes: 'Fechado através de conversa direta'
    });
  };

  return (
    <CRMLayout>
      <div className="p-8 space-y-8">
        <div>
          <h2 className="text-3xl font-headline font-bold">Leads Respondidos</h2>
          <p className="text-muted-foreground">Gerencie leads que já interagiram e classifique seu interesse.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          {levels.map(level => {
            const levelLeads = repliedLeads.filter(l => l.responseLevel === level);
            return (
              <div key={level} className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      level === 'Nível 1 — Respondeu pouco' && "bg-blue-400",
                      level === 'Nível 2 — Em conversa' && "bg-indigo-400",
                      level === 'Nível 3 — Quente' && "bg-orange-500"
                    )} />
                    {level}
                    <Badge variant="secondary" className="ml-2 bg-sidebar-accent">{levelLeads.length}</Badge>
                  </h3>
                </div>

                <div className="space-y-4 min-h-[500px] p-2 rounded-xl bg-secondary/20 border border-dashed border-border">
                  {levelLeads.length === 0 ? (
                    <p className="text-center py-10 text-xs text-muted-foreground italic">Nenhum lead neste nível.</p>
                  ) : (
                    levelLeads.map(lead => (
                      <Card key={lead.id} className="bg-card border-border shadow-sm group hover:border-primary/50 transition-all">
                        <CardHeader className="p-4 pb-2 space-y-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base font-bold text-white leading-tight">{lead.name}</CardTitle>
                              <div className="flex gap-2 mt-1 flex-wrap">
                                <Badge variant="outline" className="text-[10px] py-0">{lead.niche}</Badge>
                                <Badge variant="outline" className="text-[10px] py-0">{lead.service}</Badge>
                              </div>
                            </div>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingLead(lead)}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-4">
                          <div className="space-y-1 mt-2">
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              <Instagram className="w-3 h-3" /> {lead.instagram}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              <Phone className="w-3 h-3" /> {lead.phone}
                            </div>
                          </div>

                          {lead.notes && (
                            <div className="p-2 rounded bg-secondary/40 text-[10px] text-muted-foreground italic line-clamp-2">
                              "{lead.notes}"
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-border pt-3">
                            <div>
                              <p className="text-muted-foreground uppercase text-[9px] font-bold">Último Contato</p>
                              <p>{lead.lastFollowUpAt ? format(parseISO(lead.lastFollowUpAt), 'dd/MM/yy') : 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground uppercase text-[9px] font-bold">Próximo FUP</p>
                              <p className="text-primary font-bold">{lead.nextFollowUpAt ? format(parseISO(lead.nextFollowUpAt), 'dd/MM/yy') : 'Finalizado'}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-[10px] h-8 gap-1 hover:bg-violet-500/10 hover:text-violet-500"
                              onClick={() => updateLead(lead.id, { status: 'Reunião marcada' })}
                            >
                              <CalendarCheck className="w-3 h-3" /> Reunião
                            </Button>
                            <Button 
                              size="sm" 
                              className="text-[10px] h-8 gap-1 bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleSale(lead)}
                            >
                              <CheckCircle2 className="w-3 h-3" /> Venda
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="col-span-2 text-[10px] h-7 text-destructive hover:bg-destructive/10"
                              onClick={() => updateLead(lead.id, { status: 'Não vendido' })}
                            >
                              <UserX className="w-3 h-3 mr-1" /> Perder Lead
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <LeadEditDialog 
        lead={editingLead} 
        open={!!editingLead} 
        onOpenChange={(open) => !open && setEditingLead(null)} 
      />
    </CRMLayout>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
