
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Send, 
  MessageSquareQuote, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  UserX, 
  PlusCircle, 
  FileJson, 
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Leads Enviados', icon: Send, href: '/leads' },
  { label: 'Leads Respondidos', icon: MessageSquareQuote, href: '/replied' },
  { label: 'Reuniões', icon: Calendar, href: '/meetings' },
  { label: 'Vendas', icon: TrendingUp, href: '/sales' },
  { label: 'Urgência', icon: AlertCircle, href: '/urgency', variant: 'destructive' },
  { label: 'Não Vendidos', icon: UserX, href: '/lost' },
  { label: 'Adicionar Leads', icon: PlusCircle, href: '/add-lead' },
  { label: 'Importação', icon: FileJson, href: '/import' },
  { label: 'Configurações', icon: Settings, href: '/settings' },
];

export function CRMSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-sidebar flex flex-col h-screen sticky top-0 shrink-0">
      <div className="p-6">
        <h1 className="text-2xl font-headline font-bold text-primary flex items-center gap-2">
          FluxFlow <span className="text-xs px-2 py-0.5 bg-primary/10 rounded-full">CRM</span>
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary text-white" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white",
                item.variant === 'destructive' && !isActive && "text-destructive hover:bg-destructive/10"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-xs text-muted-foreground">Logado como</p>
          <p className="text-sm font-semibold">Operação Comercial</p>
        </div>
      </div>
    </aside>
  );
}
