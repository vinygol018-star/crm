"use client";

import { CRMLayout } from '@/components/layout/crm-layout';
import { useCRM } from '@/lib/crm-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Send, 
  MessageSquare, 
  Calendar, 
  CheckCircle2, 
  TrendingUp, 
  AlertTriangle,
  History
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

  // Metric calculations
  const totalLeads = leads.length;
  const leadsSent = leads.filter(l => l.status === 'Mensagem enviada').length;
  const leadsResponded = leads.filter(l => !['Mensagem enviada', 'Não respondeu', 'Remover do CRM'].includes(l.status)).length;
  const leadsNoResponse = leads.filter(l => l.status === 'Não respondeu').length;
  const totalMeetings = meetings.length;
  const totalSalesCount = sales.length;
  const totalLost = leads.filter(l => l.status === 'Não vendido').length;
  const totalRevenue = sales.reduce((acc, s) => acc + s.amount, 0);
  
  const urgentLeadsCount = leads.filter(l => {
    if (['Venda fechada', 'Não vendido', 'Remover do CRM'].includes(l.status)) return false;
    const lastDate = l.lastFollowUpAt ? parseISO(l.lastFollowUpAt) : parseISO(l.sentAt);
    return differenceInDays(new Date(), lastDate) >= 4;
  }).length;

  const responseRate = totalLeads > 0 ? (leadsResponded / totalLeads) * 100 : 0;
  const meetingRate = leadsResponded > 0 ? (totalMeetings / leadsResponded) * 100 : 0;
  const conversionRate = totalMeetings > 0 ? (totalSalesCount / totalMeetings) * 100 : 0;

  // Chart Data
  const statusData = [
    { name: 'Sent', value: leads.filter(l => l.status === 'Mensagem enviada').length },
    { name: 'Replied', value: leads.filter(l => l.status === 'Respondeu primeiro contato').length },
    { name: 'Meeting', value: leads.filter(l => l.status === 'Reunião marcada').length },
    { name: 'Closed', value: leads.filter(l => l.status === 'Venda fechada').length },
    { name: 'Lost', value: leads.filter(l => l.status === 'Não vendido').length },
  ];

  const COLORS = ['#1A73E8', '#5C6BC0', '#9575CD', '#4CAF50', '#F44336'];

  const metrics = [
    { label: 'Total Leads', value: totalLeads, icon: Users, color: 'text-blue-400' },
    { label: 'Respostas', value: leadsResponded, icon: MessageSquare, color: 'text-indigo-400' },
    { label: 'Reuniões', value: totalMeetings, icon: Calendar, color: 'text-violet-400' },
    { label: 'Vendas', value: totalSalesCount, icon: CheckCircle2, color: 'text-green-400' },
    { label: 'Faturamento', value: `R$ ${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Urgência', value: urgentLeadsCount, icon: AlertTriangle, color: 'text-red-400' },
  ];

  return (
    <CRMLayout>
      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        <div>
          <h2 className="text-3xl font-headline font-bold">Dashboard Geral</h2>
          <p className="text-muted-foreground">Bem-vindo à sua central de operações comercial.</p>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {metrics.map((m) => (
            <Card key={m.label} className="bg-card border-border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{m.label}</CardTitle>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{m.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats & KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Taxa de Resposta</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-2">
              <div className="text-4xl font-bold text-blue-400">{responseRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-2">de leads que responderam</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Taxa de Reunião</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-2">
              <div className="text-4xl font-bold text-violet-400">{meetingRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-2">de respostas viraram reuniões</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Taxa de Conversão</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-2">
              <div className="text-4xl font-bold text-green-400">{conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-2">de reuniões viraram vendas</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Status dos Leads</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D2E32" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#16181D', border: '1px solid #2D2E32' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" fill="#1A73E8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Distribuição do Funil</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
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
