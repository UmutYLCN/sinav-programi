import { NavLink, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '@/config/navigation';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden w-64 flex-col border-r bg-card p-4 text-card-foreground lg:flex">
      <div className="mb-6 px-2">
        <h2 className="text-lg font-semibold tracking-tight">
          Sınav Programı
        </h2>
        <p className="text-sm text-muted-foreground">
          Üniversite sınav planlama kontrol paneli
        </p>
      </div>
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isPending, isActive: active }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive || active
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground',
                  isPending && 'opacity-60',
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>
      <footer className="mt-auto border-t pt-4 text-xs text-muted-foreground">
        Europe/Istanbul &bull; Manuel atama modülü
      </footer>
    </aside>
  );
}

