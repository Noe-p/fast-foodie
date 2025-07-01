import { PendingOperation } from '@/hooks/useOfflineStorage';
import { ApiService } from './api';

export interface SyncResult {
  success: boolean;
  operationId: string;
  error?: string;
  syncedData?: any;
}

export interface SyncSummary {
  total: number;
  successful: number;
  failed: number;
  results: SyncResult[];
}

class SyncService {
  /**
   * Synchronise une opération en attente avec l'API
   */
  private async syncOperation(
    operation: PendingOperation
  ): Promise<SyncResult> {
    try {
      switch (operation.entity) {
        case 'dish':
          return await this.syncDishOperation(operation);
        case 'food':
          return await this.syncFoodOperation(operation);
        case 'weeklyDishes':
          return await this.syncWeeklyDishesOperation(operation);
        case 'shoppingList':
          return await this.syncShoppingListOperation(operation);
        default:
          throw new Error(`Entité non supportée: ${operation.entity}`);
      }
    } catch (error) {
      console.error(
        `Erreur lors de la synchronisation de l'opération ${operation.id}:`,
        error
      );
      return {
        success: false,
        operationId: operation.id,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  /**
   * Synchronise les opérations sur les plats
   */
  private async syncDishOperation(
    operation: PendingOperation
  ): Promise<SyncResult> {
    const { type, data } = operation;

    switch (type) {
      case 'CREATE':
        const newDish = await ApiService.dishes.create(data);
        return {
          success: true,
          operationId: operation.id,
          syncedData: newDish,
        };

      case 'UPDATE':
        const updatedDish = await ApiService.dishes.update(data, data.id);
        return {
          success: true,
          operationId: operation.id,
          syncedData: updatedDish,
        };

      case 'DELETE':
        await ApiService.dishes.remove(data.id);
        return {
          success: true,
          operationId: operation.id,
        };

      default:
        throw new Error(`Type d'opération non supporté: ${type}`);
    }
  }

  /**
   * Synchronise les opérations sur les aliments
   */
  private async syncFoodOperation(
    operation: PendingOperation
  ): Promise<SyncResult> {
    const { type, data } = operation;

    switch (type) {
      case 'CREATE':
        const newFood = await ApiService.foods.create(data);
        return {
          success: true,
          operationId: operation.id,
          syncedData: newFood,
        };

      case 'UPDATE':
        const updatedFood = await ApiService.foods.update(data, data.id);
        return {
          success: true,
          operationId: operation.id,
          syncedData: updatedFood,
        };

      case 'DELETE':
        await ApiService.foods.remove(data.id);
        return {
          success: true,
          operationId: operation.id,
        };

      default:
        throw new Error(`Type d'opération non supporté: ${type}`);
    }
  }

  /**
   * Synchronise les opérations sur les plats hebdomadaires
   * Note: Si tu n'as pas d'API pour les plats hebdomadaires, cette méthode peut être adaptée
   */
  private async syncWeeklyDishesOperation(
    operation: PendingOperation
  ): Promise<SyncResult> {
    const { type, data } = operation;

    switch (type) {
      case 'UPDATE':
        // Si tu as une API pour les plats hebdomadaires, utilise-la ici
        // await ApiService.weeklyDishes.set(data.dishes);
        console.log('Synchronisation des plats hebdomadaires:', data);
        return {
          success: true,
          operationId: operation.id,
          syncedData: data,
        };

      case 'DELETE':
        // Si tu as une API pour vider les plats hebdomadaires
        // await ApiService.weeklyDishes.clear();
        console.log('Suppression des plats hebdomadaires');
        return {
          success: true,
          operationId: operation.id,
        };

      default:
        throw new Error(
          `Type d'opération non supporté pour les plats hebdomadaires: ${type}`
        );
    }
  }

  /**
   * Synchronise les opérations sur la liste de courses
   * Note: Si tu n'as pas d'API pour la liste de courses, cette méthode peut être adaptée
   */
  private async syncShoppingListOperation(
    operation: PendingOperation
  ): Promise<SyncResult> {
    const { type, data } = operation;

    switch (type) {
      case 'UPDATE':
        // Si tu as une API pour la liste de courses, utilise-la ici
        // await ApiService.shoppingList.update(data.shoppingList);
        console.log('Synchronisation de la liste de courses:', data);
        return {
          success: true,
          operationId: operation.id,
          syncedData: data,
        };

      default:
        throw new Error(
          `Type d'opération non supporté pour la liste de courses: ${type}`
        );
    }
  }

  /**
   * Synchronise toutes les opérations en attente
   */
  async syncAllOperations(
    pendingOperations: PendingOperation[]
  ): Promise<SyncSummary> {
    const results: SyncResult[] = [];
    let successful = 0;
    let failed = 0;

    console.log(
      `Début de la synchronisation de ${pendingOperations.length} opérations...`
    );

    // Traiter les opérations dans l'ordre chronologique
    const sortedOperations = [...pendingOperations].sort(
      (a, b) => a.timestamp - b.timestamp
    );

    for (const operation of sortedOperations) {
      try {
        const result = await this.syncOperation(operation);
        results.push(result);

        if (result.success) {
          successful++;
          console.log(`✅ Opération ${operation.id} synchronisée avec succès`);
        } else {
          failed++;
          console.error(
            `❌ Échec de la synchronisation de l'opération ${operation.id}:`,
            result.error
          );
        }
      } catch (error) {
        failed++;
        const errorResult: SyncResult = {
          success: false,
          operationId: operation.id,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
        };
        results.push(errorResult);
        console.error(
          `❌ Erreur lors de la synchronisation de l'opération ${operation.id}:`,
          error
        );
      }
    }

    const summary: SyncSummary = {
      total: pendingOperations.length,
      successful,
      failed,
      results,
    };

    console.log(
      `Synchronisation terminée: ${successful}/${pendingOperations.length} opérations réussies`
    );
    return summary;
  }

  /**
   * Synchronise une opération spécifique
   */
  async syncSingleOperation(operation: PendingOperation): Promise<SyncResult> {
    return await this.syncOperation(operation);
  }
}

export const syncService = new SyncService();
