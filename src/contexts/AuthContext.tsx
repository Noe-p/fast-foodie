import { ApiService } from '@/services/api';
import { HttpService } from '@/services/httpService';
import { User } from '@/types';
import React, { useEffect, useState } from 'react';
import { PageLoader } from '../components';

interface State {
  currentUser?: User;
  token: string;
  isLoaded: boolean;
}

interface Context extends State {
  setToken: (token: string) => void;
  removeToken: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: () => boolean;
}

const defaultState: State = {
  currentUser: undefined,
  token: '',
  isLoaded: false,
};

const AuthContext = React.createContext<Context>({
  ...defaultState,
  setToken: () => {
    throw new Error('AuthContext.setToken has not been set');
  },
  removeToken: () => {
    throw new Error('AuthContext.removeToken has not been set');
  },
  refreshUser: () => {
    throw new Error('AuthContext.refreshUser has not been set');
  },
  isAuthenticated: () => {
    throw new Error('AuthContext.isAuthenticated has not been set');
  },
});

function useAuthProvider() {
  const [token, setStateToken] = useState('');
  const [currentUser, setCurrentUser] = useState<User>();
  const [isLoaded, setIsLoaded] = useState(false);

  HttpService.setToken(token);

  async function refreshUser() {
    if (token === '') {
      setCurrentUser(undefined);
      return;
    }
    try {
      const user = await ApiService.users.me();
      setCurrentUser(user);
      window.localStorage.setItem('user', JSON.stringify(user));
    } catch (e) {
      const user = window.localStorage.getItem('user');
      setCurrentUser(user ? JSON.parse(user) : null);
    }
  }

  function setToken(newToken: string) {
    setStateToken(newToken);
    window.localStorage?.setItem('token', newToken);
    HttpService.setToken(newToken);
  }

  function isAuthenticated(): boolean {
    return token !== '';
  }

  async function removeToken() {
    localStorage.clear();
    setToken('');
  }

  useEffect(() => {
    const storedToken = window.localStorage?.getItem('token') ?? '';
    setToken(storedToken);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return {
    currentUser,
    token,
    setToken,
    removeToken,
    refreshUser,
    isAuthenticated,
    isLoaded,
  };
}

interface Props {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: Props): JSX.Element => {
  const context: Context = useAuthProvider();

  return (
    <AuthContext.Provider value={context}>
      {context.isLoaded ? children : <PageLoader />}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): Context => React.useContext(AuthContext);
