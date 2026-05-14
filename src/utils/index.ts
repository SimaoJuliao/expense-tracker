const CURRENCY_LOCALES: Record<string, string> = {
  EUR: 'de-DE', USD: 'en-US', GBP: 'en-GB', BRL: 'pt-BR',
  CHF: 'de-CH', CAD: 'en-CA', AUD: 'en-AU',
  PLN: 'pl-PL', SEK: 'sv-SE', NOK: 'nb-NO', DKK: 'da-DK',
};

export const formatCurrency = (amount: number, currency = 'EUR'): string => {
  const locale = CURRENCY_LOCALES[currency] ?? 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
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
