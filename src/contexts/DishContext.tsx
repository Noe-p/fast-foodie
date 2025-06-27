import { useToast } from '@/components/ui/use-toast';
import { ApiService } from '@/services/api';
import { generateShoppingListFromDishes } from '@/services/utils';
import { Food, ShoppingList } from '@/types';
import { Dish } from '@/types/dto/Dish';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from './AuthContext';

// Types pour le contexte
interface State {
  dishes?: Dish[];
  weeklyDishes: Dish[];
  shoppingList: ShoppingList[];
  tags: string[];
  foods?: Food[];
  isPending?: boolean;
}

interface Context extends State {
  setWeeklyDishes: (dishes: Dish[]) => void;
  clearData: () => void;
  refresh: () => Promise<void>;
  setShoppingList: (list: ShoppingList[]) => void;
  clearWeeklyDishes: () => void;
  getDishesById: (id: string, fromWeekly: boolean) => Dish | undefined;
}

const defaultState: State = {
  dishes: [],
  weeklyDishes: [],
  shoppingList: [],
  tags: [],
  foods: [],
  isPending: false,
};

// Création du contexte
const DishContext = React.createContext<Context>({
  ...defaultState,
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
});

// Hook pour gérer les données du contexte
function useDishProvider() {
  const { toast } = useToast();
  const { currentUser } = useAuthContext();
  const [weeklyDishes, setStateWeeklyDishes] = useState<Dish[]>([]);
  const [localDishes, setLocalDishes] = useState<Dish[]>([]);
  const [shoppingList, setShoppingListState] = useState<ShoppingList[]>([]);
  const [localTags, setLocalTags] = useState<string[]>([]);
  const [localFoods, setLocalFoods] = useState<Food[]>([]);
  const [isLoaded, setIsLoaded] = useState(defaultState.isPending);
  const { t } = useTranslation();

  // Gestion des plats hebdomadaires
  const setWeeklyDishes = (dishes: Dish[]) => {
    setStateWeeklyDishes(dishes);
    window.localStorage.setItem('weeklyDishes', JSON.stringify(dishes));
    const newShoppingList = generateShoppingListFromDishes(dishes);
    setShoppingList(newShoppingList);
  };

  const clearWeeklyDishes = () => {
    setStateWeeklyDishes([]);
    setShoppingListState([]);
    window.localStorage.removeItem('weeklyDishes');
    window.localStorage.removeItem('shoppingList');
  };

  const getWeeklyDishes = (): Dish[] => {
    const storedDishes = window.localStorage.getItem('weeklyDishes');
    return storedDishes ? JSON.parse(storedDishes) : [];
  };

  // Gestion des plats locaux
  const getLocalDishes = (): Dish[] => {
    const storedDishes = window.localStorage.getItem('dishes');
    return storedDishes ? JSON.parse(storedDishes) : [];
  };

  const updateLocalDishes = (newDishes: Dish[]) => {
    const oldDishes = getLocalDishes();

    // Créer une nouvelle liste mise à jour des plats
    const updatedDishes = oldDishes
      .map((oldDish) => {
        const newDish = newDishes.find((dish) => dish.id === oldDish.id);
        // Si le plat existe dans la nouvelle liste et a une date de mise à jour différente, on le remplace
        return newDish && newDish.updatedAt !== oldDish.updatedAt
          ? newDish
          : oldDish;
      })
      .filter((dish) => newDishes.some((newDish) => newDish.id === dish.id)); // Retirer les plats qui n'existent plus dans la nouvelle liste

    // Ajouter les nouveaux plats qui n'existaient pas auparavant
    newDishes.forEach((newDish) => {
      if (!oldDishes.some((oldDish) => oldDish.id === newDish.id)) {
        updatedDishes.push(newDish);
      }
    });

    // Mettre à jour le stockage local
    setLocalDishes(updatedDishes);
    window.localStorage.setItem('dishes', JSON.stringify(updatedDishes));
  };

  const clearLocalDishes = () => {
    setLocalDishes([]);
    setLocalTags([]);
    window.localStorage.removeItem('dishes');
  };

  const getDishesById = (id: string, fromWeekly: boolean) => {
    const weeklyDish = weeklyDishes.find((dish) => dish.id === id);
    return fromWeekly ? weeklyDish : localDishes.find((dish) => dish.id === id);
  };

  // Gestion de la liste de courses
  const setShoppingList = (list: ShoppingList[]) => {
    setShoppingListState(list);
    window.localStorage.setItem('shoppingList', JSON.stringify(list));
  };

  const getShoppingList = (): ShoppingList[] => {
    const storedList = window.localStorage.getItem('shoppingList');
    return storedList ? JSON.parse(storedList) : [];
  };

  // Gestion des tags
  const setTags = () => {
    const allTags = localDishes?.map((dish) => dish.tags).flat();
    const uniqueTags = Array.from(new Set(allTags));
    setLocalTags(uniqueTags);
  };

  // Gestion des aliments locaux
  const clearLocalFoods = () => {
    setLocalFoods([]);
    window.localStorage.removeItem('foods');
  };

  const getLocalFoods = (): Food[] => {
    const storedFoods = window.localStorage.getItem('foods');
    return storedFoods ? JSON.parse(storedFoods) : [];
  };

  const updateLocalFoods = (newFoods: Food[]) => {
    const oldFoods = getLocalFoods();

    // Créer une nouvelle liste mise à jour des aliments
    const updatedFoods = oldFoods
      .map((oldFood) => {
        // Cherche le nouvel aliment avec le même id
        const newFood = newFoods.find((food) => food.id === oldFood.id);
        // Si l'aliment existe dans la nouvelle liste et a une date de mise à jour différente, on le remplace
        return newFood && newFood.updatedAt !== oldFood.updatedAt
          ? newFood
          : oldFood;
      })
      .filter((food) => newFoods.some((newFood) => newFood.id === food.id)); // Retirer les aliments qui n'existent plus dans la nouvelle liste

    // Ajouter les nouveaux aliments qui n'existaient pas auparavant
    newFoods.forEach((newFood) => {
      if (!oldFoods.some((oldFood) => oldFood.id === newFood.id)) {
        updatedFoods.push(newFood);
      }
    });

    // Mettre à jour le stockage local
    setLocalFoods(updatedFoods);
    window.localStorage.setItem('foods', JSON.stringify(updatedFoods));
  };

  // Actualisation des données depuis l'API
  async function refresh() {
    if (isLoaded) return;
    setIsLoaded(true);
    try {
      const [dishes, foods] = await Promise.all([
        ApiService.dishes.get(),
        ApiService.foods.get(),
      ]);

      updateLocalDishes(dishes);
      updateLocalFoods(foods);
      setTags();
    } catch (error: any) {
      toast({
        title: t(error.data.response.title),
        description: t(error.data.response.message),
        variant: 'destructive',
      });
    } finally {
      setIsLoaded(false);
    }
  }

  //Supprimer les données
  const clearData = () => {
    clearLocalDishes();
    clearWeeklyDishes();
    clearLocalFoods();
  };

  // Initialisation des données
  useEffect(() => {
    setStateWeeklyDishes(getWeeklyDishes());
    setLocalDishes(getLocalDishes());
    setShoppingListState(getShoppingList());
  }, []);

  useEffect(() => {
    if (currentUser) {
      refresh();
    }
  }, [currentUser]);

  useEffect(() => {
    setTags();
  }, [localDishes]);

  return {
    dishes: localDishes,
    weeklyDishes,
    setWeeklyDishes,
    refresh,
    shoppingList,
    setShoppingList,
    tags: localTags,
    foods: localFoods,
    clearData,
    clearWeeklyDishes,
    isPending: isLoaded,
    getDishesById,
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
