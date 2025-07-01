import { useEffect, useState } from 'react';
import { useSyncOfflineData } from './useOfflineStorage';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const { syncPendingOperations } = useSyncOfflineData();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Connexion rétablie - synchronisation des données...');
      // Synchroniser les données en attente quand on revient en ligne
      syncPendingOperations();
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('Connexion perdue - mode hors-ligne activé');
    };

    // Écouter les événements de changement de statut réseau
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Vérifier le statut initial
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncPendingOperations]);

  return { isOnline };
};
