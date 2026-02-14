import Papa from 'papaparse';

export function exportToCSV(data: Record<string, string | number | boolean>[], filename = 'data.csv'): void {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
