import { useToast } from '@/components/ui/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { ApiService } from '@/services/api';
import { Dish } from '@/types/dto/Dish';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  OFFLINE_STORAGE_KEYS,
  offlineStorage,
  usePendingOperations,
} from './useOfflineStorage';

// Clés de requête
export const dishKeys = {
  all: ['dishes'] as const,
  lists: () => [...dishKeys.all, 'list'] as const,
  list: (filters: string) => [...dishKeys.lists(), { filters }] as const,
  details: () => [...dishKeys.all, 'detail'] as const,
  detail: (id: string) => [...dishKeys.details(), id] as const,
};

// Hook pour récupérer tous les plats avec fallback hors-ligne
export const useDishes = () => {
  const { currentUser } = useAuthContext();
  const { t } = useTranslation();

  return useQuery({
    queryKey: dishKeys.lists(),
    queryFn: async () => {
      try {
        // Essayer de récupérer depuis l'API
        const dishes = await ApiService.dishes.get();
        // Sauvegarder en local pour le mode hors-ligne
        offlineStorage.set(OFFLINE_STORAGE_KEYS.DISHES, dishes);
        return dishes;
      } catch (error) {
        // Si l'API échoue, essayer de récupérer depuis le stockage local
        console.log('Mode hors-ligne: récupération depuis le stockage local');
        const offlineDishes = offlineStorage.get(
          OFFLINE_STORAGE_KEYS.DISHES,
          []
        );
        return offlineDishes;
      }
    },
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook pour récupérer un plat par ID (utilise la liste complète)
export const useDish = (id: string) => {
  const { data: dishes = [] } = useDishes();

  const dish = React.useMemo(() => {
    return dishes.find((dish: Dish) => dish.id === id);
  }, [dishes, id]);

  return {
    data: dish,
    isLoading: false,
    error: null,
  };
};

// Hook pour créer un plat avec gestion hors-ligne
export const useCreateDish = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { addPendingOperation } = usePendingOperations();

  return useMutation({
    mutationFn: async (data: any) => {
      try {
        // Essayer de créer via l'API
        const newDish = await ApiService.dishes.create(data);

        // Mettre à jour le cache local
        const currentDishes = offlineStorage.get(
          OFFLINE_STORAGE_KEYS.DISHES,
          []
        );
        offlineStorage.set(OFFLINE_STORAGE_KEYS.DISHES, [
          ...currentDishes,
          newDish,
        ]);

        return newDish;
      } catch (error) {
        // Si hors-ligne, ajouter à la file d'attente et créer localement
        if (offlineStorage.isOffline()) {
          const tempId = `temp_${Date.now()}`;
          const tempDish = {
            ...data,
            id: tempId,
            createdAt: new Date().toISOString(),
          };

          // Sauvegarder en local
          const currentDishes = offlineStorage.get(
            OFFLINE_STORAGE_KEYS.DISHES,
            []
          );
          offlineStorage.set(OFFLINE_STORAGE_KEYS.DISHES, [
            ...currentDishes,
            tempDish,
          ]);

          // Ajouter à la file d'attente
          addPendingOperation({
            type: 'CREATE',
            entity: 'dish',
            data: { ...data, tempId },
          });

          return tempDish;
        }
        throw error;
      }
    },
    onSuccess: () => {
      // Invalider et refetch les listes de plats
      queryClient.invalidateQueries({ queryKey: dishKeys.lists() });
      toast({
        title: t('valid:dish.addedSuccess'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t(error.data?.response?.title || 'errors:generic'),
        description: t(error.data?.response?.message || 'errors:generic'),
        variant: 'destructive',
      });
    },
  });
};

// Hook pour mettre à jour un plat avec gestion hors-ligne
export const useUpdateDish = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { addPendingOperation } = usePendingOperations();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      try {
        // Essayer de mettre à jour via l'API
        const updatedDish = await ApiService.dishes.update(data, id);

        // Mettre à jour le cache local
        const currentDishes = offlineStorage.get(
          OFFLINE_STORAGE_KEYS.DISHES,
          []
        );
        const updatedDishes = currentDishes.map((dish: Dish) =>
          dish.id === id ? updatedDish : dish
        );
        offlineStorage.set(OFFLINE_STORAGE_KEYS.DISHES, updatedDishes);

        return updatedDish;
      } catch (error) {
        // Si hors-ligne, ajouter à la file d'attente et mettre à jour localement
        if (offlineStorage.isOffline()) {
          const currentDishes = offlineStorage.get(
            OFFLINE_STORAGE_KEYS.DISHES,
            []
          );
          const updatedDishes = currentDishes.map((dish: Dish) =>
            dish.id === id
              ? { ...dish, ...data, updatedAt: new Date().toISOString() }
              : dish
          );
          offlineStorage.set(OFFLINE_STORAGE_KEYS.DISHES, updatedDishes);

          // Ajouter à la file d'attente
          addPendingOperation({
            type: 'UPDATE',
            entity: 'dish',
            data: { id, ...data },
          });

          return updatedDishes.find((dish: Dish) => dish.id === id);
        }
        throw error;
      }
    },
    onSuccess: (_, { id }) => {
      // Invalider les requêtes spécifiques
      queryClient.invalidateQueries({ queryKey: dishKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: dishKeys.lists() });
      toast({
        title: t('valid:dish.updatedSuccess'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t(error.data?.response?.title || 'errors:generic'),
        description: t(error.data?.response?.message || 'errors:generic'),
        variant: 'destructive',
      });
    },
  });
};

// Hook pour supprimer un plat avec gestion hors-ligne
export const useDeleteDish = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { addPendingOperation } = usePendingOperations();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        // Essayer de supprimer via l'API
        await ApiService.dishes.remove(id);

        // Mettre à jour le cache local
        const currentDishes = offlineStorage.get(
          OFFLINE_STORAGE_KEYS.DISHES,
          []
        );
        const filteredDishes = currentDishes.filter(
          (dish: Dish) => dish.id !== id
        );
        offlineStorage.set(OFFLINE_STORAGE_KEYS.DISHES, filteredDishes);

        return id;
      } catch (error) {
        // Si hors-ligne, ajouter à la file d'attente et supprimer localement
        if (offlineStorage.isOffline()) {
          const currentDishes = offlineStorage.get(
            OFFLINE_STORAGE_KEYS.DISHES,
            []
          );
          const filteredDishes = currentDishes.filter(
            (dish: Dish) => dish.id !== id
          );
          offlineStorage.set(OFFLINE_STORAGE_KEYS.DISHES, filteredDishes);

          // Ajouter à la file d'attente
          addPendingOperation({
            type: 'DELETE',
            entity: 'dish',
            data: { id },
          });

          return id;
        }
        throw error;
      }
    },
    onSuccess: (_, id) => {
      // Supprimer du cache et invalider les listes
      queryClient.removeQueries({ queryKey: dishKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: dishKeys.lists() });
      toast({
        title: t('valid:dish.deletedSuccess'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t(error.data?.response?.title || 'errors:generic'),
        description: t(error.data?.response?.message || 'errors:generic'),
        variant: 'destructive',
      });
    },
  });
};

// Hook utilitaire pour obtenir les tags uniques
export const useDishTags = () => {
  const { data: dishes = [] } = useDishes();

  const tags = React.useMemo(() => {
    const allTags = dishes.map((dish: Dish) => dish.tags).flat();
    return Array.from(new Set(allTags));
  }, [dishes]);

  return tags;
};
