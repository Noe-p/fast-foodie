import React, { useState } from 'react';
import { SearchParams } from '@/types';
import {
  DrawerDetailUser,
  DrawerUpdateUser,
} from '@/container/components/Drawers/User';

export enum DrawerType {
  DETAIL_USER = 'DETAIL_USER',
  UPDATE_USER = 'UPDATE_USER',
}

interface State {
  searchParams: SearchParams;
  drawerOpen?: DrawerType;
}

interface Context extends State {
  setSearchParams: React.Dispatch<React.SetStateAction<State['searchParams']>>;
  setDrawerOpen: React.Dispatch<React.SetStateAction<State['drawerOpen']>>;
}

export const defaultState: State = {
  searchParams: {
    page: 0,
    search: '',
  },
  drawerOpen: undefined,
};

const AppContext = React.createContext<Context>({
  ...defaultState,

  setSearchParams: () => {
    throw new Error('AppContext.setSearchParams has not been set');
  },
  setDrawerOpen: () => {
    throw new Error('AppContext.setDrawerOpen has not been set');
  },
});

function useAppProvider() {
  const [searchParams, setSearchParams] = useState<State['searchParams']>(
    defaultState.searchParams
  );
  const [drawerOpen, setDrawerOpen] = useState<State['drawerOpen'] | undefined>(
    defaultState.drawerOpen
  );

  return {
    searchParams,
    setSearchParams,
    drawerOpen,
    setDrawerOpen,
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
    </AppContext.Provider>
  );
};

export const useAppContext = (): Context => React.useContext(AppContext);
