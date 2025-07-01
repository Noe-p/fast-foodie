import { useToast } from '@/components/ui/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { ApiService } from '@/services/api';
import { Food } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';

// Clés de requête
export const foodKeys = {
  all: ['foods'] as const,
  lists: () => [...foodKeys.all, 'list'] as const,
  list: (filters: string) => [...foodKeys.lists(), { filters }] as const,
  details: () => [...foodKeys.all, 'detail'] as const,
  detail: (id: string) => [...foodKeys.details(), id] as const,
};

// Hook pour récupérer tous les aliments
export const useFoods = () => {
  const { currentUser } = useAuthContext();
  const { t } = useTranslation();

  return useQuery({
    queryKey: foodKeys.lists(),
    queryFn: () => ApiService.foods.get(),
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

// Hook pour créer un aliment
export const useCreateFood = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: any) => ApiService.foods.create(data),
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

// Hook pour mettre à jour un aliment
export const useUpdateFood = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      ApiService.foods.update(data, id),
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

// Hook pour supprimer un aliment
export const useDeleteFood = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => ApiService.foods.remove(id),
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
