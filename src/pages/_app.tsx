import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import '../static/styles/app.css';
import { AppProvider, AuthProvider } from '@/contexts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function MyApp({ Component, pageProps }: AppProps) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <Component {...pageProps} />
          <Toaster />
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
export default appWithTranslation(MyApp);
