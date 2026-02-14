import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportToPDF(data: Record<string, string | number | boolean>[], filename = 'data.pdf'): void {
  if (data.length === 0) return;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  const toReadableLabel = (value: string) =>
    value
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/^./, (char) => char.toUpperCase());

  const columns = Object.keys(data[0]);
  if (columns.length >= 10) {
    window.alert('PDF export warning: data has many columns and the table width may not fit properly.');
  }
  const formatCellValue = (value: string, columnName: string) => {
    const normalized = columnName.toLowerCase();
    if (normalized.includes('email')) {
      return value.replace(/@/g, '@\n');
    }
    if (normalized.includes('address')) {
      return value.replace(/,\s*/g, ',\n');
    }
    return value;
  };
  const rows = data.map((record) =>
    columns.map((col) => formatCellValue(String(record[col]), col))
  );
  const headers = columns.map((col) => toReadableLabel(col));
  const columnStyles: Record<number, { cellWidth?: number; minCellWidth?: number; overflow?: 'linebreak' | 'ellipsize' | 'hidden' | 'visible' }> = {};
  columns.forEach((col, index) => {
    const normalized = col.toLowerCase();
    if (normalized.includes('first') && normalized.includes('name')) {
      columnStyles[index] = { minCellWidth: 70, overflow: 'linebreak' };
      return;
    }
    if (normalized.includes('last') && normalized.includes('name')) {
      columnStyles[index] = { minCellWidth: 70, overflow: 'linebreak' };
      return;
    }
    if (normalized.includes('full') && normalized.includes('name')) {
      columnStyles[index] = { minCellWidth: 110, overflow: 'linebreak' };
      return;
    }
    if (normalized.includes('date') && normalized.includes('birth')) {
      columnStyles[index] = { cellWidth: 70, overflow: 'linebreak' };
      return;
    }
    if (normalized === 'gender' || normalized.includes('gender')) {
      columnStyles[index] = { cellWidth: 45, overflow: 'linebreak' };
      return;
    }
    if (normalized === 'age' || normalized.includes('age')) {
      columnStyles[index] = { cellWidth: 35, overflow: 'linebreak' };
      return;
    }
    if (normalized.includes('phone')) {
      columnStyles[index] = { cellWidth: 90, overflow: 'linebreak' };
      return;
    }
    if (normalized.includes('country')) {
      columnStyles[index] = { cellWidth: 80, overflow: 'linebreak' };
      return;
    }
    if (normalized.includes('email')) {
      columnStyles[index] = { cellWidth: 180, overflow: 'linebreak' };
      return;
    }
    if (normalized.includes('address')) {
      columnStyles[index] = { cellWidth: 240, overflow: 'linebreak' };
      return;
    }
    if (normalized.includes('validator') || normalized.includes('custom') || normalized.includes('sample')) {
      columnStyles[index] = { minCellWidth: 90, overflow: 'linebreak' };
      return;
    }
  });

  autoTable(doc, {
    head: [headers],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [66, 139, 202], halign: 'center', valign: 'middle', fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 248, 252] },
    styles: { fontSize: 7, cellPadding: 3, overflow: 'linebreak', cellWidth: 'wrap' },
    columnStyles,
    margin: { top: 24, left: 24, right: 24, bottom: 24 },
    tableWidth: 'wrap'
  });

  doc.save(filename);
}
