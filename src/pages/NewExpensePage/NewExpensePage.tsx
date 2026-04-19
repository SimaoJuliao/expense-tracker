import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { ExpenseForm } from '../../components/ExpenseForm';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNewExpensePage } from './NewExpensePage.helper';

export const NewExpensePage = () => {
  const { categories, loading, t } = useNewExpensePage();

  if (loading && categories.length === 0) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" label={t('expenses.loadingCategories')} />
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <header className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" asChild aria-label={t('expenses.backToExpenses')}>
          <Link to="/expenses">
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t('expenses.newTitle')}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{t('expenses.newSubtitle')}</p>
        </div>
      </header>

      {categories.length === 0 ? (
        <EmptyState
          icon="📁"
          title={t('expenses.noCategoriesTitle')}
          message={t('expenses.noCategoriesMessage')}
          action={
            <Button asChild>
              <Link to="/settings/categories">{t('expenses.manageCategories')}</Link>
            </Button>
          }
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <ExpenseForm />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
