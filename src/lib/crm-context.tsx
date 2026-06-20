"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Lead, Meeting, Sale, OperationConfig, LeadStatus, MeetingStatus } from './types';
import { addDays, differenceInDays, isAfter, parseISO } from 'date-fns';

interface CRMContextType {
  leads: Lead[];
  meetings: Meeting[];
  sales: Sale[];
  config: OperationConfig;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'status' | 'followUpLevel' | 'nextFollowUpAt'>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  bulkAddLeads: (leads: Omit<Lead, 'id' | 'createdAt' | 'status' | 'followUpLevel' | 'nextFollowUpAt'>[]) => void;
  markFollowUpDone: (id: string) => void;
  updateMeeting: (meetingId: string, updates: Partial<Meeting>) => void;
  closeSale: (leadId: string, saleData: Omit<Sale, 'id' | 'leadId' | 'soldAt'>) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [config, setConfig] = useState<OperationConfig>({
    services: ['Gestão de Tráfego', 'Social Media', 'Site/LP', 'Copywriting'],
    niches: ['E-commerce', 'Infoproduto', 'Local Business', 'Real Estate'],
    operationName: 'FluxFlow CRM Default',
    defaultServiceValue: 1500,
  });

  // Calculate follow-up dates based on level
  const calculateNextFollowUp = (level: number, fromDate: string) => {
    const baseDate = parseISO(fromDate);
    const intervals = [1, 2, 5, 7]; // F1: +1d, F2: +2d, F3: +5d, F4: +7d
    if (level >= intervals.length) return undefined;
    return addDays(baseDate, intervals[level]).toISOString();
  };

  const addLead = (newLeadData: Omit<Lead, 'id' | 'createdAt' | 'status' | 'followUpLevel' | 'nextFollowUpAt'>) => {
    const now = new Date().toISOString();
    const newLead: Lead = {
      ...newLeadData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: now,
      status: 'Mensagem enviada',
      followUpLevel: 0,
      nextFollowUpAt: calculateNextFollowUp(0, newLeadData.sentAt),
    };
    setLeads((prev) => [...prev, newLead]);
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const updated = { ...l, ...updates };
          
          // Automatic Movement logic
          if (updates.status === 'Reunião marcada' && l.status !== 'Reunião marcada') {
            const meetingId = Math.random().toString(36).substr(2, 9);
            setMeetings(m => [...m, {
              id: meetingId,
              leadId: l.id,
              scheduledAt: new Date().toISOString(),
              status: 'Reunião marcada',
              notes: '',
              potentialValue: l.potentialValue
            }]);
          }
          
          return updated;
        }
        return l;
      })
    );
  };

  const bulkAddLeads = (newLeadsData: Omit<Lead, 'id' | 'createdAt' | 'status' | 'followUpLevel' | 'nextFollowUpAt'>[]) => {
    const now = new Date().toISOString();
    const processed = newLeadsData.map(data => ({
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: now,
      status: 'Mensagem enviada' as LeadStatus,
      followUpLevel: 0,
      nextFollowUpAt: calculateNextFollowUp(0, data.sentAt),
    }));
    setLeads(prev => [...prev, ...processed]);
  };

  const markFollowUpDone = (id: string) => {
    const now = new Date().toISOString();
    setLeads(prev => prev.map(l => {
      if (l.id === id) {
        const nextLevel = l.followUpLevel + 1;
        return {
          ...l,
          followUpLevel: nextLevel,
          lastFollowUpAt: now,
          nextFollowUpAt: calculateNextFollowUp(nextLevel, now)
        };
      }
      return l;
    }));
  };

  const updateMeeting = (meetingId: string, updates: Partial<Meeting>) => {
    setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, ...updates } : m));
    
    // Sync status to lead if necessary
    const meeting = meetings.find(m => m.id === meetingId);
    if (meeting && updates.status) {
      if (updates.status === 'Venda fechada') {
        // Logic for sale closure handled in closeSale or here
      } else {
        updateLead(meeting.leadId, { status: updates.status as unknown as LeadStatus });
      }
    }
  };

  const closeSale = (leadId: string, saleData: Omit<Sale, 'id' | 'leadId' | 'soldAt'>) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const newSale: Sale = {
      ...saleData,
      id: Math.random().toString(36).substr(2, 9),
      leadId: leadId,
      soldAt: new Date().toISOString(),
    };

    setSales(prev => [...prev, newSale]);
    updateLead(leadId, { status: 'Venda fechada' });
  };

  return (
    <CRMContext.Provider value={{ 
      leads, meetings, sales, config, 
      addLead, updateLead, bulkAddLeads, 
      markFollowUpDone, updateMeeting, closeSale 
    }}>
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) throw new Error('useCRM must be used within a CRMProvider');
  return context;
}
