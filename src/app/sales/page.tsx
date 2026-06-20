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
import { TrendingUp, DollarSign, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SalesPage() {
  const { sales } = useCRM();

  const totalRevenue = sales.reduce((acc, s) => acc + s.amount, 0);

  return (
    <CRMLayout>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-headline font-bold">Vendas Fechadas</h2>
            <p className="text-muted-foreground">Histórico de fechamentos e faturamento da operação.</p>
          </div>
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-4">
            <div className="p-2 bg-green-500 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-green-500 font-bold uppercase tracking-wider">Faturamento Total</p>
              <p className="text-2xl font-bold">R$ {totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xl">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Status Pgto</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                    Nenhuma venda registrada ainda.
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((sale) => (
                  <TableRow key={sale.id} className="hover:bg-green-500/5">
                    <TableCell>
                      <span className="font-semibold text-white">{sale.customerName}</span>
                    </TableCell>
                    <TableCell>
                      {format(parseISO(sale.soldAt), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="font-bold text-green-400">
                      R$ {sale.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Wallet className="w-3 h-3 text-muted-foreground" />
                        {sale.paymentMethod}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "bg-opacity-10",
                        sale.paymentStatus === 'Pago' && "bg-green-500 text-green-500 border-green-500",
                        sale.paymentStatus === 'Pendente' && "bg-yellow-500 text-yellow-500 border-yellow-500",
                        sale.paymentStatus === 'Cancelado' && "bg-red-500 text-red-500 border-red-500",
                      )}>
                        {sale.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs italic">
                      {sale.notes}
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
