"use client";

import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { Lead, Meeting, Sale, OperationConfig } from './types';
import { addDays, parseISO } from 'date-fns';
import { useFirestore, useCollection, useDoc, useUser } from '@/firebase';
import { collection, doc, setDoc, updateDoc, writeBatch, query, orderBy } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface CRMContextType {
  leads: Lead[];
  meetings: Meeting[];
  sales: Sale[];
  config: OperationConfig;
  isLoading: boolean;
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'status' | 'followUpLevel' | 'nextFollowUpAt'>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  bulkAddLeads: (leads: Omit<Lead, 'id' | 'createdAt' | 'status' | 'followUpLevel' | 'nextFollowUpAt'>[]) => void;
  markFollowUpDone: (id: string) => void;
  updateMeeting: (meetingId: string, updates: Partial<Meeting>) => void;
  closeSale: (leadId: string, saleData: Omit<Sale, 'id' | 'leadId' | 'soldAt'>) => void;
  saveConfig: (newConfig: OperationConfig) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const db = useFirestore();
  const { user } = useUser();
  const [safetyTimeoutReached, setSafetyTimeoutReached] = useState(false);

  // Timeout para o progresso de carregamento dos dados
  useEffect(() => {
    const id = setTimeout(() => setSafetyTimeoutReached(true), 15000);
    return () => clearTimeout(id);
  }, []);

  const leadsQuery = useMemo(() => user && db ? query(collection(db, 'leads'), orderBy('createdAt', 'desc')) : null, [db, user]);
  const meetingsQuery = useMemo(() => user && db ? query(collection(db, 'meetings'), orderBy('scheduledAt', 'desc')) : null, [db, user]);
  const salesQuery = useMemo(() => user && db ? query(collection(db, 'sales'), orderBy('soldAt', 'desc')) : null, [db, user]);
  const configDocRef = useMemo(() => user && db ? doc(db, 'config', 'main') : null, [db, user]);

  const { data: leads = [], loading: loadingLeads } = useCollection<Lead>(leadsQuery);
  const { data: meetings = [], loading: loadingMeetings } = useCollection<Meeting>(meetingsQuery);
  const { data: sales = [], loading: loadingSales } = useCollection<Sale>(salesQuery);
  const { data: configDoc, loading: loadingConfig } = useDoc<OperationConfig>(configDocRef);

  const config: OperationConfig = configDoc || {
    services: ['Gestão de Tráfego', 'Social Media', 'Site/LP', 'Copywriting', 'Automação', 'CRM'],
    niches: ['Academia', 'Estética', 'Clínica', 'Restaurante', 'Loja de Roupa', 'E-commerce', 'Infoproduto'],
    operationName: 'FluxFlow CRM',
    defaultServiceValue: 1500,
  };

  const calculateNextFollowUp = (level: number, fromDate: string) => {
    try {
      const baseDate = parseISO(fromDate);
      const intervals = [1, 2, 5, 7];
      if (level >= intervals.length) return undefined;
      return addDays(baseDate, intervals[level]).toISOString();
    } catch (e) {
      return undefined;
    }
  };

  const addLead = (newLeadData: any) => {
    if (!db) return;
    const leadId = Math.random().toString(36).substr(2, 9);
    const leadRef = doc(db, 'leads', leadId);
    const now = new Date().toISOString();
    
    const data = {
      ...newLeadData,
      id: leadId,
      createdAt: now,
      status: 'Mensagem enviada',
      followUpLevel: 0,
      nextFollowUpAt: calculateNextFollowUp(0, newLeadData.sentAt || now),
    };

    setDoc(leadRef, data).catch(async (e) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: leadRef.path, operation: 'create', requestResourceData: data }));
    });
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    if (!db) return;
    const leadRef = doc(db, 'leads', id);
    
    updateDoc(leadRef, updates).catch(async (e) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: leadRef.path, operation: 'update', requestResourceData: updates }));
    });

    if (updates.status === 'Reunião marcada') {
      const meetingId = Math.random().toString(36).substr(2, 9);
      const meetingRef = doc(db, 'meetings', meetingId);
      const mData = {
        id: meetingId,
        leadId: id,
        scheduledAt: new Date().toISOString(),
        status: 'Reunião marcada',
        notes: '',
        potentialValue: updates.potentialValue || config.defaultServiceValue
      };
      setDoc(meetingRef, mData);
    }
  };

  const bulkAddLeads = (newLeadsData: any[]) => {
    if (!db) return;
    const batch = writeBatch(db);
    const now = new Date().toISOString();

    newLeadsData.forEach(data => {
      const leadId = Math.random().toString(36).substr(2, 9);
      const leadRef = doc(db, 'leads', leadId);
      batch.set(leadRef, {
        ...data,
        id: leadId,
        createdAt: now,
        status: 'Mensagem enviada',
        followUpLevel: 0,
        nextFollowUpAt: calculateNextFollowUp(0, data.sentAt || now),
      });
    });

    batch.commit();
  };

  const markFollowUpDone = (id: string) => {
    if (!db) return;
    const lead = leads.find(l => l.id === id);
    if (!lead) return;

    const leadRef = doc(db, 'leads', id);
    const now = new Date().toISOString();
    const nextLevel = lead.followUpLevel + 1;
    
    updateDoc(leadRef, {
      followUpLevel: nextLevel,
      lastFollowUpAt: now,
      nextFollowUpAt: calculateNextFollowUp(nextLevel, now)
    });
  };

  const updateMeeting = (meetingId: string, updates: Partial<Meeting>) => {
    if (!db) return;
    const meetingRef = doc(db, 'meetings', meetingId);
    updateDoc(meetingRef, updates);

    const meeting = meetings.find(m => m.id === meetingId);
    if (meeting && updates.status === 'Não vendido') {
      updateLead(meeting.leadId, { status: 'Não vendido' });
    }
  };

  const closeSale = (leadId: string, saleData: any) => {
    if (!db) return;
    const saleId = Math.random().toString(36).substr(2, 9);
    const saleRef = doc(db, 'sales', saleId);
    
    const data = {
      ...saleData,
      id: saleId,
      leadId: leadId,
      soldAt: new Date().toISOString(),
    };

    setDoc(saleRef, data);
    updateLead(leadId, { status: 'Venda fechada' });
  };

  const saveConfig = (newConfig: OperationConfig) => {
    if (!db) return;
    const configRef = doc(db, 'config', 'main');
    setDoc(configRef, newConfig);
  };

  const isLoading = !safetyTimeoutReached && (loadingLeads || loadingMeetings || loadingSales || loadingConfig) && !!db;

  return (
    <CRMContext.Provider value={{ 
      leads, meetings, sales, config, 
      isLoading,
      addLead, updateLead, bulkAddLeads, 
      markFollowUpDone, updateMeeting, closeSale,
      saveConfig
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
