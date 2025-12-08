import { QueryProvider } from '@/providers/query-client';
import { ThemeProvider } from '@/providers/theme-provider';
import { AppRouter } from '@/routes/router';

export default function App() {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AppRouter />
      </QueryProvider>
    </ThemeProvider>
  );
}

