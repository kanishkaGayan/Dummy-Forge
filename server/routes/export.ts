import { Router } from 'express';
import Papa from 'papaparse';

const router = Router();

router.post('/', (req, res) => {
  const { format, data } = req.body as { format: 'sql' | 'csv' | 'txt'; data: Record<string, string | number | boolean>[] };

  if (!format || !Array.isArray(data)) {
    return res.status(400).json({ error: 'Invalid export request' });
  }

  if (data.length === 0) {
    return res.status(400).json({ error: 'No data to export' });
  }

  if (format === 'csv') {
    const csv = Papa.unparse(data);
    return res.type('text/csv').send(csv);
  }

  if (format === 'txt') {
    const columns = Object.keys(data[0]);
    const lines = [columns.join('\t'), ...data.map((row) => columns.map((col) => String(row[col])).join('\t'))];
    return res.type('text/plain').send(lines.join('\n'));
  }

  if (format === 'sql') {
    const columns = Object.keys(data[0]);
    let sql = `CREATE TABLE GeneratedData (\n`;
    columns.forEach((col, idx) => {
      const sampleValue = data[0][col];
      const dataType = typeof sampleValue === 'number' ? 'INT' : 'VARCHAR(255)';
      const comma = idx < columns.length - 1 ? ',' : '';
      sql += `    ${col} ${dataType}${comma}\n`;
    });
    sql += ');\n\n';
    sql += `INSERT INTO GeneratedData (${columns.join(', ')}) VALUES\n`;
    data.forEach((record, idx) => {
      const values = columns.map((col) => {
        const value = record[col];
        if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
        if (typeof value === 'boolean') return value ? 1 : 0;
        return value;
      });
      const comma = idx < data.length - 1 ? ',' : ';';
      sql += `(${values.join(', ')})${comma}\n`;
    });
    return res.type('text/sql').send(sql);
  }

  return res.status(400).json({ error: 'Unsupported format' });
});

export default router;
