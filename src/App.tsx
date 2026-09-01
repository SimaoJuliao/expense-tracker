import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from './store/useAuthStore';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

const LoginPage             = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage         = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ExpensesPage          = lazy(() => import('./pages/ExpensesPage').then(m => ({ default: m.ExpensesPage })));
const IncomePage            = lazy(() => import('./pages/IncomePage').then(m => ({ default: m.IncomePage })));
const RecurringIncomePage   = lazy(() => import('./pages/RecurringIncomePage').then(m => ({ default: m.RecurringIncomePage })));
const NewExpensePage        = lazy(() => import('./pages/NewExpensePage').then(m => ({ default: m.NewExpensePage })));
const RecurringExpensesPage = lazy(() => import('./pages/RecurringExpensesPage').then(m => ({ default: m.RecurringExpensesPage })));
const AnalysisPage          = lazy(() => import('./pages/AnalysisPage').then(m => ({ default: m.AnalysisPage })));
const SettingsPage          = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const CategoriesPage        = lazy(() => import('./pages/CategoriesPage').then(m => ({ default: m.CategoriesPage })));
const GroupSummaryPage      = lazy(() => import('./pages/GroupSummaryPage').then(m => ({ default: m.GroupSummaryPage })));
const InvestmentsPage       = lazy(() => import('./pages/InvestmentsPage').then(m => ({ default: m.InvestmentsPage })));
const InvestmentTransactionsPage = lazy(() => import('./pages/InvestmentTransactionsPage').then(m => ({ default: m.InvestmentTransactionsPage })));
const InvestmentPlatformsPage    = lazy(() => import('./pages/InvestmentPlatformsPage').then(m => ({ default: m.InvestmentPlatformsPage })));

const App = () => {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <a
        href="#main-content"
        className="sr-only sr-only-focusable fixed top-2 left-2 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium focus:not-sr-only"
      >
        Skip to main content
      </a>

      <Suspense fallback={null}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/income" element={<IncomePage />} />
          <Route path="/income/recurring" element={<RecurringIncomePage />} />
          <Route path="/expenses/new" element={<NewExpensePage />} />
          <Route path="/expenses/recurring" element={<RecurringExpensesPage />} />
          <Route path="/group/summary" element={<GroupSummaryPage />} />
          <Route path="/investments" element={<InvestmentsPage />} />
          <Route path="/investments/transactions" element={<InvestmentTransactionsPage />} />
          <Route path="/investments/platforms" element={<InvestmentPlatformsPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/categories" element={<CategoriesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>

      <Toaster richColors position="top-right" />
    </BrowserRouter>
  );
};

export default App;
