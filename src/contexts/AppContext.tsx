import React, { useState } from 'react';
import { LocalSearchParams, SearchParams } from '@/types';
import {
  DrawerDetailUser,
  DrawerUpdateUser,
} from '@/container/components/Drawers/User';
import { Drawer } from 'vaul';
import { DrawerDetailDish } from '@/container/components/Drawers/Dish/DrawerDetailDish';
import { Dish } from '@/types/dto/Dish';
import { DrawerCreateDish } from '@/container/components/Drawers/Dish';
import { DrawerCreateFood } from '@/container/components/Drawers/Food';

export enum DrawerType {
  DETAIL_USER = 'DETAIL_USER',
  UPDATE_USER = 'UPDATE_USER',
  CREATE_DISH = 'CREATE_DISH',
  DETAIL_DISH = 'DETAIL_DISH',
  CREATE_FOOD = 'CREATE_FOOD',
  CREATE_ALIMENT = 'CREATE_ALIMENT',
}

interface State {
  drawerOpen?: DrawerType;
  currentDish?: Dish;
}

interface Context extends State {
  setDrawerOpen: React.Dispatch<React.SetStateAction<State['drawerOpen']>>;
  setCurrentDish: React.Dispatch<
    React.SetStateAction<State['currentDish']>
  >;
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
  const [currentDish, setCurrentDish] = useState<State['currentDish'] | undefined>(
    defaultState.currentDish
  );

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
      <DrawerDetailDish
        isOpen={context.drawerOpen === DrawerType.DETAIL_DISH}
        onClose={() => context.setDrawerOpen(undefined)}
      />
      <DrawerCreateDish
        isOpen={context.drawerOpen === DrawerType.CREATE_DISH}
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
