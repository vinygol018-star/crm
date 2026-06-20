"use client";

import { CRMLayout } from '@/components/layout/crm-layout';
import { useCRM } from '@/lib/crm-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Instagram, 
  MessageSquare, 
  Calendar,
  CheckCircle,
  MoreVertical,
  CalendarDays
} from 'lucide-react';
import { differenceInDays, parseISO, format } from 'date-fns';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

export default function UrgencyPage() {
  const { leads, markFollowUpDone, updateLead } = useCRM();

  const urgentLeads = leads.filter(l => {
    // Only active leads
    if (['Venda fechada', 'Não vendido', 'Remover do CRM'].includes(l.status)) return false;
    
    const lastDate = l.lastFollowUpAt ? parseISO(l.lastFollowUpAt) : parseISO(l.sentAt);
    return differenceInDays(new Date(), lastDate) >= 4;
  }).sort((a, b) => {
    const lastA = a.lastFollowUpAt ? parseISO(a.lastFollowUpAt) : parseISO(a.sentAt);
    const lastB = b.lastFollowUpAt ? parseISO(b.lastFollowUpAt) : parseISO(b.sentAt);
    return differenceInDays(new Date(), lastA) > differenceInDays(new Date(), lastB) ? -1 : 1;
  });

  return (
    <CRMLayout>
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-xl">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-3xl font-headline font-bold text-white">Central de Urgência</h2>
            <p className="text-muted-foreground">Leads que estão há mais de 4 dias sem interação.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {urgentLeads.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl bg-card">
              <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-xl font-bold">Tudo em dia!</h3>
              <p className="text-muted-foreground">Não há leads precisando de atenção urgente no momento.</p>
            </div>
          ) : (
            urgentLeads.map((lead) => {
              const lastDate = lead.lastFollowUpAt ? parseISO(lead.lastFollowUpAt) : parseISO(lead.sentAt);
              const daysMissing = differenceInDays(new Date(), lastDate);
              
              return (
                <Card key={lead.id} className="bg-card border-red-500/30 border shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3">
                    <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                      {daysMissing} DIAS OFF
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg font-headline">{lead.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] py-0">{lead.niche}</Badge>
                          <Badge variant="outline" className="text-[10px] py-0">{lead.status}</Badge>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Instagram className="w-3 h-3" /> @{lead.instagram}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MessageSquare className="w-3 h-3" /> {lead.phone}
                      </div>
                    </div>

                    <div className="p-3 bg-secondary/50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold">Último contato:</span>
                      </div>
                      <span className="text-xs">{format(lastDate, 'dd/MM/yyyy')}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-primary text-white"
                        onClick={() => markFollowUpDone(lead.id)}
                      >
                        Fazer Follow-up
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem onClick={() => updateLead(lead.id, { status: 'Reunião marcada' })}>Mover para Reunião</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => updateLead(lead.id, { status: 'Não vendido' })} className="text-destructive">Marcar como Perdido</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </CRMLayout>
  );
}
