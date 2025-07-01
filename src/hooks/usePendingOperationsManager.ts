import { useToast } from '@/components/ui/use-toast';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PendingOperation,
  usePendingOperations,
  useSyncOfflineData,
} from './useOfflineStorage';

export const usePendingOperationsManager = () => {
  const {
    getPendingOperations,
    removePendingOperation,
    clearPendingOperations,
  } = usePendingOperations();
  const { syncPendingOperations, syncSingleOperation } = useSyncOfflineData();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [isSyncing, setIsSyncing] = useState(false);

  // Récupérer toutes les opérations en attente
  const getOperations = useCallback(() => {
    return getPendingOperations();
  }, [getPendingOperations]);

  // Synchroniser toutes les opérations
  const syncAll = useCallback(async () => {
    setIsSyncing(true);
    try {
      const summary = await syncPendingOperations();
      return summary;
    } finally {
      setIsSyncing(false);
    }
  }, [syncPendingOperations]);

  // Synchroniser une opération spécifique
  const syncOne = useCallback(
    async (operationId: string) => {
      try {
        const result = await syncSingleOperation(operationId);
        return result;
      } catch (error) {
        console.error('Erreur lors de la synchronisation:', error);
        return null;
      }
    },
    [syncSingleOperation]
  );

  // Supprimer une opération en attente (sans la synchroniser)
  const removeOperation = useCallback(
    (operationId: string) => {
      removePendingOperation(operationId);
      toast({
        title: 'Opération supprimée',
        description: "L'opération a été supprimée de la file d'attente",
      });
    },
    [removePendingOperation, toast]
  );

  // Vider toutes les opérations en attente
  const clearAll = useCallback(() => {
    clearPendingOperations();
    toast({
      title: "File d'attente vidée",
      description: 'Toutes les opérations en attente ont été supprimées',
    });
  }, [clearPendingOperations, toast]);

  // Obtenir le nombre d'opérations en attente
  const getPendingCount = useCallback(() => {
    return getPendingOperations().length;
  }, [getPendingOperations]);

  // Formater une opération pour l'affichage
  const formatOperation = useCallback((operation: PendingOperation) => {
    const entityLabels = {
      dish: 'Plat',
      food: 'Aliment',
      weeklyDishes: 'Plats hebdomadaires',
      shoppingList: 'Liste de courses',
    };

    const actionLabels = {
      CREATE: 'Création',
      UPDATE: 'Modification',
      DELETE: 'Suppression',
    };

    return {
      id: operation.id,
      label: `${actionLabels[operation.type]} d'un ${
        entityLabels[operation.entity]
      }`,
      timestamp: new Date(operation.timestamp).toLocaleString(),
      entity: operation.entity,
      type: operation.type,
      data: operation.data,
    };
  }, []);

  // Vérifier si on peut synchroniser (en ligne et opérations en attente)
  const canSync = useCallback(() => {
    return navigator.onLine && getPendingCount() > 0;
  }, [getPendingCount]);

  return {
    // État
    isSyncing,

    // Données
    getOperations,
    getPendingCount,
    formatOperation,

    // Actions
    syncAll,
    syncOne,
    removeOperation,
    clearAll,

    // Utilitaires
    canSync,
  };
};
