import { DrawerCreateFood } from '@/container/components/Drawers/Food';
import {
  DrawerDetailUser,
  DrawerUpdateUser,
} from '@/container/components/Drawers/User';
import { Dish } from '@/types/dto/Dish';
import React, { useEffect, useState } from 'react';
import { useDishContext } from './DishContext';

export enum DrawerType {
  DETAIL_USER = 'DETAIL_USER',
  UPDATE_USER = 'UPDATE_USER',
  CREATE_FOOD = 'CREATE_FOOD',
  CREATE_ALIMENT = 'CREATE_ALIMENT',
  UPDATE_FOOD = 'UPDATE_FOOD',
}

interface State {
  drawerOpen?: DrawerType;
  currentDish?: Dish;
}

interface Context extends State {
  setDrawerOpen: React.Dispatch<React.SetStateAction<State['drawerOpen']>>;
  setCurrentDish: React.Dispatch<React.SetStateAction<State['currentDish']>>;
}

export const defaultState: State = {
  drawerOpen: undefined,
  currentDish: undefined,
};

const AppContext = React.createContext<Context>({
  ...defaultState,
  setDrawerOpen: () => {
    throw new Error('AppContext.setDrawerOpen has not been set');
  },
  setCurrentDish: () => {
    throw new Error('AppContext.setCurrentDish has not been set');
  },
});

function useAppProvider() {
  const [drawerOpen, setDrawerOpen] = useState<State['drawerOpen'] | undefined>(
    defaultState.drawerOpen
  );
  const [currentDish, setCurrentDish] = useState<
    State['currentDish'] | undefined
  >(defaultState.currentDish);
  const { dishes } = useDishContext();

  useEffect(() => {
    if (dishes && dishes.length > 0)
      if (!currentDish) setCurrentDish(dishes[0]);
  }, [dishes]);

  return {
    drawerOpen,
    setDrawerOpen,
    currentDish,
    setCurrentDish,
  };
}

interface Props {
  children: React.ReactNode;
}

export const AppProvider = ({ children }: Props): JSX.Element => {
  const context: Context = useAppProvider();

  return (
    <AppContext.Provider value={context}>
      {children}
      <DrawerDetailUser
        isOpen={context.drawerOpen === DrawerType.DETAIL_USER}
        onClose={() => context.setDrawerOpen(undefined)}
      />
      <DrawerUpdateUser
        isOpen={context.drawerOpen === DrawerType.UPDATE_USER}
        onClose={() => context.setDrawerOpen(undefined)}
      />
      <DrawerCreateFood
        isOpen={context.drawerOpen === DrawerType.CREATE_FOOD}
        onClose={() => context.setDrawerOpen(undefined)}
      />
    </AppContext.Provider>
  );
};

export const useAppContext = (): Context => React.useContext(AppContext);
