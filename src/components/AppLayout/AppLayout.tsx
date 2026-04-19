import { Outlet, NavLink } from 'react-router-dom';
import {
  Menu, Sun, Moon, X, Wallet, LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppLayout } from './AppLayout.helper';

export const AppLayout = () => {
  const {
    sidebarOpen, setSidebarOpen,
    navItems, handleLogout, avatarLetter, theme, toggleTheme, t, user,
  } = useAppLayout();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <nav
        id="sidebar"
        className={cn(
          'fixed top-0 left-0 z-30 h-full w-64 flex flex-col bg-sidebar',
          'transform transition-transform duration-200',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:static lg:z-auto'
        )}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between px-5 pt-6 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
              <Wallet className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-white">
              {t('common.appName')}
            </span>
          </div>
          <button
            className="lg:hidden p-1 rounded-md text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 mb-1.5">
          <span className="text-[10px] uppercase tracking-widest font-medium text-white/25">
            Menu
          </span>
        </div>

        <ul className="flex-1 px-3 space-y-0.5" role="list">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all duration-150',
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/50 hover:bg-white/6 hover:text-white/80'
                  )
                }
                onClick={() => setSidebarOpen(false)}
              >
                {({ isActive }: { isActive: boolean }) => (
                  <>
                    <item.icon
                      className={cn('h-[15px] w-[15px] shrink-0 transition-colors', isActive ? 'text-primary' : '')}
                      aria-hidden="true"
                    />
                    {item.label}
                    {isActive && <span className="sr-only">{t('common.currentPage')}</span>}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="px-3 pb-5 pt-2">
          <div className="h-px bg-white/8 mx-2 mb-3" />
          <div className="flex items-center gap-2 px-3 py-1.5 mb-1">
            <div className="h-7 w-7 rounded-full bg-primary/80 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
              {avatarLetter}
            </div>
            <span className="text-[11.5px] text-white/45 truncate flex-1 min-w-0">
              {user?.email}
            </span>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md text-white/35 hover:text-white/75 hover:bg-white/8 transition-colors shrink-0"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark'
                ? <Sun className="h-3.5 w-3.5" />
                : <Moon className="h-3.5 w-3.5" />}
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-white/40 hover:bg-white/6 hover:text-white/75 transition-colors"
          >
            <LogOut className="h-[15px] w-[15px] shrink-0" aria-hidden="true" />
            {t('common.signOut')}
          </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-background border-b border-border sticky top-0 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            aria-label={t('navigation.openMenu')}
            aria-expanded={sidebarOpen}
            aria-controls="sidebar"
            className="h-8 w-8"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </Button>
          <span className="font-semibold text-sm">{t('common.appName')}</span>
          <div className="ml-auto">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        <main
          id="main-content"
          className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto animate-fade-up"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
