import { useToast } from '@/components/ui/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { ApiService } from '@/services/api';
import { Food } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  OFFLINE_STORAGE_KEYS,
  offlineStorage,
  usePendingOperations,
} from './useOfflineStorage';

// Clés de requête
export const foodKeys = {
  all: ['foods'] as const,
  lists: () => [...foodKeys.all, 'list'] as const,
  list: (filters: string) => [...foodKeys.lists(), { filters }] as const,
  details: () => [...foodKeys.all, 'detail'] as const,
  detail: (id: string) => [...foodKeys.details(), id] as const,
};

// Hook pour récupérer tous les aliments avec fallback hors-ligne
export const useFoods = () => {
  const { currentUser } = useAuthContext();
  const { t } = useTranslation();

  return useQuery({
    queryKey: foodKeys.lists(),
    queryFn: async () => {
      try {
        // Essayer de récupérer depuis l'API
        const foods = await ApiService.foods.get();
        // Sauvegarder en local pour le mode hors-ligne
        offlineStorage.set(OFFLINE_STORAGE_KEYS.FOODS, foods);
        return foods;
      } catch (error) {
        // Si l'API échoue, essayer de récupérer depuis le stockage local
        console.log('Mode hors-ligne: récupération depuis le stockage local');
        const offlineFoods = offlineStorage.get(OFFLINE_STORAGE_KEYS.FOODS, []);
        return offlineFoods;
      }
    },
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook pour récupérer un aliment par ID
export const useFood = (id: string) => {
  const { data: foods = [] } = useFoods();

  const food = React.useMemo(() => {
    return foods.find((food: Food) => food.id === id);
  }, [foods, id]);

  return {
    data: food,
    isLoading: false,
    error: null,
  };
};

// Hook pour créer un aliment avec gestion hors-ligne
export const useCreateFood = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { addPendingOperation } = usePendingOperations();

  return useMutation({
    mutationFn: async (data: any) => {
      try {
        // Essayer de créer via l'API
        const newFood = await ApiService.foods.create(data);

        // Mettre à jour le cache local
        const currentFoods = offlineStorage.get(OFFLINE_STORAGE_KEYS.FOODS, []);
        offlineStorage.set(OFFLINE_STORAGE_KEYS.FOODS, [
          ...currentFoods,
          newFood,
        ]);

        return newFood;
      } catch (error) {
        // Si hors-ligne, ajouter à la file d'attente et créer localement
        if (offlineStorage.isOffline()) {
          const tempId = `temp_${Date.now()}`;
          const tempFood = {
            ...data,
            id: tempId,
            createdAt: new Date().toISOString(),
          };

          // Sauvegarder en local
          const currentFoods = offlineStorage.get(
            OFFLINE_STORAGE_KEYS.FOODS,
            []
          );
          offlineStorage.set(OFFLINE_STORAGE_KEYS.FOODS, [
            ...currentFoods,
            tempFood,
          ]);

          // Ajouter à la file d'attente
          addPendingOperation({
            type: 'CREATE',
            entity: 'food',
            data: { ...data, tempId },
          });

          return tempFood;
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: foodKeys.lists() });
      toast({
        title: t('valid:food.addedSuccess'),
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

// Hook pour mettre à jour un aliment avec gestion hors-ligne
export const useUpdateFood = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { addPendingOperation } = usePendingOperations();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      try {
        // Essayer de mettre à jour via l'API
        const updatedFood = await ApiService.foods.update(data, id);

        // Mettre à jour le cache local
        const currentFoods = offlineStorage.get(OFFLINE_STORAGE_KEYS.FOODS, []);
        const updatedFoods = currentFoods.map((food: Food) =>
          food.id === id ? updatedFood : food
        );
        offlineStorage.set(OFFLINE_STORAGE_KEYS.FOODS, updatedFoods);

        return updatedFood;
      } catch (error) {
        // Si hors-ligne, ajouter à la file d'attente et mettre à jour localement
        if (offlineStorage.isOffline()) {
          const currentFoods = offlineStorage.get(
            OFFLINE_STORAGE_KEYS.FOODS,
            []
          );
          const updatedFoods = currentFoods.map((food: Food) =>
            food.id === id
              ? { ...food, ...data, updatedAt: new Date().toISOString() }
              : food
          );
          offlineStorage.set(OFFLINE_STORAGE_KEYS.FOODS, updatedFoods);

          // Ajouter à la file d'attente
          addPendingOperation({
            type: 'UPDATE',
            entity: 'food',
            data: { id, ...data },
          });

          return updatedFoods.find((food: Food) => food.id === id);
        }
        throw error;
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: foodKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: foodKeys.lists() });
      toast({
        title: t('valid:food.updatedSuccess'),
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

// Hook pour supprimer un aliment avec gestion hors-ligne
export const useDeleteFood = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { addPendingOperation } = usePendingOperations();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        // Essayer de supprimer via l'API
        await ApiService.foods.remove(id);

        // Mettre à jour le cache local
        const currentFoods = offlineStorage.get(OFFLINE_STORAGE_KEYS.FOODS, []);
        const filteredFoods = currentFoods.filter(
          (food: Food) => food.id !== id
        );
        offlineStorage.set(OFFLINE_STORAGE_KEYS.FOODS, filteredFoods);

        return id;
      } catch (error) {
        // Si hors-ligne, ajouter à la file d'attente et supprimer localement
        if (offlineStorage.isOffline()) {
          const currentFoods = offlineStorage.get(
            OFFLINE_STORAGE_KEYS.FOODS,
            []
          );
          const filteredFoods = currentFoods.filter(
            (food: Food) => food.id !== id
          );
          offlineStorage.set(OFFLINE_STORAGE_KEYS.FOODS, filteredFoods);

          // Ajouter à la file d'attente
          addPendingOperation({
            type: 'DELETE',
            entity: 'food',
            data: { id },
          });

          return id;
        }
        throw error;
      }
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: foodKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: foodKeys.lists() });
      toast({
        title: t('valid:food.deletedSuccesss'),
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
