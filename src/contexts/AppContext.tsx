import {
  DrawerCreateFood,
  DrawerSelectFood,
} from '@/container/components/Drawers/Food';
import {
  DrawerDetailUser,
  DrawerUpdateUser,
} from '@/container/components/Drawers/User';
import { Food } from '@/types';
import React, { useState } from 'react';

export enum DrawerType {
  DETAIL_USER = 'DETAIL_USER',
  UPDATE_USER = 'UPDATE_USER',
  CREATE_FOOD = 'CREATE_FOOD',
  CREATE_ALIMENT = 'CREATE_ALIMENT',
  UPDATE_FOOD = 'UPDATE_FOOD',
  SELECT_FOOD = 'SELECT_FOOD',
}

interface State {
  drawerOpen?: DrawerType;
  foodSelected?: Food;
}

interface Context extends State {
  setDrawerOpen: React.Dispatch<React.SetStateAction<State['drawerOpen']>>;
  setFoodSelected: React.Dispatch<React.SetStateAction<State['foodSelected']>>;
}

export const defaultState: State = {
  drawerOpen: undefined,
  foodSelected: undefined,
};

const AppContext = React.createContext<Context>({
  ...defaultState,
  setDrawerOpen: () => {
    throw new Error('AppContext.setDrawerOpen has not been set');
  },
  setFoodSelected: () => {
    throw new Error('AppContext.setFoodSelected has not been set');
  },
});

function useAppProvider() {
  const [drawerOpen, setDrawerOpen] = useState<State['drawerOpen'] | undefined>(
    defaultState.drawerOpen
  );
  const [foodSelected, setFoodSelected] = useState<State['foodSelected']>(
    defaultState.foodSelected
  );

  return {
    drawerOpen,
    setDrawerOpen,
    foodSelected,
    setFoodSelected,
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
      <DrawerSelectFood
        isOpen={context.drawerOpen === DrawerType.SELECT_FOOD}
        onClose={() => context.setDrawerOpen(undefined)}
        onSelect={(food) => {
          context.setFoodSelected(food);
          context.setDrawerOpen(undefined);
        }}
        foodsSelected={[]}
      />
    </AppContext.Provider>
  );
};

export const useAppContext = (): Context => React.useContext(AppContext);
