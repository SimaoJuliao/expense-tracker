export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

export const toInputDate = (dateStr: string): string => {
  return dateStr;
};

export const getCurrentMonthYear = (): { month: number; year: number } => {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
};

export const getMonthName = (month: number): string => {
  return new Date(2000, month - 1, 1).toLocaleString('en-GB', { month: 'long' });
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

export const exportToCSV = (
  expenses: Array<{
    date: string;
    description: string;
    category: string;
    amount: number;
  }>,
  filename: string
): void => {
  const sep = ';';
  const header = `Date${sep}Description${sep}Category${sep}Amount (EUR)`;
  const rows = expenses.map((e) => {
    const [year, month, day] = e.date.split('-');
    const dateText = `${day}-${month}-${year}`;
    return `"${dateText}"${sep}"${e.description.replace(/"/g, '""')}"${sep}"${e.category}"${sep}"${e.amount.toFixed(2)}"`;
  });
  // sep= hint tells Excel which delimiter to use
  const csv = [`sep=${sep}`, header, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
