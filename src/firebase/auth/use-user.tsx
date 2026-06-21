'use client';

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../provider';

/**
 * Hook para gerenciar o estado do usuário autenticado com proteção contra loading infinito.
 */
export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Timeout de segurança: se a autenticação não responder em 10 segundos,
    // liberamos o loading para permitir que o app mostre a tela de login ou erro.
    const timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('Auth check timed out - proceeding to prevent infinite loading.');
        setLoading(false);
      }
    }, 10000);

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (!isMounted) return;
        clearTimeout(timeoutId);
        setUser(user);
        setLoading(false);
      },
      (error) => {
        if (!isMounted) return;
        clearTimeout(timeoutId);
        console.error("Auth state change error:", error);
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [auth]);

  return { user, loading };
}
