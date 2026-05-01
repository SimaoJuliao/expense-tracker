export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  color: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category_id: string;
  date: string;
  created_at: string;
  category?: Category;
}

export interface ExpenseFilters {
  month: number;
  year: number;
  categoryId: string | null;
  search: string;
}

export interface NewExpense {
  amount: number;
  description: string;
  category_id: string;
  date: string;
}

export interface NewCategory {
  name: string;
  icon: string | null;
  color: string | null;
}

export interface RecurringExpense {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category_id: string;
  day_of_month: number;
  active: boolean;
  created_at: string;
  category?: Category;
}

export interface NewRecurringExpense {
  description: string;
  amount: number;
  category_id: string;
  day_of_month: number;
  active: boolean;
}

export interface IncomeCategory {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  color: string | null;
  created_at: string;
}

export interface Income {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  income_category_id: string;
  date: string;
  created_at: string;
  income_category?: IncomeCategory;
}

export interface IncomeFilters {
  month: number;
  year: number;
  categoryId: string | null;
  search: string;
}

export interface NewIncome {
  amount: number;
  description: string;
  income_category_id: string;
  date: string;
}

export interface NewIncomeCategory {
  name: string;
  icon: string | null;
  color: string | null;
}

export interface RecurringIncome {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  income_category_id: string;
  day_of_month: number;
  active: boolean;
  created_at: string;
  income_category?: IncomeCategory;
}

export interface NewRecurringIncome {
  description: string;
  amount: number;
  income_category_id: string;
  day_of_month: number;
  active: boolean;
}
