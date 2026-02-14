export function exportToTXT(data: Record<string, string | number | boolean>[], filename = 'data.txt'): void {
  if (data.length === 0) return;
  const columns = Object.keys(data[0]);
  const lines = [columns.join('\t'), ...data.map((row) => columns.map((col) => String(row[col])).join('\t'))];
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
