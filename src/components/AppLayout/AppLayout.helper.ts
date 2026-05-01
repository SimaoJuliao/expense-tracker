import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LayoutDashboard, Receipt, Settings, FolderOpen, BarChart2, Wallet } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useTranslation } from '../../i18n';

export const useAppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const logout   = useAuthStore((s) => s.logout);
  const user     = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { t }    = useTranslation();
  const { theme, toggleTheme } = useThemeStore();

  const navItems = [
    { to: '/',                    label: t('navigation.dashboard'), icon: LayoutDashboard },
    { to: '/expenses',            label: t('navigation.expenses'),  icon: Receipt        },
    { to: '/income',              label: t('navigation.income'),    icon: Wallet         },
    { to: '/analysis',            label: t('navigation.analysis'),  icon: BarChart2      },
    { to: '/settings/categories', label: t('navigation.categories'),icon: FolderOpen     },
    { to: '/settings',            label: t('navigation.settings'),  icon: Settings       },
  ];

  const handleLogout = async () => {
    await logout();
    toast.success(t('auth.loggedOut'));
    navigate('/login');
  };

  const avatarLetter = user?.email?.[0]?.toUpperCase() ?? '?';

  return {
    sidebarOpen, setSidebarOpen,
    navItems,
    handleLogout,
    avatarLetter,
    theme, toggleTheme,
    t, user,
  };
};
