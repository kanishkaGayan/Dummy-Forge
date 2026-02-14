export function exportToSQL(data: Record<string, string | number | boolean>[], tableName = 'GeneratedData'): string {
  if (data.length === 0) return '';

  const columns = Object.keys(data[0]);
  let sql = `CREATE TABLE ${tableName} (\n`;

  columns.forEach((col, idx) => {
    const sampleValue = data[0][col];
    const dataType = typeof sampleValue === 'number' ? 'INT' : 'VARCHAR(255)';
    const comma = idx < columns.length - 1 ? ',' : '';
    sql += `    ${col} ${dataType}${comma}\n`;
  });

  sql += ');\n\n';
  sql += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES\n`;

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

  return sql;
}
