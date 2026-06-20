"use client";

import { useState } from 'react';
import { CRMLayout } from '@/components/layout/crm-layout';
import { useCRM } from '@/lib/crm-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Instagram, 
  MessageCircle, 
  CalendarClock,
  Sparkles
} from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { LeadStatus } from '@/lib/types';
import { generateFollowUpMessage } from '@/ai/flows/generate-follow-up-message-flow';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function LeadsPage() {
  const { leads, updateLead, markFollowUpDone } = useCRM();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'All'>('All');
  const { toast } = useToast();

  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.instagram.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search);
    const matchesStatus = statusFilter === 'All' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getUrgencyColor = (sentAt: string, lastFollowUp?: string) => {
    const lastDate = lastFollowUp ? parseISO(lastFollowUp) : parseISO(sentAt);
    const days = differenceInDays(new Date(), lastDate);
    if (days >= 4) return 'text-red-500 font-bold';
    if (days >= 2) return 'text-orange-400';
    return 'text-muted-foreground';
  };

  const handleStatusChange = (id: string, newStatus: LeadStatus) => {
    updateLead(id, { status: newStatus });
  };

  const handleAIFollowUp = async (lead: any) => {
    try {
      const result = await generateFollowUpMessage({
        leadName: lead.name,
        niche: lead.niche,
        serviceOffered: lead.service,
        interactionHistory: lead.notes || "Iniciou contato agora."
      });
      
      alert(`Mensagem Sugerida:\n\n${result.message}`);
    } catch (error) {
      toast({
        title: "Erro na IA",
        description: "Não foi possível gerar a mensagem agora.",
        variant: "destructive"
      });
    }
  };

  return (
    <CRMLayout>
      <div className="p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-headline font-bold">Leads Enviados</h2>
            <p className="text-muted-foreground">Controle todos os contatos realizados.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar lead..." 
                className="pl-9 w-64 bg-secondary border-border"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Status: {statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border">
                <DropdownMenuItem onClick={() => setStatusFilter('All')}>Todos</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter('Mensagem enviada')}>Mensagem enviada</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('Não respondeu')}>Não respondeu</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('Em conversa')}>Em conversa</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('Reunião marcada')}>Reunião marcada</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xl">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Nicho / Serviço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Follow-up</TableHead>
                <TableHead>Inatividade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                    Nenhum lead encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-secondary/30">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{lead.name}</span>
                        <div className="flex gap-2 mt-1">
                          <a href={`https://instagram.com/${lead.instagram.replace('@','')}`} target="_blank" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                            <Instagram className="w-3 h-3" /> @{lead.instagram.replace('@','')}
                          </a>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" /> {lead.phone}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{lead.niche}</span>
                        <span className="text-xs text-muted-foreground">{lead.service}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                        "bg-opacity-10",
                        lead.status === 'Venda fechada' && "bg-green-500 text-green-500 border-green-500",
                        lead.status === 'Não vendido' && "bg-red-500 text-red-500 border-red-500",
                        lead.status === 'Reunião marcada' && "bg-violet-500 text-violet-500 border-violet-500",
                        lead.status === 'Mensagem enviada' && "bg-blue-500 text-blue-500 border-blue-500"
                      )}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium uppercase tracking-tight text-muted-foreground">Level {lead.followUpLevel}</span>
                        <span className="text-xs flex items-center gap-1 mt-1">
                          <CalendarClock className="w-3 h-3" />
                          Próximo: {lead.nextFollowUpAt ? format(parseISO(lead.nextFollowUpAt), 'dd/MM') : 'Finalizado'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={cn("text-sm", getUrgencyColor(lead.sentAt, lead.lastFollowUpAt))}>
                        {differenceInDays(new Date(), lead.lastFollowUpAt ? parseISO(lead.lastFollowUpAt) : parseISO(lead.sentAt))} dias
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-primary hover:text-primary hover:bg-primary/10"
                          onClick={() => handleAIFollowUp(lead)}
                        >
                          <Sparkles className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border">
                            <DropdownMenuItem onClick={() => markFollowUpDone(lead.id)}>Marcar Follow-up feito</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusChange(lead.id, 'Em conversa')}>Mover para Conversa</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(lead.id, 'Reunião marcada')}>Marcar Reunião</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(lead.id, 'Não vendido')} className="text-destructive">Não Vendido</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </CRMLayout>
  );
}
