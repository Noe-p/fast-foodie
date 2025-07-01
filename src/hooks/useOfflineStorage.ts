import { useToast } from '@/components/ui/use-toast';
import { syncService, SyncSummary } from '@/services/syncService';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

// Clés de stockage local pour les données hors-ligne
export const OFFLINE_STORAGE_KEYS = {
  DISHES: 'offline_dishes',
  FOODS: 'offline_foods',
  WEEKLY_DISHES: 'weeklyDishes',
  SHOPPING_LIST: 'shoppingList',
  PENDING_OPERATIONS: 'pending_operations',
} as const;

// Types pour les opérations en attente
export interface PendingOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'dish' | 'food' | 'weeklyDishes' | 'shoppingList';
  data?: any;
  timestamp: number;
}

// Utilitaires de stockage local avec gestion d'erreurs
export const offlineStorage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      if (typeof window === 'undefined') return defaultValue;
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Erreur lors de la lecture de ${key}:`, error);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde de ${key}:`, error);
    }
  },

  remove: (key: string): void => {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${key}:`, error);
    }
  },

  // Vérifier si on est en mode hors-ligne
  isOffline: (): boolean => {
    return !navigator.onLine;
  },
};

// Hook pour gérer les opérations en attente
export const usePendingOperations = () => {
  const getPendingOperations = useCallback((): PendingOperation[] => {
    return offlineStorage.get(OFFLINE_STORAGE_KEYS.PENDING_OPERATIONS, []);
  }, []);

  const addPendingOperation = useCallback(
    (operation: Omit<PendingOperation, 'id' | 'timestamp'>) => {
      const pending = getPendingOperations();
      const newOperation: PendingOperation = {
        ...operation,
        id: `${operation.type}_${operation.entity}_${Date.now()}`,
        timestamp: Date.now(),
      };
      offlineStorage.set(OFFLINE_STORAGE_KEYS.PENDING_OPERATIONS, [
        ...pending,
        newOperation,
      ]);
    },
    [getPendingOperations]
  );

  const removePendingOperation = useCallback(
    (id: string) => {
      const pending = getPendingOperations();
      const filtered = pending.filter((op) => op.id !== id);
      offlineStorage.set(OFFLINE_STORAGE_KEYS.PENDING_OPERATIONS, filtered);
    },
    [getPendingOperations]
  );

  const clearPendingOperations = useCallback(() => {
    offlineStorage.remove(OFFLINE_STORAGE_KEYS.PENDING_OPERATIONS);
  }, []);

  return {
    getPendingOperations,
    addPendingOperation,
    removePendingOperation,
    clearPendingOperations,
  };
};

// Hook pour synchroniser les données quand on revient en ligne
export const useSyncOfflineData = () => {
  const { getPendingOperations, removePendingOperation } =
    usePendingOperations();
  const { toast } = useToast();
  const { t } = useTranslation();

  const syncPendingOperations =
    useCallback(async (): Promise<SyncSummary | null> => {
      if (offlineStorage.isOffline()) {
        console.log('Pas de connexion réseau - synchronisation impossible');
        return null;
      }

      const pending = getPendingOperations();
      if (pending.length === 0) {
        console.log('Aucune opération en attente à synchroniser');
        return null;
      }

      try {
        // Afficher une notification de synchronisation en cours
        toast({
          title: t('sync.pending'),
          description: `${pending.length} opération(s) en cours de synchronisation...`,
        });

        // Synchroniser toutes les opérations
        const summary = await syncService.syncAllOperations(pending);

        // Supprimer les opérations réussies du stockage local
        summary.results.forEach((result) => {
          if (result.success) {
            removePendingOperation(result.operationId);
          }
        });

        // Afficher le résultat de la synchronisation
        if (summary.successful > 0) {
          toast({
            title: t('sync.success'),
            description: `${summary.successful}/${summary.total} opération(s) synchronisée(s) avec succès`,
          });
        }

        if (summary.failed > 0) {
          toast({
            title: t('sync.error'),
            description: `${summary.failed} opération(s) ont échoué`,
            variant: 'destructive',
          });
        }

        console.log('Résumé de la synchronisation:', summary);
        return summary;
      } catch (error) {
        console.error('Erreur lors de la synchronisation:', error);
        toast({
          title: t('sync.error'),
          description: 'Erreur lors de la synchronisation des données',
          variant: 'destructive',
        });
        return null;
      }
    }, [getPendingOperations, removePendingOperation, toast, t]);

  const syncSingleOperation = useCallback(
    async (operationId: string) => {
      if (offlineStorage.isOffline()) {
        console.log('Pas de connexion réseau - synchronisation impossible');
        return null;
      }

      const pending = getPendingOperations();
      const operation = pending.find((op) => op.id === operationId);

      if (!operation) {
        console.log(`Opération ${operationId} non trouvée`);
        return null;
      }

      try {
        const result = await syncService.syncSingleOperation(operation);

        if (result.success) {
          removePendingOperation(operationId);
          toast({
            title: t('sync.success'),
            description: 'Opération synchronisée avec succès',
          });
        } else {
          toast({
            title: t('sync.error'),
            description: result.error || 'Erreur lors de la synchronisation',
            variant: 'destructive',
          });
        }

        return result;
      } catch (error) {
        console.error(
          `Erreur lors de la synchronisation de l'opération ${operationId}:`,
          error
        );
        toast({
          title: t('sync.error'),
          description: 'Erreur lors de la synchronisation',
          variant: 'destructive',
        });
        return null;
      }
    },
    [getPendingOperations, removePendingOperation, toast, t]
  );

  return {
    syncPendingOperations,
    syncSingleOperation,
  };
};
