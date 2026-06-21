
"use client";

import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { Lead, Meeting, Sale, OperationConfig } from './types';
import { addDays, parseISO } from 'date-fns';
import { useFirestore, useCollection, useDoc, useUser, useIsFirebaseConfigured } from '@/firebase';
import { collection, doc, setDoc, updateDoc, writeBatch, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

interface CRMContextType {
  leads: Lead[];
  meetings: Meeting[];
  sales: Sale[];
  config: OperationConfig;
  isLoading: boolean;
  isFirestoreConnected: boolean;
  dbError: string | null;
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
  const isConfigured = useIsFirebaseConfigured();
  const [safetyTimeoutReached, setSafetyTimeoutReached] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setSafetyTimeoutReached(true), 15000);
    return () => clearTimeout(id);
  }, []);

  // Consultas ao Firestore - Fonte de verdade única
  const leadsQuery = useMemo(() => {
    if (!user || !db) return null;
    return query(collection(db, 'leads'));
  }, [db, user]);

  const meetingsQuery = useMemo(() => user && db ? query(collection(db, 'meetings')) : null, [db, user]);
  const salesQuery = useMemo(() => user && db ? query(collection(db, 'sales')) : null, [db, user]);
  const configDocRef = useMemo(() => user && db ? doc(db, 'config', 'main') : null, [db, user]);

  const { data: rawLeads = [], loading: loadingLeads, error: errorLeads } = useCollection<Lead>(leadsQuery);
  const { data: rawMeetings = [], loading: loadingMeetings, error: errorMeetings } = useCollection<Meeting>(meetingsQuery);
  const { data: rawSales = [], loading: loadingSales, error: errorSales } = useCollection<Sale>(salesQuery);
  const { data: configDoc, loading: loadingConfig, error: errorConfig } = useDoc<OperationConfig>(configDocRef);

  useEffect(() => {
    const firstError = errorLeads || errorMeetings || errorSales || errorConfig;
    if (firstError) {
      setDbError(firstError.message);
      console.error('CRM Firestore Sync Error:', firstError);
    }
  }, [errorLeads, errorMeetings, errorSales, errorConfig]);

  const leads = useMemo(() => {
    return [...rawLeads].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [rawLeads]);

  const meetings = useMemo(() => [...rawMeetings], [rawMeetings]);
  const sales = useMemo(() => [...rawSales], [rawSales]);

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
    if (!db || !user) {
      console.error('Tentativa de salvar lead sem autenticação ou banco.');
      return;
    }
    
    const leadsCollection = collection(db, 'leads');
    const now = new Date().toISOString();
    
    const data = {
      ...newLeadData,
      createdAt: now,
      status: 'Mensagem enviada',
      followUpLevel: 0,
      nextFollowUpAt: calculateNextFollowUp(0, newLeadData.sentAt || now),
    };

    console.log('Firestore: Salvando novo lead...');
    addDoc(leadsCollection, data).then((docRef) => {
      console.log('Firestore: Lead salvo com ID:', docRef.id);
    }).catch(async (e) => {
      console.error('Firestore Error:', e);
      errorEmitter.emit('permission-error', new FirestorePermissionError({ 
        path: leadsCollection.path, 
        operation: 'create', 
        requestResourceData: data 
      }));
    });
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    if (!db || !user) return;
    const leadRef = doc(db, 'leads', id);
    
    console.log(`Firestore: Atualizando lead ${id}...`);
    updateDoc(leadRef, { ...updates, updatedAt: serverTimestamp() as any }).catch(async (e) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ 
        path: leadRef.path, 
        operation: 'update', 
        requestResourceData: updates 
      }));
    });

    if (updates.status === 'Reunião marcada') {
      const meetingsCollection = collection(db, 'meetings');
      const mData = {
        leadId: id,
        scheduledAt: new Date().toISOString(),
        status: 'Reunião marcada',
        notes: '',
        potentialValue: updates.potentialValue || config.defaultServiceValue
      };
      addDoc(meetingsCollection, mData).catch(async (e) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ 
          path: meetingsCollection.path, 
          operation: 'create', 
          requestResourceData: mData 
        }));
      });
    }
  };

  const bulkAddLeads = (newLeadsData: any[]) => {
    if (!db || !user) return;
    const batch = writeBatch(db);
    const now = new Date().toISOString();

    console.log(`Firestore: Iniciando importação em lote de ${newLeadsData.length} leads...`);
    newLeadsData.forEach(data => {
      const leadRef = doc(collection(db, 'leads'));
      const leadData = {
        ...data,
        createdAt: now,
        status: 'Mensagem enviada',
        followUpLevel: 0,
        nextFollowUpAt: calculateNextFollowUp(0, data.sentAt || now),
      };
      batch.set(leadRef, leadData);
    });

    batch.commit().then(() => {
      console.log('Firestore: Importação concluída.');
    }).catch(async (e) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ 
        path: 'leads', 
        operation: 'write',
        requestResourceData: 'Bulk Import'
      }));
    });
  };

  const markFollowUpDone = (id: string) => {
    if (!db || !user) return;
    const lead = leads.find(l => l.id === id);
    if (!lead) return;

    const leadRef = doc(db, 'leads', id);
    const now = new Date().toISOString();
    const nextLevel = lead.followUpLevel + 1;
    
    const updates = {
      followUpLevel: nextLevel,
      lastFollowUpAt: now,
      nextFollowUpAt: calculateNextFollowUp(nextLevel, now),
      updatedAt: serverTimestamp() as any
    };

    updateDoc(leadRef, updates).catch(async (e) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ 
        path: leadRef.path, 
        operation: 'update', 
        requestResourceData: updates 
      }));
    });
  };

  const updateMeeting = (meetingId: string, updates: Partial<Meeting>) => {
    if (!db || !user) return;
    const meetingRef = doc(db, 'meetings', meetingId);
    updateDoc(meetingRef, { ...updates, updatedAt: serverTimestamp() as any }).catch(async (e) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ 
        path: meetingRef.path, 
        operation: 'update', 
        requestResourceData: updates 
      }));
    });

    const meeting = meetings.find(m => m.id === meetingId);
    if (meeting && updates.status === 'Não vendido') {
      updateLead(meeting.leadId, { status: 'Não vendido' });
    }
  };

  const closeSale = (leadId: string, saleData: any) => {
    if (!db || !user) return;
    const salesCollection = collection(db, 'sales');
    const now = new Date().toISOString();
    
    const data = {
      ...saleData,
      leadId: leadId,
      soldAt: now,
    };

    addDoc(salesCollection, data).catch(async (e) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ 
        path: salesCollection.path, 
        operation: 'create', 
        requestResourceData: data 
      }));
    });

    updateLead(leadId, { status: 'Venda fechada' });
  };

  const saveConfig = (newConfig: OperationConfig) => {
    if (!db || !user) return;
    const configRef = doc(db, 'config', 'main');
    setDoc(configRef, newConfig).catch(async (e) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ 
        path: configRef.path, 
        operation: 'write', 
        requestResourceData: newConfig 
      }));
    });
  };

  const isLoading = !safetyTimeoutReached && (loadingLeads || loadingMeetings || loadingSales || loadingConfig) && !!db;
  const isFirestoreConnected = !!db && !!user && !dbError;

  return (
    <CRMContext.Provider value={{ 
      leads, meetings, sales, config, 
      isLoading, isFirestoreConnected, dbError,
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
