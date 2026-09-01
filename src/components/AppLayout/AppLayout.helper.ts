import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LayoutDashboard, Receipt, Settings, FolderOpen, BarChart2, Wallet, Users, LineChart, ArrowRightLeft, Landmark } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useGroupStore } from '../../store/useGroupStore';
import { useCategoryStore } from '../../store/useCategoryStore';
import { useIncomeCategoryStore } from '../../store/useIncomeCategoryStore';
import { useInvestmentStore } from '../../store/useInvestmentStore';
import { useExpenseStore } from '../../store/useExpenseStore';
import { useIncomeStore } from '../../store/useIncomeStore';
import { useRecurringExpenseStore } from '../../store/useRecurringExpenseStore';
import { useRecurringIncomeStore } from '../../store/useRecurringIncomeStore';
import { useTranslation } from '../../i18n';

const PENDING_GROUP_KEY = '_pendingGroupSetup';

export const useAppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const logout      = useAuthStore((s) => s.logout);
  const user        = useAuthStore((s) => s.user);
  const navigate    = useNavigate();
  const { t }       = useTranslation();
  const { theme, toggleTheme } = useThemeStore();
  const { accountType, fetchGroupData, setupGroupAccount } = useGroupStore();
  const { seedDefaultCategories } = useCategoryStore();
  const { seedDefaultIncomeCategories } = useIncomeCategoryStore();
  const { seedDefaultPlatforms } = useInvestmentStore();

  const expenses         = useExpenseStore((s) => s.expenses);
  const expFilters       = useExpenseStore((s) => s.filters);
  const incomes          = useIncomeStore((s) => s.incomes);
  const incFilters       = useIncomeStore((s) => s.filters);
  const recurringExp     = useRecurringExpenseStore((s) => s.recurring);
  const recurringInc     = useRecurringIncomeStore((s) => s.recurring);
  const fetchRecurringExp = useRecurringExpenseStore((s) => s.fetchRecurring);
  const fetchRecurringInc = useRecurringIncomeStore((s) => s.fetchRecurring);
  const fetchExpenses    = useExpenseStore((s) => s.fetchExpenses);
  const fetchIncomes     = useIncomeStore((s) => s.fetchIncomes);

  useEffect(() => {
    if (!user) return;

    const pendingRaw = localStorage.getItem(PENDING_GROUP_KEY);
    let pending: { email: string; members: string[] } | null = null;
    if (pendingRaw) {
      try { pending = JSON.parse(pendingRaw); }
      catch { localStorage.removeItem(PENDING_GROUP_KEY); }
    }

    if (pending && pending.email.toLowerCase() === (user.email ?? '').toLowerCase()) {
      // Complete the pending group setup. Remove the flag only AFTER it succeeds,
      // so a second tab (the email-confirmation flow opens one) either runs the
      // setup too or, finding the flag gone, reads the already-'group' account.
      setupGroupAccount(pending.members)
        .then(() => {
          // StrictMode double-fires this effect onto the same setup promise;
          // the flag is the dedup sentinel so the toast shows exactly once.
          if (!localStorage.getItem(PENDING_GROUP_KEY)) return;
          localStorage.removeItem(PENDING_GROUP_KEY);
          toast.success(t('group.setupSuccess'));
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : '';
          toast.error(msg || t('common.error'));
        });
    } else {
      // Only discard a pending setup that clearly belongs to a different account;
      // if user.email isn't populated yet, keep it so a later load can retry
      // instead of silently leaving the account as personal.
      if (pending && user.email && pending.email.toLowerCase() !== user.email.toLowerCase()) {
        localStorage.removeItem(PENDING_GROUP_KEY);
      }
      fetchGroupData();
    }

    seedDefaultCategories();
    seedDefaultIncomeCategories();
    seedDefaultPlatforms();
    fetchRecurringExp();
    fetchRecurringInc();
    fetchExpenses();
    fetchIncomes();
  }, [user, fetchGroupData, setupGroupAccount, seedDefaultCategories, seedDefaultIncomeCategories, seedDefaultPlatforms, fetchRecurringExp, fetchRecurringInc, fetchExpenses, fetchIncomes]);

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

  const navSections = [
    {
      label: t('navigation.sectionFinances'),
      items: [
        { to: '/',                    label: t('navigation.dashboard'),  icon: LayoutDashboard },
        { to: '/expenses',            label: t('navigation.expenses'),   icon: Receipt,  badge: pendingExpenses },
        { to: '/income',              label: t('navigation.income'),     icon: Wallet,   badge: pendingIncomes  },
        ...(accountType === 'group'
          ? [{ to: '/group/summary',  label: t('group.navLabel'),        icon: Users }]
          : []),
        { to: '/analysis',            label: t('navigation.analysis'),   icon: BarChart2  },
        { to: '/settings/categories', label: t('navigation.categories'), icon: FolderOpen },
      ],
    },
    {
      label: t('navigation.sectionInvestments'),
      items: [
        { to: '/investments',              label: t('navigation.investmentsOverview'), icon: LineChart },
        { to: '/investments/transactions', label: t('investments.movements'),          icon: ArrowRightLeft },
        { to: '/investments/platforms',    label: t('investments.platforms'),          icon: Landmark },
      ],
    },
  ];

  const settingsNav = { to: '/settings', label: t('navigation.settings'), icon: Settings };

  const handleLogout = async () => {
    useGroupStore.getState().reset();
    await logout();
    toast.success(t('auth.loggedOut'));
    navigate('/login');
  };

  const avatarLetter = user?.email?.[0]?.toUpperCase() ?? '?';

  return {
    sidebarOpen, setSidebarOpen,
    navSections,
    settingsNav,
    handleLogout,
    avatarLetter,
    theme, toggleTheme,
    t, user,
  };
};
