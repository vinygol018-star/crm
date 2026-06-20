export type LeadStatus = 
  | 'Mensagem enviada'
  | 'Não respondeu'
  | 'Respondeu primeiro contato'
  | 'Em conversa'
  | 'Reunião marcada'
  | 'Venda fechada'
  | 'Não vendido'
  | 'Remover do CRM';

export type MeetingStatus =
  | 'Reunião marcada'
  | 'Reunião realizada'
  | 'Reunião remarcada'
  | 'Não compareceu'
  | 'Venda fechada'
  | 'Não vendido';

export type PaymentStatus = 'Pago' | 'Pendente' | 'Parcelado' | 'Cancelado';

export interface Lead {
  id: string;
  name: string;
  instagram: string;
  phone: string;
  niche: string;
  service: string;
  sentAt: string;
  status: LeadStatus;
  followUpLevel: number; // 0 to 4
  notes: string;
  lastFollowUpAt?: string;
  nextFollowUpAt?: string;
  potentialValue?: number;
  createdAt: string;
}

export interface Meeting {
  id: string;
  leadId: string;
  scheduledAt: string;
  status: MeetingStatus;
  notes: string;
  potentialValue?: number;
}

export interface Sale {
  id: string;
  leadId: string;
  customerName: string;
  amount: number;
  soldAt: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  notes: string;
}

export interface OperationConfig {
  services: string[];
  niches: string[];
  operationName: string;
  defaultServiceValue: number;
}
