import { useToast } from '@/components/ui/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { ApiService } from '@/services/api';
import { Dish } from '@/types/dto/Dish';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';

// Clés de requête
export const dishKeys = {
  all: ['dishes'] as const,
  lists: () => [...dishKeys.all, 'list'] as const,
  list: (filters: string) => [...dishKeys.lists(), { filters }] as const,
  details: () => [...dishKeys.all, 'detail'] as const,
  detail: (id: string) => [...dishKeys.details(), id] as const,
};

// Hook pour récupérer tous les plats
export const useDishes = () => {
  const { currentUser } = useAuthContext();
  const { t } = useTranslation();

  return useQuery({
    queryKey: dishKeys.lists(),
    queryFn: () => ApiService.dishes.get(),
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

// Hook pour créer un plat
export const useCreateDish = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: any) => ApiService.dishes.create(data),
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

// Hook pour mettre à jour un plat
export const useUpdateDish = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      ApiService.dishes.update(data, id),
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

// Hook pour supprimer un plat
export const useDeleteDish = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => ApiService.dishes.remove(id),
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
