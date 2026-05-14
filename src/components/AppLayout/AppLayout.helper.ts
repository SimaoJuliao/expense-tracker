import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LayoutDashboard, Receipt, Settings, FolderOpen, BarChart2, Wallet, Users } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useGroupStore } from '../../store/useGroupStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useIncomeCategoryStore } from '../../store/useIncomeCategoryStore';
import { useExpenseStore } from '../../store/useExpenseStore';
import { useIncomeStore } from '../../store/useIncomeStore';
import { useRecurringExpenseStore } from '../../store/useRecurringExpenseStore';
import { useRecurringIncomeStore } from '../../store/useRecurringIncomeStore';
import { useTranslation } from '../../i18n';

export const useAppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const logout      = useAuthStore((s) => s.logout);
  const user        = useAuthStore((s) => s.user);
  const navigate    = useNavigate();
  const { t }       = useTranslation();
  const { theme, toggleTheme } = useThemeStore();
  const { accountType, fetchGroupData } = useGroupStore();
  const { seedDefaultCategories } = useCategoryStore();
  const { seedDefaultIncomeCategories } = useIncomeCategoryStore();

  const expenses         = useExpenseStore((s) => s.expenses);
  const expFilters       = useExpenseStore((s) => s.filters);
  const incomes          = useIncomeStore((s) => s.incomes);
  const incFilters       = useIncomeStore((s) => s.filters);
  const recurringExp     = useRecurringExpenseStore((s) => s.recurring);
  const recurringInc     = useRecurringIncomeStore((s) => s.recurring);
  const fetchRecurringExp = useRecurringExpenseStore((s) => s.fetchRecurring);
  const fetchRecurringInc = useRecurringIncomeStore((s) => s.fetchRecurring);

  useEffect(() => {
    if (user) {
      fetchGroupData();
      seedDefaultCategories();
      seedDefaultIncomeCategories();
      fetchRecurringExp();
      fetchRecurringInc();
    }
  }, [user, fetchGroupData, seedDefaultCategories, seedDefaultIncomeCategories, fetchRecurringExp, fetchRecurringInc]);

  const expMonthPrefix = expFilters.month === 0 ? null
    : `${expFilters.year}-${String(expFilters.month).padStart(2, '0')}`;
  const incMonthPrefix = incFilters.month === 0 ? null
    : `${incFilters.year}-${String(incFilters.month).padStart(2, '0')}`;

  const pendingExpenses = useMemo(() => {
    if (!expMonthPrefix) return 0;
    const applied = new Set(
      expenses
        .filter((e) => e.date.startsWith(expMonthPrefix))
        .map((e) => `${e.description}|${e.category_id}|${Number(e.amount)}`)
    );
    return recurringExp.filter(
      (r) => r.active && !applied.has(`${r.description}|${r.category_id}|${Number(r.amount)}`)
    ).length;
  }, [recurringExp, expenses, expMonthPrefix]);

  const pendingIncomes = useMemo(() => {
    if (!incMonthPrefix) return 0;
    const applied = new Set(
      incomes
        .filter((i) => i.date.startsWith(incMonthPrefix))
        .map((i) => `${i.description}|${i.income_category_id}|${Number(i.amount)}`)
    );
    return recurringInc.filter(
      (r) => r.active && !applied.has(`${r.description}|${r.income_category_id}|${Number(r.amount)}`)
    ).length;
  }, [recurringInc, incomes, incMonthPrefix]);

  const navItems = [
    { to: '/',                    label: t('navigation.dashboard'), icon: LayoutDashboard },
    { to: '/expenses',            label: t('navigation.expenses'),  icon: Receipt,  badge: pendingExpenses },
    { to: '/income',              label: t('navigation.income'),    icon: Wallet,   badge: pendingIncomes  },
    ...(accountType === 'group'
      ? [{ to: '/group/summary', label: t('group.navLabel'), icon: Users }]
      : []),
    { to: '/analysis',            label: t('navigation.analysis'),  icon: BarChart2      },
    { to: '/settings/categories', label: t('navigation.categories'),icon: FolderOpen     },
    { to: '/settings',            label: t('navigation.settings'),  icon: Settings       },
  ];

  const handleLogout = async () => {
    useGroupStore.getState().reset();
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
