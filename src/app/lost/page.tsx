"use client";

import { CRMLayout } from '@/components/layout/crm-layout';
import { useCRM } from '@/lib/crm-context';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { UserX } from 'lucide-react';

export default function LostLeadsPage() {
  const { leads } = useCRM();

  const lostLeads = leads.filter(l => l.status === 'Não vendido');

  return (
    <CRMLayout>
      <div className="p-8 space-y-6">
        <div>
          <h2 className="text-3xl font-headline font-bold">Leads Não Vendidos</h2>
          <p className="text-muted-foreground">Histórico de negociações que não foram concretizadas.</p>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xl">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Nicho</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Data Cadastro</TableHead>
                <TableHead>Status Final</TableHead>
                <TableHead>Motivo / Obs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lostLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                    Nenhum lead marcado como perdido ainda.
                  </TableCell>
                </TableRow>
              ) : (
                lostLeads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-red-500/5">
                    <TableCell>
                      <span className="font-semibold text-white">{lead.name}</span>
                    </TableCell>
                    <TableCell>{lead.niche}</TableCell>
                    <TableCell>{lead.service}</TableCell>
                    <TableCell>
                      {format(parseISO(lead.createdAt), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive" className="bg-opacity-10 text-red-500 border-red-500">
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs italic">
                      {lead.notes}
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
