import * as React from 'react';
import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from '@tanstack/react-query';

const defaultConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 30,
    },
  },
};

let queryClient: QueryClient | null = null;

const getQueryClient = () => {
  if (!queryClient) {
    queryClient = new QueryClient(defaultConfig);
  }
  return queryClient;
};

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  const client = React.useMemo(() => getQueryClient(), []);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

