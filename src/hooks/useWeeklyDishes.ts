import { useToast } from '@/components/ui/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { generateShoppingListFromDishes } from '@/services/utils';
import { ShoppingList as ShoppingListType } from '@/types';
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
export const weeklyDishKeys = {
  all: ['weeklyDishes'] as const,
  lists: () => [...weeklyDishKeys.all, 'list'] as const,
  shoppingList: () => [...weeklyDishKeys.all, 'shoppingList'] as const,
};

// Hook pour récupérer les plats hebdomadaires avec gestion hors-ligne
export const useWeeklyDishes = () => {
  const { currentUser } = useAuthContext();

  return useQuery({
    queryKey: weeklyDishKeys.lists(),
    queryFn: async () => {
      try {
        // Essayer de récupérer depuis l'API (si tu en as une)
        // const weeklyDishes = await ApiService.weeklyDishes.get();
        // offlineStorage.set(OFFLINE_STORAGE_KEYS.WEEKLY_DISHES, weeklyDishes);
        // return weeklyDishes;

        // Pour l'instant, récupérer depuis le stockage local
        return offlineStorage.get(OFFLINE_STORAGE_KEYS.WEEKLY_DISHES, []);
      } catch (error) {
        // Fallback vers le stockage local
        console.log(
          'Mode hors-ligne: récupération des plats hebdomadaires depuis le stockage local'
        );
        return offlineStorage.get(OFFLINE_STORAGE_KEYS.WEEKLY_DISHES, []);
      }
    },
    enabled: !!currentUser,
    staleTime: Infinity, // Les données ne deviennent jamais "stale" automatiquement
    gcTime: Infinity, // Ne jamais supprimer du cache
  });
};

// Hook pour récupérer la liste de courses avec gestion hors-ligne
export const useShoppingList = () => {
  const { currentUser } = useAuthContext();

  return useQuery({
    queryKey: weeklyDishKeys.shoppingList(),
    queryFn: async () => {
      try {
        // Essayer de récupérer depuis l'API (si tu en as une)
        // const shoppingList = await ApiService.shoppingList.get();
        // offlineStorage.set(OFFLINE_STORAGE_KEYS.SHOPPING_LIST, shoppingList);
        // return shoppingList;

        // Pour l'instant, récupérer depuis le stockage local
        return offlineStorage.get(OFFLINE_STORAGE_KEYS.SHOPPING_LIST, []);
      } catch (error) {
        // Fallback vers le stockage local
        console.log(
          'Mode hors-ligne: récupération de la liste de courses depuis le stockage local'
        );
        return offlineStorage.get(OFFLINE_STORAGE_KEYS.SHOPPING_LIST, []);
      }
    },
    enabled: !!currentUser,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

// Hook pour définir les plats hebdomadaires avec gestion hors-ligne
export const useSetWeeklyDishes = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { addPendingOperation } = usePendingOperations();

  return useMutation({
    mutationFn: async (dishes: Dish[]) => {
      try {
        // Essayer de sauvegarder via l'API (si tu en as une)
        // await ApiService.weeklyDishes.set(dishes);

        // Sauvegarder dans le stockage local
        offlineStorage.set(OFFLINE_STORAGE_KEYS.WEEKLY_DISHES, dishes);

        // Générer et sauvegarder la liste de courses
        const shoppingList = generateShoppingListFromDishes(dishes);
        offlineStorage.set(OFFLINE_STORAGE_KEYS.SHOPPING_LIST, shoppingList);

        // Ajouter à la file d'attente si hors-ligne
        if (offlineStorage.isOffline()) {
          addPendingOperation({
            type: 'UPDATE',
            entity: 'weeklyDishes',
            data: { dishes, shoppingList },
          });
        }

        return { dishes, shoppingList };
      } catch (error) {
        // Si hors-ligne, sauvegarder localement et ajouter à la file d'attente
        if (offlineStorage.isOffline()) {
          offlineStorage.set(OFFLINE_STORAGE_KEYS.WEEKLY_DISHES, dishes);
          const shoppingList = generateShoppingListFromDishes(dishes);
          offlineStorage.set(OFFLINE_STORAGE_KEYS.SHOPPING_LIST, shoppingList);

          addPendingOperation({
            type: 'UPDATE',
            entity: 'weeklyDishes',
            data: { dishes, shoppingList },
          });

          return { dishes, shoppingList };
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      // Mettre à jour le cache
      queryClient.setQueryData(weeklyDishKeys.lists(), data.dishes);
      queryClient.setQueryData(
        weeklyDishKeys.shoppingList(),
        data.shoppingList
      );

      toast({
        title: t('valid:weeklyDishes.updatedSuccess'),
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

// Hook pour vider les plats hebdomadaires avec gestion hors-ligne
export const useClearWeeklyDishes = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { addPendingOperation } = usePendingOperations();

  return useMutation({
    mutationFn: async () => {
      try {
        // Essayer de supprimer via l'API (si tu en as une)
        // await ApiService.weeklyDishes.clear();

        // Supprimer du stockage local
        offlineStorage.remove(OFFLINE_STORAGE_KEYS.WEEKLY_DISHES);
        offlineStorage.remove(OFFLINE_STORAGE_KEYS.SHOPPING_LIST);

        // Ajouter à la file d'attente si hors-ligne
        if (offlineStorage.isOffline()) {
          addPendingOperation({
            type: 'DELETE',
            entity: 'weeklyDishes',
            data: { clear: true },
          });
        }

        return { dishes: [], shoppingList: [] };
      } catch (error) {
        // Si hors-ligne, supprimer localement et ajouter à la file d'attente
        if (offlineStorage.isOffline()) {
          offlineStorage.remove(OFFLINE_STORAGE_KEYS.WEEKLY_DISHES);
          offlineStorage.remove(OFFLINE_STORAGE_KEYS.SHOPPING_LIST);

          addPendingOperation({
            type: 'DELETE',
            entity: 'weeklyDishes',
            data: { clear: true },
          });

          return { dishes: [], shoppingList: [] };
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      // Mettre à jour le cache
      queryClient.setQueryData(weeklyDishKeys.lists(), data.dishes);
      queryClient.setQueryData(
        weeklyDishKeys.shoppingList(),
        data.shoppingList
      );

      toast({
        title: t('valid:weeklyDishes.clearedSuccess'),
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

// Hook pour mettre à jour la liste de courses avec gestion hors-ligne
export const useUpdateShoppingList = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { addPendingOperation } = usePendingOperations();

  return useMutation({
    mutationFn: async (shoppingList: ShoppingListType[]) => {
      try {
        // Essayer de sauvegarder via l'API (si tu en as une)
        // await ApiService.shoppingList.update(shoppingList);

        // Sauvegarder dans le stockage local
        offlineStorage.set(OFFLINE_STORAGE_KEYS.SHOPPING_LIST, shoppingList);

        // Ajouter à la file d'attente si hors-ligne
        if (offlineStorage.isOffline()) {
          addPendingOperation({
            type: 'UPDATE',
            entity: 'shoppingList',
            data: { shoppingList },
          });
        }

        return shoppingList;
      } catch (error) {
        // Si hors-ligne, sauvegarder localement et ajouter à la file d'attente
        if (offlineStorage.isOffline()) {
          offlineStorage.set(OFFLINE_STORAGE_KEYS.SHOPPING_LIST, shoppingList);

          addPendingOperation({
            type: 'UPDATE',
            entity: 'shoppingList',
            data: { shoppingList },
          });

          return shoppingList;
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      // Mettre à jour le cache
      queryClient.setQueryData(weeklyDishKeys.shoppingList(), data);

      toast({
        title: t('valid:shoppingList.updatedSuccess'),
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

// Hook utilitaire pour obtenir un plat hebdomadaire par ID
export const useWeeklyDish = (id: string) => {
  const { data: weeklyDishes = [] } = useWeeklyDishes();

  const dish = React.useMemo(() => {
    return weeklyDishes.find((dish: Dish) => dish.id === id);
  }, [weeklyDishes, id]);

  return {
    data: dish,
    isLoading: false,
    error: null,
  };
};
