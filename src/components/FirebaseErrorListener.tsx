'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

/**
 * Componente ouvinte central de erros de permissão do Firebase.
 * Exibe um toast quando uma operação é negada pelas Security Rules.
 */
export default function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // Log centralizado para depuração em desenvolvimento
      console.error('Firebase Permission Error:', error);
      
      toast({
        variant: 'destructive',
        title: 'Erro de Permissão',
        description: error.message || 'Você não tem permissão para realizar esta ação.',
      });
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
