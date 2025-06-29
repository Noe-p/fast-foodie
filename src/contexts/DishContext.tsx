import { useToast } from '@/components/ui/use-toast';
import { ApiService } from '@/services/api';
import { generateShoppingListFromDishes } from '@/services/utils';
import { Food, ShoppingList as ShoppingListType } from '@/types';
import { Dish } from '@/types/dto/Dish';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from './AuthContext';

// Types pour le contexte
interface State {
  dishes: Dish[];
  weeklyDishes: Dish[];
  shoppingList: ShoppingListType[];
  tags: string[];
  foods: Food[];
  isInitializing: boolean;
  isRefreshing: boolean;
  hasCachedData: boolean;
  lastSyncTime: number | null;
  error: string | null;
}

interface Context extends State {
  setWeeklyDishes: (dishes: Dish[]) => void;
  clearData: () => void;
  refresh: () => Promise<void>;
  setShoppingList: (list: ShoppingListType[]) => void;
  clearWeeklyDishes: () => void;
  getDishesById: (id: string, fromWeekly: boolean) => Dish | undefined;
  isLoading: boolean;
  hasData: boolean;
}

const defaultState: State = {
  dishes: [],
  weeklyDishes: [],
  shoppingList: [],
  tags: [],
  foods: [],
  isInitializing: true,
  isRefreshing: false,
  hasCachedData: false,
  lastSyncTime: null,
  error: null,
};

// Création du contexte
const DishContext = React.createContext<Context>({
  ...defaultState,
  isLoading: true,
  setWeeklyDishes: () => {
    throw new Error('DishContext.setWeeklyDishes has not been set');
  },
  refresh: () => {
    throw new Error('DishContext.refresh has not been set');
  },
  setShoppingList: () => {
    throw new Error('DishContext.setShoppingList has not been set');
  },
  clearData: () => {
    throw new Error('DishContext.clearData has not been set');
  },
  clearWeeklyDishes: () => {
    throw new Error('DishContext.clearWeeklyDishes has not been set');
  },
  getDishesById: () => {
    throw new Error('DishContext.getDishesById has not been set');
  },
  hasData: false,
});

// Clés de stockage local
const STORAGE_KEYS = {
  DISHES: 'dishes',
  WEEKLY_DISHES: 'weeklyDishes',
  SHOPPING_LIST: 'shoppingList',
  FOODS: 'foods',
  LAST_SYNC: 'lastSyncTime',
} as const;

// Hook pour gérer les données du contexte
function useDishProvider() {
  const { toast } = useToast();
  const { currentUser } = useAuthContext();
  const { t } = useTranslation();

  // États principaux
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [weeklyDishes, setWeeklyDishesState] = useState<Dish[]>([]);
  const [shoppingList, setShoppingListState] = useState<ShoppingListType[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);

  // États de chargement
  const [isInitializing, setIsInitializing] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasCachedData, setHasCachedData] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Références pour éviter les appels multiples
  const refreshPromiseRef = useRef<Promise<void> | null>(null);
  const isInitializedRef = useRef(false);
  const lastRefreshTimeRef = useRef<number>(0);

  // Calcul des tags basé sur les plats
  const tags = useMemo(() => {
    const allTags = dishes.map((dish) => dish.tags).flat();
    return Array.from(new Set(allTags));
  }, [dishes]);

  // État de chargement global
  const isLoading = useMemo(() => {
    return isInitializing || (isRefreshing && !hasCachedData);
  }, [isInitializing, isRefreshing, hasCachedData]);

  // Vérifier si on a des données disponibles
  const hasData = useMemo(() => {
    return dishes.length > 0 || foods.length > 0;
  }, [dishes.length, foods.length]);

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

  // Fonction pour fusionner les données avec le cache
  const mergeWithCache = useCallback((newData: any[], cachedData: any[]) => {
    // Si pas de données en cache, retourner directement les nouvelles données
    if (cachedData.length === 0) {
      return newData;
    }

    // Créer un Map pour une recherche plus rapide
    const newDataMap = new Map(newData.map((item) => [item.id, item]));
    const cachedDataMap = new Map(cachedData.map((item) => [item.id, item]));

    const updatedData: any[] = [];

    // Traiter les éléments en cache
    Array.from(cachedDataMap.entries()).forEach(([id, cachedItem]) => {
      const newItem = newDataMap.get(id);
      if (newItem && newItem.updatedAt !== cachedItem.updatedAt) {
        updatedData.push(newItem);
      } else if (newItem) {
        updatedData.push(cachedItem);
      }
    });

    // Ajouter les nouveaux éléments qui ne sont pas en cache
    Array.from(newDataMap.entries()).forEach(([id, newItem]) => {
      if (!cachedDataMap.has(id)) {
        updatedData.push(newItem);
      }
    });

    return updatedData;
  }, []);

  // Chargement initial des données en cache
  const loadCachedData = useCallback(() => {
    const cachedDishes = storage.get(STORAGE_KEYS.DISHES, []);
    const cachedWeeklyDishes = storage.get(STORAGE_KEYS.WEEKLY_DISHES, []);
    const cachedShoppingList = storage.get(STORAGE_KEYS.SHOPPING_LIST, []);
    const cachedFoods = storage.get(STORAGE_KEYS.FOODS, []);
    const cachedLastSync = storage.get(STORAGE_KEYS.LAST_SYNC, null);

    setDishes(cachedDishes);
    setWeeklyDishesState(cachedWeeklyDishes);
    setShoppingListState(cachedShoppingList);
    setFoods(cachedFoods);
    setLastSyncTime(cachedLastSync);
    setHasCachedData(cachedDishes.length > 0 || cachedFoods.length > 0);
  }, []);

  // Fonction de rafraîchissement des données
  const refresh = useCallback(async () => {
    // Éviter les appels trop fréquents (minimum 30 secondes entre les appels)
    const now = Date.now();
    if (now - lastRefreshTimeRef.current < 30000) {
      return;
    }

    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    lastRefreshTimeRef.current = now;
    refreshPromiseRef.current = (async () => {
      if (!currentUser) return;

      setIsRefreshing(true);
      setError(null);

      try {
        const [newDishes, newFoods] = await Promise.all([
          ApiService.dishes.get(),
          ApiService.foods.get(),
        ]);

        // Fusionner avec les données en cache
        const mergedDishes = mergeWithCache(newDishes, dishes);
        const mergedFoods = mergeWithCache(newFoods, foods);

        // Mettre à jour les états
        setDishes(mergedDishes);
        setFoods(mergedFoods);
        setLastSyncTime(Date.now());
        setHasCachedData(true);

        // Sauvegarder en cache
        storage.set(STORAGE_KEYS.DISHES, mergedDishes);
        storage.set(STORAGE_KEYS.FOODS, mergedFoods);
        storage.set(STORAGE_KEYS.LAST_SYNC, Date.now());
      } catch (error: any) {
        const errorMessage = t(
          error.data?.response?.message || 'errors:generic'
        );
        setError(errorMessage);

        toast({
          title: t(error.data?.response?.title || 'errors:generic'),
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsRefreshing(false);
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  }, [currentUser, mergeWithCache, storage, t, toast]);

  // Gestion des plats hebdomadaires
  const setWeeklyDishes = useCallback(
    (newWeeklyDishes: Dish[]) => {
      setWeeklyDishesState(newWeeklyDishes);
      storage.set(STORAGE_KEYS.WEEKLY_DISHES, newWeeklyDishes);

      // Générer la liste de courses
      const newShoppingList = generateShoppingListFromDishes(newWeeklyDishes);
      setShoppingListState(newShoppingList);
      storage.set(STORAGE_KEYS.SHOPPING_LIST, newShoppingList);
    },
    [storage]
  );

  const clearWeeklyDishes = useCallback(() => {
    setWeeklyDishesState([]);
    setShoppingListState([]);
    storage.remove(STORAGE_KEYS.WEEKLY_DISHES);
    storage.remove(STORAGE_KEYS.SHOPPING_LIST);
  }, [storage]);

  // Gestion de la liste de courses
  const setShoppingList = useCallback(
    (list: ShoppingListType[]) => {
      setShoppingListState(list);
      storage.set(STORAGE_KEYS.SHOPPING_LIST, list);
    },
    [storage]
  );

  // Fonction utilitaire pour récupérer un plat par ID
  const getDishesById = useCallback(
    (id: string, fromWeekly: boolean) => {
      const sourceArray = fromWeekly ? weeklyDishes : dishes;
      return sourceArray.find((dish) => dish.id === id);
    },
    [weeklyDishes, dishes]
  );

  // Nettoyage des données
  const clearData = useCallback(() => {
    setDishes([]);
    setWeeklyDishesState([]);
    setShoppingListState([]);
    setFoods([]);
    setHasCachedData(false);
    setLastSyncTime(null);
    setError(null);

    // Nettoyer le stockage local
    Object.values(STORAGE_KEYS).forEach(storage.remove);
  }, [storage]);

  // Initialisation
  useEffect(() => {
    if (isInitializedRef.current) return;

    loadCachedData();
    setIsInitializing(false);
    isInitializedRef.current = true;
  }, [loadCachedData]);

  // Rafraîchissement automatique quand l'utilisateur change
  useEffect(() => {
    if (!currentUser) return;

    // Éviter les appels multiples en vérifiant si on est déjà en train de rafraîchir
    if (isRefreshing) return;

    // Rafraîchir seulement si on n'a pas de données ou si les données sont anciennes
    const shouldRefresh =
      !hasCachedData ||
      (lastSyncTime && Date.now() - lastSyncTime > 5 * 60 * 1000); // 5 minutes

    if (shouldRefresh) {
      refresh();
    }
  }, [currentUser, hasCachedData, lastSyncTime, isRefreshing]);

  return {
    dishes,
    weeklyDishes,
    shoppingList,
    tags,
    foods,
    isInitializing,
    isRefreshing,
    hasCachedData,
    lastSyncTime,
    error,
    isLoading,
    setWeeklyDishes,
    refresh,
    setShoppingList,
    clearData,
    clearWeeklyDishes,
    getDishesById,
    hasData,
  };
}

// Composant Provider
interface Props {
  children: React.ReactNode;
}

export const DishProvider = ({ children }: Props): JSX.Element => {
  const context = useDishProvider();

  return (
    <DishContext.Provider value={context}>{children}</DishContext.Provider>
  );
};

// Hook d'accès au contexte
export const useDishContext = (): Context => React.useContext(DishContext);
