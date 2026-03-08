/**
 * In-memory SQL query executor for learning/practice purposes
 * Supports basic SELECT queries on generated data
 */

export interface QueryResult {
  columns: string[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTime: number;
}

export interface QueryDiagnostic {
  severity: 'error' | 'warning';
  message: string;
  hint?: string;
}

interface ParsedQuery {
  columns: string[];
  from: string;
  where?: string;
  orderBy?: {
    column: string;
    direction: 'ASC' | 'DESC';
  };
  limit?: number;
}

class QueryValidationError extends Error {
  hint?: string;

  constructor(message: string, hint?: string) {
    super(message);
    this.name = 'QueryValidationError';
    this.hint = hint;
  }
}

export class SQLExecutor {
  private data: Record<string, any>[] = [];
  private tableName = 'data';

  setData(data: Record<string, any>[]): void {
    this.data = data;
  }

  getAvailableColumns(): string[] {
    return this.data.length > 0 ? Object.keys(this.data[0]) : [];
  }

  analyzeQuery(query: string): QueryDiagnostic[] {
    const diagnostics: QueryDiagnostic[] = [];
    const trimmed = query.trim();

    if (!trimmed) {
      diagnostics.push({
        severity: 'warning',
        message: 'Start with SELECT to build a query.',
        hint: 'Example: SELECT * FROM data'
      });
      return diagnostics;
    }

    try {
      this.parseSelectQuery(trimmed);
      diagnostics.push({
        severity: 'warning',
        message: 'Query structure looks valid.',
        hint: 'Tip: use double quotes for string values, e.g. WHERE country = "Sri Lanka"'
      });
    } catch (error) {
      if (error instanceof QueryValidationError) {
        diagnostics.push({
          severity: 'error',
          message: error.message,
          hint: error.hint
        });
      } else {
        diagnostics.push({
          severity: 'error',
          message: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return diagnostics;
  }

  execute(query: string): QueryResult {
    const startTime = performance.now();

    try {
      const trimmedQuery = query.trim();

      if (!trimmedQuery.toUpperCase().startsWith('SELECT')) {
        throw new QueryValidationError(
          'Only SELECT queries are supported for education mode.',
          'Try: SELECT * FROM data'
        );
      }

      const result = this.executeSelect(trimmedQuery);
      const executionTime = performance.now() - startTime;

      return {
        ...result,
        executionTime: Math.round(executionTime * 100) / 100
      };
    } catch (error) {
      if (error instanceof QueryValidationError) {
        const withHint = error.hint ? `${error.message} Hint: ${error.hint}` : error.message;
        throw new Error(`Query execution failed: ${withHint}`);
      }

      throw new Error(`Query execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private executeSelect(query: string): Omit<QueryResult, 'executionTime'> {
    const parsed = this.parseSelectQuery(query);

    let results = [...this.data];

    if (parsed.where) {
      results = results.filter((row) => this.evaluateWhere(row, parsed.where!));
    }

    if (parsed.orderBy) {
      const { column, direction } = parsed.orderBy;
      results.sort((left, right) => {
        const leftValue = left[column];
        const rightValue = right[column];

        if (leftValue === rightValue) return 0;
        if (leftValue == null) return direction === 'ASC' ? -1 : 1;
        if (rightValue == null) return direction === 'ASC' ? 1 : -1;

        if (typeof leftValue === 'number' && typeof rightValue === 'number') {
          return direction === 'ASC' ? leftValue - rightValue : rightValue - leftValue;
        }

        const compare = String(leftValue).localeCompare(String(rightValue));
        return direction === 'ASC' ? compare : -compare;
      });
    }

    if (typeof parsed.limit === 'number') {
      results = results.slice(0, parsed.limit);
    }

    let columnsToSelect = parsed.columns;
    if (columnsToSelect.length === 1 && columnsToSelect[0] === '*') {
      columnsToSelect = results.length > 0 ? Object.keys(results[0]) : [];
    }

    this.ensureColumnsExist(columnsToSelect);

    const processedRows = results.map((row) => {
      const newRow: Record<string, any> = {};
      columnsToSelect.forEach((col) => {
        const trimmedCol = col.trim();
        newRow[trimmedCol] = row[trimmedCol];
      });
      return newRow;
    });

    return {
      columns: columnsToSelect,
      rows: processedRows,
      rowCount: processedRows.length
    };
  }

  private parseSelectQuery(query: string): ParsedQuery {
    const normalized = query.replace(/;\s*$/, '').trim();

    if (!/^SELECT\s+/i.test(normalized)) {
      throw new QueryValidationError('Query must start with SELECT.', 'Example: SELECT * FROM data');
    }

    const clauseOrder = ['SELECT', 'FROM', 'WHERE', 'ORDER BY', 'LIMIT'];
    const upper = normalized.toUpperCase();
    const positions = clauseOrder
      .map((clause) => ({ clause, index: upper.indexOf(clause) }))
      .filter((entry) => entry.index >= 0)
      .sort((left, right) => left.index - right.index);

    for (let index = 1; index < positions.length; index += 1) {
      const previousClause = clauseOrder.indexOf(positions[index - 1].clause);
      const currentClause = clauseOrder.indexOf(positions[index].clause);
      if (currentClause < previousClause) {
        throw new QueryValidationError(
          `Clause order is invalid near ${positions[index].clause}.`,
          'Use: SELECT ... FROM ... WHERE ... ORDER BY ... LIMIT ...'
        );
      }
    }

    const selectMatch = normalized.match(/^SELECT\s+(.+?)\s+FROM\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(.*)$/i);
    if (!selectMatch) {
      throw new QueryValidationError(
        'Invalid SELECT structure.',
        'Expected format: SELECT column1, column2 FROM data WHERE column = "value"'
      );
    }

    const rawColumns = selectMatch[1].trim();
    const from = selectMatch[2].trim();
    let remainder = selectMatch[3].trim();

    if (!rawColumns) {
      throw new QueryValidationError('SELECT must contain at least one column.', 'Try SELECT * FROM data');
    }

    const columns = rawColumns
      .split(',')
      .map((col) => col.trim())
      .filter((col) => col.length > 0);

    if (columns.length === 0) {
      throw new QueryValidationError('No columns were found in SELECT.', 'Try SELECT * FROM data');
    }

    if (from.toLowerCase() !== this.tableName.toLowerCase()) {
      throw new QueryValidationError(
        `Unknown table "${from}".`,
        `This training environment exposes table "${this.tableName}" only.`
      );
    }

    let where: string | undefined;
    let orderBy: ParsedQuery['orderBy'];
    let limit: number | undefined;

    if (remainder) {
      const whereMatch = remainder.match(/^WHERE\s+(.+?)(?=\s+ORDER\s+BY\s+|\s+LIMIT\s+|$)/i);
      if (whereMatch) {
        where = whereMatch[1].trim();
      }

      const orderMatch = remainder.match(/ORDER\s+BY\s+([a-zA-Z_][a-zA-Z0-9_]*)(?:\s+(ASC|DESC))?/i);
      if (orderMatch) {
        orderBy = {
          column: orderMatch[1],
          direction: (orderMatch[2]?.toUpperCase() as 'ASC' | 'DESC' | undefined) ?? 'ASC'
        };
      }

      const limitMatch = remainder.match(/LIMIT\s+(\d+)/i);
      if (limitMatch) {
        limit = Number(limitMatch[1]);
        if (Number.isNaN(limit) || limit < 0) {
          throw new QueryValidationError('LIMIT must be a non-negative integer.', 'Example: LIMIT 10');
        }
      }

      const unknownTail = remainder
        .replace(/^WHERE\s+(.+?)(?=\s+ORDER\s+BY\s+|\s+LIMIT\s+|$)/i, '')
        .replace(/ORDER\s+BY\s+([a-zA-Z_][a-zA-Z0-9_]*)(?:\s+(ASC|DESC))?/i, '')
        .replace(/LIMIT\s+\d+/i, '')
        .trim();

      if (unknownTail) {
        throw new QueryValidationError(
          `Unsupported clause segment: "${unknownTail}".`,
          'Supported clauses: WHERE, ORDER BY, LIMIT'
        );
      }
    }

    if (where) {
      this.validateWhereClause(where);
    }

    if (orderBy) {
      this.ensureColumnExists(orderBy.column, 'ORDER BY');
    }

    return {
      columns,
      from,
      where,
      orderBy,
      limit
    };
  }

  private validateWhereClause(whereClause: string): void {
    const segments = whereClause.split(/\s+(AND|OR)\s+/i).filter((segment) => segment.trim().length > 0);
    const conditions = segments.filter((_, index) => index % 2 === 0);

    if (conditions.length === 0) {
      throw new QueryValidationError('WHERE clause is empty.', 'Example: WHERE age > 18');
    }

    for (const condition of conditions) {
      const parsed = this.parseCondition(condition);
      this.ensureColumnExists(parsed.column, 'WHERE');
      this.validateConditionValue(parsed.valueRaw, parsed.operator);
    }
  }

  private parseCondition(condition: string): { column: string; operator: string; valueRaw: string } {
    const matches = condition.trim().match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*(=|!=|<=|>=|<|>|LIKE)\s*(.+)$/i);

    if (!matches) {
      throw new QueryValidationError(
        `Invalid WHERE condition: "${condition.trim()}".`,
        'Expected format: column OPERATOR value, e.g. country = "Sri Lanka"'
      );
    }

    return {
      column: matches[1],
      operator: matches[2].toUpperCase(),
      valueRaw: matches[3].trim()
    };
  }

  private validateConditionValue(valueRaw: string, operator: string): void {
    if (!valueRaw) {
      throw new QueryValidationError('Missing value in WHERE condition.', 'Use double quotes for text values.');
    }

    const isDoubleQuoted = /^".*"$/.test(valueRaw);
    const isSingleQuoted = /^'.*'$/.test(valueRaw);
    const isNumber = /^-?\d+(\.\d+)?$/.test(valueRaw);
    const isBoolean = /^(true|false)$/i.test(valueRaw);

    if (isSingleQuoted) {
      throw new QueryValidationError(
        `Use double quotes for string values instead of single quotes: ${valueRaw}`,
        'Example: WHERE country = "Sri Lanka"'
      );
    }

    if (!isDoubleQuoted && !isNumber && !isBoolean) {
      throw new QueryValidationError(
        `String values must use double quotes. Invalid value: ${valueRaw}`,
        'Example: WHERE city = "Colombo"'
      );
    }

    if (operator === 'LIKE' && !isDoubleQuoted) {
      throw new QueryValidationError('LIKE requires a double-quoted string value.', 'Example: WHERE email LIKE "@gmail.com"');
    }
  }

  private evaluateWhere(row: Record<string, any>, whereClause: string): boolean {
    const segments = whereClause.split(/\s+(AND|OR)\s+/i).filter((segment) => segment.trim().length > 0);
    const conditions = segments.filter((_, index) => index % 2 === 0).map((condition) => this.parseCondition(condition));
    const operators = segments.filter((_, index) => index % 2 === 1).map((op) => op.toUpperCase());

    const values = conditions.map((condition) => this.evaluateCondition(row, condition));

    let result = values[0] ?? true;
    for (let index = 1; index < values.length; index += 1) {
      const logicalOperator = operators[index - 1];
      if (logicalOperator === 'AND') {
        result = result && values[index];
      } else {
        result = result || values[index];
      }
    }

    return result;
  }

  private evaluateCondition(
    row: Record<string, any>,
    condition: { column: string; operator: string; valueRaw: string }
  ): boolean {
    const cellValue = row[condition.column];
    const compareValue = this.parseValue(condition.valueRaw);
    const normalizedCellValue = this.normalizeValue(cellValue);

    switch (condition.operator) {
      case '=':
        return normalizedCellValue == compareValue;
      case '!=':
        return normalizedCellValue != compareValue;
      case '<':
        return normalizedCellValue < compareValue;
      case '>':
        return normalizedCellValue > compareValue;
      case '<=':
        return normalizedCellValue <= compareValue;
      case '>=':
        return normalizedCellValue >= compareValue;
      case 'LIKE':
        return String(normalizedCellValue).toLowerCase().includes(String(compareValue).toLowerCase());
      default:
        return false;
    }
  }

  private parseValue(valueRaw: string): string | number | boolean {
    if (/^".*"$/.test(valueRaw)) {
      return valueRaw.slice(1, -1);
    }

    if (/^(true|false)$/i.test(valueRaw)) {
      return valueRaw.toLowerCase() === 'true';
    }

    if (/^-?\d+(\.\d+)?$/.test(valueRaw)) {
      return Number(valueRaw);
    }

    return valueRaw;
  }

  private normalizeValue(value: unknown): string | number | boolean {
    if (typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }

    if (value == null) {
      return '';
    }

    const asNumber = Number(value);
    if (!Number.isNaN(asNumber) && String(value).trim() !== '') {
      return asNumber;
    }

    return String(value);
  }

  private ensureColumnsExist(columns: string[]): void {
    if (columns.length === 1 && columns[0] === '*') {
      return;
    }

    columns.forEach((column) => this.ensureColumnExists(column, 'SELECT'));
  }

  private ensureColumnExists(column: string, clause: 'SELECT' | 'WHERE' | 'ORDER BY'): void {
    const availableColumns = this.getAvailableColumns();
    if (availableColumns.length === 0) {
      return;
    }

    if (!availableColumns.includes(column)) {
      throw new QueryValidationError(
        `Unknown column "${column}" in ${clause}.`,
        `Available columns: ${availableColumns.join(', ')}`
      );
    }
  }
}
