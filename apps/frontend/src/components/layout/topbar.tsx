import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/providers/theme-provider';
import { useState } from 'react';
import { NAV_ITEMS } from '@/config/navigation';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function TopBar() {
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menüyü aç</span>
        </Button>
        <div>
          <h1 className="text-lg font-semibold leading-none">Sınav Programı</h1>
          <p className="text-xs text-muted-foreground">
            Manuel atama & çakışma yönetimi
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={toggleTheme}>
          {theme === 'light' ? 'Karanlık Mod' : 'Aydınlık Mod'}
        </Button>
      </div>

      {isMenuOpen && (
        <nav className="absolute left-0 top-full w-full border-b bg-background px-4 py-3 shadow-sm lg:hidden">
          <ul className="space-y-1 text-sm">
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    'block rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground',
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

