import { useToast } from '@/components/ui/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { generateShoppingListFromDishes } from '@/services/utils';
import { ShoppingList as ShoppingListType } from '@/types';
import { Dish } from '@/types/dto/Dish';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';

// Clés de requête
export const weeklyDishKeys = {
  all: ['weeklyDishes'] as const,
  lists: () => [...weeklyDishKeys.all, 'list'] as const,
  shoppingList: () => [...weeklyDishKeys.all, 'shoppingList'] as const,
};

// Clés de stockage local
const STORAGE_KEYS = {
  WEEKLY_DISHES: 'weeklyDishes',
  SHOPPING_LIST: 'shoppingList',
} as const;

// Utilitaires de stockage local
const storage = {
  get: (key: string, defaultValue: any) => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set: (key: string, value: any) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde de ${key}:`, error);
    }
  },

  remove: (key: string) => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${key}:`, error);
    }
  },
};

// Hook pour récupérer les plats hebdomadaires
export const useWeeklyDishes = () => {
  const { currentUser } = useAuthContext();

  return useQuery({
    queryKey: weeklyDishKeys.lists(),
    queryFn: () => {
      // Récupérer depuis le stockage local
      return storage.get(STORAGE_KEYS.WEEKLY_DISHES, []);
    },
    enabled: !!currentUser,
    staleTime: Infinity, // Les données ne deviennent jamais "stale" automatiquement
    gcTime: Infinity, // Ne jamais supprimer du cache
  });
};

// Hook pour récupérer la liste de courses
export const useShoppingList = () => {
  const { currentUser } = useAuthContext();

  return useQuery({
    queryKey: weeklyDishKeys.shoppingList(),
    queryFn: () => {
      // Récupérer depuis le stockage local
      return storage.get(STORAGE_KEYS.SHOPPING_LIST, []);
    },
    enabled: !!currentUser,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

// Hook pour définir les plats hebdomadaires
export const useSetWeeklyDishes = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (dishes: Dish[]) => {
      // Sauvegarder dans le stockage local
      storage.set(STORAGE_KEYS.WEEKLY_DISHES, dishes);

      // Générer et sauvegarder la liste de courses
      const shoppingList = generateShoppingListFromDishes(dishes);
      storage.set(STORAGE_KEYS.SHOPPING_LIST, shoppingList);

      return { dishes, shoppingList };
    },
    onSuccess: (data) => {
      // Mettre à jour le cache
      queryClient.setQueryData(weeklyDishKeys.lists(), data.dishes);
      queryClient.setQueryData(
        weeklyDishKeys.shoppingList(),
        data.shoppingList
      );

      toast({
        title: t('valid:weeklyDishes.set.success'),
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

// Hook pour vider les plats hebdomadaires
export const useClearWeeklyDishes = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async () => {
      // Supprimer du stockage local
      storage.remove(STORAGE_KEYS.WEEKLY_DISHES);
      storage.remove(STORAGE_KEYS.SHOPPING_LIST);

      return { dishes: [], shoppingList: [] };
    },
    onSuccess: (data) => {
      // Mettre à jour le cache
      queryClient.setQueryData(weeklyDishKeys.lists(), data.dishes);
      queryClient.setQueryData(
        weeklyDishKeys.shoppingList(),
        data.shoppingList
      );

      toast({
        title: t('valid:weeklyDishes.clear.success'),
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

// Hook pour mettre à jour la liste de courses
export const useUpdateShoppingList = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (shoppingList: ShoppingListType[]) => {
      // Sauvegarder dans le stockage local
      storage.set(STORAGE_KEYS.SHOPPING_LIST, shoppingList);
      return shoppingList;
    },
    onSuccess: (data) => {
      // Mettre à jour le cache
      queryClient.setQueryData(weeklyDishKeys.shoppingList(), data);

      toast({
        title: t('valid:shoppingList.update.success'),
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
