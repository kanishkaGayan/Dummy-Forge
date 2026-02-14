// Exporters.ts - Complete Export Implementation
// Place this in: src/lib/exporters/index.ts

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ExportOptions {
  filename?: string;
  tableName?: string;
  includeHeaders?: boolean;
  dateFormat?: 'iso' | 'us' | 'eu';
}

export type ExportFormat = 'sql' | 'csv' | 'txt' | 'pdf';

// ============================================================================
// SQL EXPORTER
// ============================================================================

export class SQLExporter {
  /**
   * Export data to SQL INSERT statements
   */
  static export(
    data: Record<string, any>[],
    options: ExportOptions = {}
  ): string {
    if (!data || data.length === 0) {
      return '-- No data to export';
    }

    const tableName = options.tableName || 'GeneratedData';
    const columns = Object.keys(data[0]);

    let sql = this.generateCreateTable(tableName, data[0], columns);
    sql += '\n\n';
    sql += this.generateInsertStatements(tableName, data, columns);

    return sql;
  }

  /**
   * Generate CREATE TABLE statement with inferred column types
   */
  private static generateCreateTable(
    tableName: string,
    sampleRow: Record<string, any>,
    columns: string[]
  ): string {
    let sql = `-- DataForge Generated SQL\n`;
    sql += `-- Generated on: ${new Date().toISOString()}\n`;
    sql += `-- Records: ${columns.length}\n\n`;
    sql += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;

    const columnDefs = columns.map((col, idx) => {
      const value = sampleRow[col];
      const dataType = this.inferSQLDataType(value, col);
      const comma = idx < columns.length - 1 ? ',' : '';
      return `    ${col} ${dataType}${comma}`;
    });

    sql += columnDefs.join('\n');
    sql += '\n);\n';

    return sql;
  }

  /**
   * Infer SQL data type from value
   */
  private static inferSQLDataType(value: any, columnName: string): string {
    const lowerColName = columnName.toLowerCase();

    // Check for specific column names
    if (lowerColName.includes('id')) {
      return 'INT PRIMARY KEY';
    }

    if (lowerColName.includes('email')) {
      return 'VARCHAR(255) UNIQUE';
    }

    if (lowerColName.includes('phone')) {
      return 'VARCHAR(50)';
    }

    if (lowerColName.includes('date') || lowerColName.includes('createdat') || lowerColName.includes('updatedat')) {
      return 'DATETIME';
    }

    if (lowerColName.includes('age')) {
      return 'INT';
    }

    if (lowerColName.includes('country') || lowerColName.includes('city') || lowerColName.includes('state')) {
      return 'VARCHAR(100)';
    }

    // Infer from value type
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'INT' : 'DECIMAL(10, 2)';
    }

    if (typeof value === 'boolean') {
      return 'BOOLEAN';
    }

    if (value instanceof Date) {
      return 'DATETIME';
    }

    // Check if it's a UUID
    if (typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
      return 'VARCHAR(36)';
    }

    // Default to VARCHAR
    const maxLength = typeof value === 'string' ? Math.max(value.length * 2, 255) : 255;
    return `VARCHAR(${maxLength})`;
  }

  /**
   * Generate INSERT statements
   */
  private static generateInsertStatements(
    tableName: string,
    data: Record<string, any>[],
    columns: string[]
  ): string {
    let sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES\n`;

    const values = data.map((record, idx) => {
      const rowValues = columns.map(col => {
        const value = record[col];
        return this.escapeSQLValue(value);
      });

      const comma = idx < data.length - 1 ? ',' : ';';
      return `(${rowValues.join(', ')})${comma}`;
    });

    sql += values.join('\n');

    return sql;
  }

  /**
   * Escape and format SQL values
   */
  private static escapeSQLValue(value: any): string {
    if (value === null || value === undefined) {
      return 'NULL';
    }

    if (typeof value === 'number') {
      return value.toString();
    }

    if (typeof value === 'boolean') {
      return value ? '1' : '0';
    }

    if (value instanceof Date) {
      return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
    }

    // String values - escape single quotes
    const escaped = value.toString().replace(/'/g, "''");
    return `'${escaped}'`;
  }

  /**
   * Save SQL to file
   */
  static saveToFile(data: Record<string, any>[], options: ExportOptions = {}): void {
    const sql = this.export(data, options);
    const filename = options.filename || 'generated_data.sql';
    this.downloadFile(sql, filename, 'text/sql');
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// ============================================================================
// CSV EXPORTER
// ============================================================================

export class CSVExporter {
  /**
   * Export data to CSV format
   */
  static export(
    data: Record<string, any>[],
    options: ExportOptions = {}
  ): string {
    if (!data || data.length === 0) {
      return '';
    }

    const config = {
      header: options.includeHeaders !== false,
      quotes: true,
      delimiter: ',',
      newline: '\n',
    };

    return Papa.unparse(data, config);
  }

  /**
   * Save CSV to file
   */
  static saveToFile(data: Record<string, any>[], options: ExportOptions = {}): void {
    const csv = this.export(data, options);
    const filename = options.filename || 'generated_data.csv';
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export to Excel-compatible CSV (with BOM for proper encoding)
   */
  static exportForExcel(data: Record<string, any>[], options: ExportOptions = {}): string {
    const csv = this.export(data, options);
    // Add BOM for Excel UTF-8 recognition
    return '\uFEFF' + csv;
  }

  /**
   * Save Excel-compatible CSV
   */
  static saveToFileExcel(data: Record<string, any>[], options: ExportOptions = {}): void {
    const csv = this.exportForExcel(data, options);
    const filename = options.filename || 'generated_data.csv';
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// ============================================================================
// TXT EXPORTER
// ============================================================================

export class TXTExporter {
  /**
   * Export data to formatted text
   */
  static export(
    data: Record<string, any>[],
    options: ExportOptions = {}
  ): string {
    if (!data || data.length === 0) {
      return 'No data to export';
    }

    const columns = Object.keys(data[0]);
    let text = '';

    // Header
    text += '='.repeat(80) + '\n';
    text += 'DataForge Generated Data\n';
    text += `Generated on: ${new Date().toLocaleString()}\n`;
    text += `Total Records: ${data.length}\n`;
    text += '='.repeat(80) + '\n\n';

    // Calculate column widths
    const columnWidths = this.calculateColumnWidths(data, columns);

    // Column headers
    if (options.includeHeaders !== false) {
      const headerRow = columns.map((col, idx) => 
        this.padString(col, columnWidths[idx])
      ).join(' | ');
      
      text += headerRow + '\n';
      text += '-'.repeat(headerRow.length) + '\n';
    }

    // Data rows
    data.forEach((record, rowIndex) => {
      const row = columns.map((col, idx) => {
        const value = this.formatValue(record[col]);
        return this.padString(value, columnWidths[idx]);
      }).join(' | ');

      text += row + '\n';

      // Add separator every 10 rows for readability
      if ((rowIndex + 1) % 10 === 0 && rowIndex < data.length - 1) {
        text += '·'.repeat(row.length) + '\n';
      }
    });

    text += '\n' + '='.repeat(80) + '\n';
    text += `End of data (${data.length} records)\n`;
    text += '='.repeat(80) + '\n';

    return text;
  }

  /**
   * Calculate optimal column widths
   */
  private static calculateColumnWidths(
    data: Record<string, any>[],
    columns: string[]
  ): number[] {
    return columns.map(col => {
      // Start with column name length
      let maxWidth = col.length;

      // Check first 100 rows for max width
      const sampleSize = Math.min(data.length, 100);
      for (let i = 0; i < sampleSize; i++) {
        const value = this.formatValue(data[i][col]);
        maxWidth = Math.max(maxWidth, value.length);
      }

      // Limit to reasonable width
      return Math.min(maxWidth, 50);
    });
  }

  /**
   * Format value for display
   */
  private static formatValue(value: any): string {
    if (value === null || value === undefined) {
      return 'NULL';
    }

    if (typeof value === 'object') {
      if (value instanceof Date) {
        return value.toISOString();
      }
      return JSON.stringify(value);
    }

    return value.toString();
  }

  /**
   * Pad string to specified width
   */
  private static padString(str: string, width: number): string {
    if (str.length >= width) {
      return str.substring(0, width);
    }
    return str + ' '.repeat(width - str.length);
  }

  /**
   * Save TXT to file
   */
  static saveToFile(data: Record<string, any>[], options: ExportOptions = {}): void {
    const txt = this.export(data, options);
    const filename = options.filename || 'generated_data.txt';
    
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// ============================================================================
// PDF EXPORTER
// ============================================================================

export class PDFExporter {
  /**
   * Export data to PDF
   */
  static export(
    data: Record<string, any>[],
    options: ExportOptions = {}
  ): jsPDF {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Add header
    this.addHeader(doc, data.length);

    // Add table
    this.addTable(doc, data, options);

    // Add footer
    this.addFooter(doc);

    return doc;
  }

  /**
   * Add header to PDF
   */
  private static addHeader(doc: jsPDF, recordCount: number): void {
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('DataForge Generated Data', pageWidth / 2, 15, { align: 'center' });

    // Metadata
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);
    doc.text(`Total Records: ${recordCount}`, 14, 30);

    // Disclaimer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Educational Purpose Only - Fictional Data', pageWidth / 2, 35, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  }

  /**
   * Add data table to PDF
   */
  private static addTable(
    doc: jsPDF,
    data: Record<string, any>[],
    options: ExportOptions
  ): void {
    if (!data || data.length === 0) {
      doc.text('No data to display', 14, 50);
      return;
    }

    const columns = Object.keys(data[0]);
    const headers = columns.map(col => col);

    const rows = data.map(record => 
      columns.map(col => this.formatCellValue(record[col]))
    );

    autoTable(doc, {
      startY: 40,
      head: [headers],
      body: rows,
      theme: 'grid',
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 2,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: this.getColumnStyles(columns),
      margin: { top: 40, right: 10, bottom: 20, left: 10 },
      didDrawPage: (data) => {
        // Add page numbers
        const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
        const pageCount = doc.internal.pages.length - 1;
        doc.setFontSize(8);
        doc.text(
          `Page ${pageNumber} of ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      },
    });
  }

  /**
   * Get column-specific styles
   */
  private static getColumnStyles(columns: string[]): Record<number, any> {
    const styles: Record<number, any> = {};

    columns.forEach((col, idx) => {
      const lowerCol = col.toLowerCase();

      // Email and UUID columns should be wider
      if (lowerCol.includes('email') || lowerCol.includes('uuid')) {
        styles[idx] = { cellWidth: 40 };
      }
      // ID columns can be narrower
      else if (lowerCol.includes('id')) {
        styles[idx] = { cellWidth: 20 };
      }
      // Phone and postal code
      else if (lowerCol.includes('phone') || lowerCol.includes('postal')) {
        styles[idx] = { cellWidth: 30 };
      }
      // Address should be wider
      else if (lowerCol.includes('address')) {
        styles[idx] = { cellWidth: 50 };
      }
    });

    return styles;
  }

  /**
   * Format cell value for PDF
   */
  private static formatCellValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'object') {
      if (value instanceof Date) {
        return value.toLocaleDateString();
      }
      return JSON.stringify(value);
    }

    return value.toString();
  }

  /**
   * Add footer to PDF
   */
  private static addFooter(doc: jsPDF): void {
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(
      'Generated by DataForge - Educational Purpose Only',
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }

  /**
   * Save PDF to file
   */
  static saveToFile(data: Record<string, any>[], options: ExportOptions = {}): void {
    const doc = this.export(data, options);
    const filename = options.filename || 'generated_data.pdf';
    doc.save(filename);
  }

  /**
   * Open PDF in new window
   */
  static openInNewWindow(data: Record<string, any>[], options: ExportOptions = {}): void {
    const doc = this.export(data, options);
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }
}

// ============================================================================
// UNIFIED EXPORTER
// ============================================================================

export class Exporter {
  /**
   * Export data to specified format
   */
  static export(
    data: Record<string, any>[],
    format: ExportFormat,
    options: ExportOptions = {}
  ): void {
    switch (format) {
      case 'sql':
        SQLExporter.saveToFile(data, options);
        break;
      
      case 'csv':
        CSVExporter.saveToFile(data, options);
        break;
      
      case 'txt':
        TXTExporter.saveToFile(data, options);
        break;
      
      case 'pdf':
        PDFExporter.saveToFile(data, options);
        break;
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Export data to multiple formats
   */
  static exportMultiple(
    data: Record<string, any>[],
    formats: ExportFormat[],
    options: ExportOptions = {}
  ): void {
    formats.forEach(format => {
      // Add format-specific filename if not specified
      const formatOptions = {
        ...options,
        filename: options.filename || `generated_data.${format}`,
      };
      this.export(data, format, formatOptions);
    });
  }

  /**
   * Get export preview (string representation)
   */
  static getPreview(
    data: Record<string, any>[],
    format: ExportFormat,
    maxRows: number = 10
  ): string {
    const previewData = data.slice(0, maxRows);

    switch (format) {
      case 'sql':
        return SQLExporter.export(previewData);
      
      case 'csv':
        return CSVExporter.export(previewData);
      
      case 'txt':
        return TXTExporter.export(previewData);
      
      case 'pdf':
        return `PDF export preview not available. ${data.length} records will be exported.`;
      
      default:
        return 'Preview not available';
    }
  }
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Example 1: Export to single format
const data = [...]; // Your generated data
Exporter.export(data, 'sql', { filename: 'students.sql', tableName: 'Students' });

// Example 2: Export to multiple formats
Exporter.exportMultiple(data, ['sql', 'csv', 'pdf'], { 
  filename: 'my_data' 
});

// Example 3: Get preview before exporting
const preview = Exporter.getPreview(data, 'sql', 5);
console.log(preview);

// Example 4: Direct exporter usage
SQLExporter.saveToFile(data, { tableName: 'MyTable' });
CSVExporter.saveToFile(data, { includeHeaders: true });
TXTExporter.saveToFile(data);
PDFExporter.saveToFile(data);

// Example 5: Open PDF in new window
PDFExporter.openInNewWindow(data);
*/
