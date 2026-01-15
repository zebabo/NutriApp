import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Hook customizado para aceder ao contexto de autenticação
 * 
 * Uso:
 * const { session, hasProfile, isLoading, user, refreshProfile } = useAuth();
 * 
 * @returns {object} AuthContext
 * @throws {Error} Se usado fora do AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
};