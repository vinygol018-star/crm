
"use client";

import { CRMLayout } from '@/components/layout/crm-layout';
import { useCRM } from '@/lib/crm-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle,
  Flame,
  MessageSquareQuote
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { differenceInDays, parseISO } from 'date-fns';

export default function Dashboard() {
  const { leads, sales, meetings } = useCRM();

  // Metrics
  const totalLeads = leads.length;
  const leadsReplied = leads.filter(l => l.status === 'Respondeu').length;
  const leadsMeetings = leads.filter(l => l.status === 'Reunião marcada').length;
  const leadsClosed = leads.filter(l => l.status === 'Venda fechada').length;
  const leadsLost = leads.filter(l => l.status === 'Não vendido').length;
  
  const level1Count = leads.filter(l => l.responseLevel === 'Nível 1 — Respondeu pouco').length;
  const level2Count = leads.filter(l => l.responseLevel === 'Nível 2 — Em conversa').length;
  const level3Count = leads.filter(l => l.responseLevel === 'Nível 3 — Quente').length;

  const urgentLeadsCount = leads.filter(l => {
    if (['Venda fechada', 'Não vendido', 'Remover do CRM'].includes(l.status)) return false;
    const lastDate = l.lastFollowUpAt ? parseISO(l.lastFollowUpAt) : parseISO(l.sentAt);
    return differenceInDays(new Date(), lastDate) >= 4;
  }).length;

  const totalRevenue = sales.reduce((acc, s) => acc + s.amount, 0);

  // Rates
  const responseRate = totalLeads > 0 ? (leadsReplied / totalLeads) * 100 : 0;
  const hotRate = leadsReplied > 0 ? (level3Count / leadsReplied) * 100 : 0;
  const meetingRate = leadsReplied > 0 ? (leadsMeetings / leadsReplied) * 100 : 0;
  const conversionRate = leadsMeetings > 0 ? (leadsClosed / leadsMeetings) * 100 : 0;

  // Charts
  const funnelData = [
    { name: 'Enviados', value: leads.filter(l => ['Mensagem enviada', 'Não respondeu'].includes(l.status)).length },
    { name: 'Respondidos', value: leadsReplied },
    { name: 'Reuniões', value: leadsMeetings },
    { name: 'Vendas', value: leadsClosed },
  ];

  const COLORS = ['#3B82F6', '#818CF8', '#A78BFA', '#10B981'];

  const metrics = [
    { label: 'Total Leads', value: totalLeads, icon: Users, color: 'text-blue-400' },
    { label: 'Respondidos', value: leadsReplied, icon: MessageSquareQuote, color: 'text-indigo-400' },
    { label: 'Leads Quentes', value: level3Count, icon: Flame, color: 'text-orange-500' },
    { label: 'Reuniões', value: leadsMeetings, icon: Calendar, color: 'text-violet-400' },
    { label: 'Vendas', value: leadsClosed, icon: CheckCircle2, color: 'text-green-400' },
    { label: 'Faturamento', value: `R$ ${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-400' },
  ];

  return (
    <CRMLayout>
      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-headline font-bold">Dashboard Comercial</h2>
            <p className="text-muted-foreground">Monitoramento em tempo real do seu funil de vendas.</p>
          </div>
          {urgentLeadsCount > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-bold text-red-500">{urgentLeadsCount} leads urgentes</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {metrics.map((m) => (
            <Card key={m.label} className="bg-card border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{m.label}</CardTitle>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{m.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-card border-border flex flex-col justify-center items-center py-6">
            <p className="text-xs text-muted-foreground uppercase font-bold">Taxa de Resposta</p>
            <div className="text-3xl font-bold text-blue-400 mt-2">{responseRate.toFixed(1)}%</div>
          </Card>
          <Card className="bg-card border-border flex flex-col justify-center items-center py-6">
            <p className="text-xs text-muted-foreground uppercase font-bold">Leads Quentes</p>
            <div className="text-3xl font-bold text-orange-500 mt-2">{hotRate.toFixed(1)}%</div>
          </Card>
          <Card className="bg-card border-border flex flex-col justify-center items-center py-6">
            <p className="text-xs text-muted-foreground uppercase font-bold">Taxa de Reunião</p>
            <div className="text-3xl font-bold text-violet-400 mt-2">{meetingRate.toFixed(1)}%</div>
          </Card>
          <Card className="bg-card border-border flex flex-col justify-center items-center py-6">
            <p className="text-xs text-muted-foreground uppercase font-bold">Conversão Real</p>
            <div className="text-3xl font-bold text-green-400 mt-2">{conversionRate.toFixed(1)}%</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Volume do Funil</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D2E32" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#16181D', border: '1px solid #2D2E32' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Composição Respondidos</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Nível 1', value: level1Count },
                      { name: 'Nível 2', value: level2Count },
                      { name: 'Nível 3', value: level3Count },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#60A5FA" />
                    <Cell fill="#818CF8" />
                    <Cell fill="#F97316" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#16181D', border: '1px solid #2D2E32' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </CRMLayout>
  );
}
