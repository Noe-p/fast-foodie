import { Toaster } from '@/components/ui/toaster';
import { AppProvider, AuthProvider, DishProvider } from '@/contexts';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import '../static/styles/app.css';

function MyApp({ Component, pageProps }: AppProps) {
  const [isClient, setIsClient] = useState(false);

  // Set the client-side flag once the component is mounted
  useEffect(() => {
    setIsClient(true);
  }, []);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        staleTime: 1000 * 60 * 10, // 5 minutes
        networkMode: 'offlineFirst',
      },
      mutations: {
        networkMode: 'offlineFirst',
      },
    },
  });

  // Only create the persister on the client side
  const persister = isClient ? createSyncStoragePersister({
    storage: window.localStorage,
  }) : null;

  if (!isClient || !persister) {
    return null; // You can return a loading spinner or any other placeholder here
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <AuthProvider>
        <DishProvider>
          <AppProvider>
            <Component {...pageProps} />
            <Toaster />
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}
          </AppProvider>
        </DishProvider>
      </AuthProvider>
    </PersistQueryClientProvider>
  );
}

export default appWithTranslation(MyApp);
