export type ExportFormat = 'sql' | 'csv' | 'txt' | 'pdf' | 'xlsx';

export interface ExportSelection {
  sql: boolean;
  csv: boolean;
  txt: boolean;
  pdf: boolean;
  xlsx: boolean;
}
