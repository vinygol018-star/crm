"use client";

import { useState } from 'react';
import { CRMLayout } from '@/components/layout/crm-layout';
import { useCRM } from '@/lib/crm-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Instagram, 
  MessageSquare, 
  MoreVertical, 
  CheckCircle2, 
  XCircle,
  RefreshCcw
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { MeetingStatus, LeadStatus } from '@/lib/types';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

export default function MeetingsPage() {
  const { leads, meetings, updateMeeting, closeSale } = useCRM();

  const getLeadName = (leadId: string) => leads.find(l => l.id === leadId)?.name || 'Lead Desconhecido';
  const getLeadContact = (leadId: string) => leads.find(l => l.id === leadId);

  const activeMeetings = meetings.filter(m => !['Venda fechada', 'Não vendido'].includes(m.status));

  const handleSale = (meeting: any) => {
    const lead = leads.find(l => l.id === meeting.leadId);
    if (lead) {
      closeSale(lead.id, {
        customerName: lead.name,
        amount: meeting.potentialValue || 1500,
        paymentMethod: 'Cartão de Crédito',
        paymentStatus: 'Pendente',
        notes: 'Venda vinda de reunião'
      });
      updateMeeting(meeting.id, { status: 'Venda fechada' });
    }
  };

  return (
    <CRMLayout>
      <div className="p-8 space-y-6">
        <div>
          <h2 className="text-3xl font-headline font-bold">Reuniões</h2>
          <p className="text-muted-foreground">Acompanhe as reuniões marcadas e seus resultados.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeMeetings.length === 0 ? (
            <div className="col-span-full h-64 flex items-center justify-center border-2 border-dashed border-border rounded-xl text-muted-foreground">
              Nenhuma reunião pendente no momento.
            </div>
          ) : (
            activeMeetings.map((meeting) => {
              const lead = getLeadContact(meeting.leadId);
              return (
                <Card key={meeting.id} className="bg-card border-border shadow-lg relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-violet-500" />
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-xl font-headline">{lead?.name}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-widest">{meeting.status}</Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem onClick={() => updateMeeting(meeting.id, { status: 'Reunião realizada' })}>Marcar como Realizada</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateMeeting(meeting.id, { status: 'Reunião remarcada' })}>Remarcar</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateMeeting(meeting.id, { status: 'Não compareceu' })}>Não Compareceu</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => updateMeeting(meeting.id, { status: 'Não vendido' })} className="text-destructive">Perdido</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        {format(parseISO(meeting.scheduledAt), 'dd/MM/yyyy')}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        {format(parseISO(meeting.scheduledAt), 'HH:mm')}
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-border pt-4">
                      <div className="flex items-center gap-2 text-xs">
                        <Instagram className="w-3 h-3" /> @{lead?.instagram}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <MessageSquare className="w-3 h-3" /> {lead?.phone}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
                        onClick={() => handleSale(meeting)}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Fechar Venda
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 gap-2"
                        onClick={() => updateMeeting(meeting.id, { status: 'Reunião remarcada' })}
                      >
                        <RefreshCcw className="w-4 h-4" />
                        Remarcar
                      </Button>
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
