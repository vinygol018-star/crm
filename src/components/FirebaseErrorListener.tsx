
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

/**
 * Componente ouvinte central de erros de permissão do Firebase.
 * Quando um erro de permissão contextual é emitido, este componente o lança como uma exceção
 * para que possa ser capturado pelo sistema de depuração e exibido no overlay de desenvolvimento.
 */
export default function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // Lança o erro para ser capturado pelo overlay de erro do Next.js
      // Isso fornece o feedback contextual necessário para depurar as Security Rules.
      throw error;
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  return null;
}
