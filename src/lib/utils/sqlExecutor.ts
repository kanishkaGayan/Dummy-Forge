/**
 * In-memory SQL query executor for learning/practice purposes
 * Supports basic SELECT queries on generated data with aggregates and GROUP BY
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

interface ColumnSpec {
  expression: string;
  alias?: string;
  isAggregate: boolean;
  aggregateFunc?: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX';
  aggregateColumn?: string;
}

interface SubstringIndexSpec {
  column: string;
  delimiter: string;
  count: number;
}

interface ParsedQuery {
  columns: ColumnSpec[];
  from: string;
  where?: string;
  groupBy?: string[];
  having?: string;
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

  private aggregateFunctions = {
    COUNT: (values: any[]) => values.length,
    SUM: (values: any[]) => values.reduce((sum, val) => sum + (Number(val) || 0), 0),
    AVG: (values: any[]) => {
      const sum = values.reduce((s, val) => s + (Number(val) || 0), 0);
      return values.length > 0 ? sum / values.length : 0;
    },
    MIN: (values: any[]) => Math.min(...values.map(v => Number(v) || 0)),
    MAX: (values: any[]) => Math.max(...values.map(v => Number(v) || 0))
  };

  setData(data: Record<string, any>[]): void {
    this.data = data;
  }

  getAvailableColumns(): string[] {
    return this.data.length > 0 ? Object.keys(this.data[0]) : [];
  }

  /**
   * Get column value from row with case-insensitive lookup
   * This aligns with SQL standard behavior where column names are case-insensitive
   */
  private getColumnValue(row: Record<string, any>, columnName: string): any {
    // First try exact match for performance
    if (columnName in row) {
      return row[columnName];
    }
    
    // Fall back to case-insensitive search
    const columnLower = columnName.toLowerCase();
    const actualKey = Object.keys(row).find(key => key.toLowerCase() === columnLower);
    return actualKey ? row[actualKey] : undefined;
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
        hint: 'Tip: use quoted strings in WHERE, e.g. WHERE country = "Sri Lanka" or WHERE country = \'Sri Lanka\''
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

    // Apply WHERE filter
    if (parsed.where) {
      results = results.filter((row) => this.evaluateWhere(row, parsed.where!));
    }

    // Handle GROUP BY with aggregates
    if (parsed.groupBy && parsed.groupBy.length > 0) {
      results = this.executeGroupBy(results, parsed);
    } else if (parsed.columns.some(col => col.isAggregate)) {
      // Aggregates without GROUP BY - treat entire dataset as one group
      results = this.executeGroupBy(results, { ...parsed, groupBy: [] });
    } else {
      // No aggregates - regular SELECT
      results = this.executeRegularSelect(results, parsed);
    }

    // Apply ORDER BY
    if (parsed.orderBy) {
      const { column, direction } = parsed.orderBy;
      results.sort((left, right) => {
        const leftValue = this.getColumnValue(left, column);
        const rightValue = this.getColumnValue(right, column);

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

    // Apply LIMIT
    if (typeof parsed.limit === 'number') {
      results = results.slice(0, parsed.limit);
    }

    // Extract column names, handling SELECT * case
    let columns: string[];
    if (parsed.columns.length === 1 && parsed.columns[0].expression === '*') {
      // For SELECT *, use all columns from results
      columns = results.length > 0 ? Object.keys(results[0]) : [];
    } else {
      columns = parsed.columns.map(col => col.alias || col.expression);
    }

    return {
      columns,
      rows: results,
      rowCount: results.length
    };
  }

  private executeRegularSelect(rows: Record<string, any>[], parsed: ParsedQuery): Record<string, any>[] {
    let columnsToSelect = parsed.columns;
    
    // Handle SELECT *
    if (columnsToSelect.length === 1 && columnsToSelect[0].expression === '*') {
      return rows;
    }

    return rows.map((row) => {
      const newRow: Record<string, any> = {};
      columnsToSelect.forEach((col) => {
        const outputName = col.alias || col.expression;
        newRow[outputName] = this.evaluateExpression(row, col.expression);
      });
      return newRow;
    });
  }

  private executeGroupBy(rows: Record<string, any>[], parsed: ParsedQuery): Record<string, any>[] {
    const groupBy = parsed.groupBy || [];
    const groups = new Map<string, Record<string, any>[]>();

    // Group rows
    if (groupBy.length > 0) {
      rows.forEach((row) => {
        const key = groupBy.map((expression) => this.evaluateExpression(row, expression)).join('|');
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)!.push(row);
      });
    } else {
      // No GROUP BY - entire dataset is one group
      groups.set('_all_', rows);
    }

    // Apply aggregates to each group
    const results: Record<string, any>[] = [];
    
    groups.forEach((groupRows) => {
      const resultRow: Record<string, any> = {};
      
      parsed.columns.forEach((col) => {
        const outputName = col.alias || col.expression;
        
        if (col.isAggregate && col.aggregateFunc) {
          // Apply aggregate function
          if (col.aggregateFunc === 'COUNT' && col.aggregateColumn === '*') {
            resultRow[outputName] = groupRows.length;
          } else {
            const values = col.aggregateColumn 
              ? groupRows.map(r => this.getColumnValue(r, col.aggregateColumn!))
              : groupRows.map(r => this.getColumnValue(r, col.expression));
            const aggFunc = this.aggregateFunctions[col.aggregateFunc];
            resultRow[outputName] = aggFunc ? aggFunc(values) : null;
          }
        } else {
          // Non-aggregate column (should be in GROUP BY)
          resultRow[outputName] = this.evaluateExpression(groupRows[0], col.expression);
        }
      });
      
      results.push(resultRow);
    });

    // Apply HAVING filter
    if (parsed.having) {
      return results.filter((row) => this.evaluateHaving(row, parsed.having!, parsed.columns));
    }

    return results;
  }

  private parseSelectQuery(query: string): ParsedQuery {
    const normalized = query
      .replace(/;\s*$/, '')
      .trim()
      // Normalize whitespace: replace newlines and multiple spaces with single space
      .replace(/\s+/g, ' ')
      // Preserve keywords by ensuring spaces around them
      .replace(/\bFROM\b/gi, ' FROM ')
      .replace(/\bWHERE\b/gi, ' WHERE ')
      .replace(/\bGROUP\s+BY\b/gi, ' GROUP BY ')
      .replace(/\bHAVING\b/gi, ' HAVING ')
      .replace(/\bORDER\s+BY\b/gi, ' ORDER BY ')
      .replace(/\bLIMIT\b/gi, ' LIMIT ')
      .replace(/\bCASE\b/gi, ' CASE ')
      .replace(/\bWHEN\b/gi, ' WHEN ')
      .replace(/\bTHEN\b/gi, ' THEN ')
      .replace(/\bELSE\b/gi, ' ELSE ')
      .replace(/\bEND\b/gi, ' END ')
      .replace(/\bBETWEEN\b/gi, ' BETWEEN ')
      .replace(/\bAND\b/gi, ' AND ')
      .replace(/\bOR\b/gi, ' OR ')
      .replace(/\s+/g, ' ')
      .trim();

    this.validateUnsupportedQueryPatterns(normalized);

    if (!/^SELECT\s+/i.test(normalized)) {
      throw new QueryValidationError('Query must start with SELECT.', 'Example: SELECT * FROM data');
    }

    const clauseOrder = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT'];
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
          'Use: SELECT ... FROM ... WHERE ... GROUP BY ... HAVING ... ORDER BY ... LIMIT ...'
        );
      }
    }

    // Updated regex to work with normalized whitespace
    const selectMatch = normalized.match(/^SELECT\s+(.+?)\s+FROM\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(.*)$/i);
    if (!selectMatch) {
      throw new QueryValidationError(
        'Invalid SELECT structure.',
        'Expected format: SELECT column1, column2 FROM data. Supports CASE statements and aggregates.'
      );
    }

    const rawColumns = selectMatch[1].trim();
    const from = selectMatch[2].trim();
    let remainder = selectMatch[3].trim();

    if (!rawColumns) {
      throw new QueryValidationError('SELECT must contain at least one column.', 'Try SELECT * FROM data');
    }

    // Parse columns with aggregate support and CASE statements
    const columns = this.parseColumns(rawColumns);

    if (from.toLowerCase() !== this.tableName.toLowerCase()) {
      throw new QueryValidationError(
        `Unknown table "${from}".`,
        `This training environment exposes table "${this.tableName}" only.`
      );
    }

    let where: string | undefined;
    let groupBy: string[] | undefined;
    let having: string | undefined;
    let orderBy: ParsedQuery['orderBy'];
    let limit: number | undefined;

    if (remainder) {
      // Parse WHERE
      const whereMatch = remainder.match(/^WHERE\s+(.+?)(?=\s+GROUP\s+BY\s+|\s+ORDER\s+BY\s+|\s+LIMIT\s+|$)/i);
      if (whereMatch) {
        where = whereMatch[1].trim();
      }

      // Parse GROUP BY
      const groupByMatch = remainder.match(/GROUP\s+BY\s+(.+?)(?=\s+HAVING\s+|\s+ORDER\s+BY\s+|\s+LIMIT\s+|$)/i);
      if (groupByMatch) {
        groupBy = this.splitByComma(groupByMatch[1])
          .map(col => col.trim())
          .filter(col => col.length > 0);
      }

      // Parse HAVING
      const havingMatch = remainder.match(/HAVING\s+(.+?)(?=\s+ORDER\s+BY\s+|\s+LIMIT\s+|$)/i);
      if (havingMatch) {
        having = havingMatch[1].trim();
      }

      // Parse ORDER BY
      const orderMatch = remainder.match(/ORDER\s+BY\s+([a-zA-Z_][a-zA-Z0-9_]*)(?:\s+(ASC|DESC))?/i);
      if (orderMatch) {
        orderBy = {
          column: orderMatch[1],
          direction: (orderMatch[2]?.toUpperCase() as 'ASC' | 'DESC' | undefined) ?? 'ASC'
        };
      }

      // Parse LIMIT
      const limitMatch = remainder.match(/LIMIT\s+(\d+)/i);
      if (limitMatch) {
        limit = Number(limitMatch[1]);
        if (Number.isNaN(limit) || limit < 0) {
          throw new QueryValidationError('LIMIT must be a non-negative integer.', 'Example: LIMIT 10');
        }
      }
    }

    // Validate WHERE clause
    if (where) {
      this.validateWhereClause(where);
    }

    // Validate GROUP BY columns exist
    if (groupBy) {
      groupBy.forEach(col => {
        const upper = col.toUpperCase();
        if (!upper.includes('CASE') && !upper.startsWith('SUBSTRING_INDEX(')) {
          this.ensureColumnExists(col, 'GROUP BY');
        }
      });
    }

    // Validate HAVING
    if (having && !groupBy) {
      throw new QueryValidationError(
        'HAVING clause requires GROUP BY.',
        'Example: SELECT country, COUNT(*) FROM data GROUP BY country HAVING COUNT(*) > 5'
      );
    }

    // Validate ORDER BY column exists or is an alias
    if (orderBy) {
      const availableColumns = [...this.getAvailableColumns(), ...columns.map(c => c.alias || c.expression)];
      const orderByLower = orderBy.column.toLowerCase();
      const columnExists = availableColumns.some(col => col.toLowerCase() === orderByLower);
      
      if (!columnExists) {
        throw new QueryValidationError(
          `Unknown column "${orderBy.column}" in ORDER BY.`,
          `Available columns: ${availableColumns.join(', ')}`
        );
      }
    }

    return {
      columns,
      from,
      where,
      groupBy,
      having,
      orderBy,
      limit
    };
  }

  private parseColumns(rawColumns: string): ColumnSpec[] {
    if (rawColumns.trim() === '*') {
      return [{ expression: '*', isAggregate: false }];
    }

    const columns: ColumnSpec[] = [];
    const parts = this.splitByComma(rawColumns);

    parts.forEach(part => {
      const trimmed = part.trim();

      const substringIndexMatch = trimmed.match(/^(SUBSTRING_INDEX\s*\(\s*[a-zA-Z_][a-zA-Z0-9_]*\s*,\s*(?:"[^"]*"|'[^']*')\s*,\s*-?\d+\s*\))(?:\s+AS\s+([a-zA-Z_][a-zA-Z0-9_]*))?$/i);
      if (substringIndexMatch) {
        const parsedFunction = this.parseSubstringIndex(trimmed);
        this.ensureColumnExists(parsedFunction.column, 'SELECT');

        columns.push({
          expression: trimmed.split(/\s+AS\s+/i)[0].trim(),
          alias: substringIndexMatch[2],
          isAggregate: false
        });
        return;
      }
      
      // Check for CASE statement
      if (trimmed.toUpperCase().includes('CASE')) {
        // Extract CASE expression and alias
        const caseMatch = trimmed.match(/^(CASE\s+.+?\s+END)(?:\s+AS\s+([a-zA-Z_][a-zA-Z0-9_]*))?$/i);
        
        if (caseMatch) {
          const caseExpr = caseMatch[1].trim();
          const alias = caseMatch[2] || 'case_result';
          
          columns.push({
            expression: caseExpr,
            alias: alias,
            isAggregate: false
          });
        } else {
          throw new QueryValidationError(
            `Invalid CASE statement syntax: "${trimmed}".`,
            'Example: CASE WHEN age < 18 THEN "Under 18" WHEN age >= 18 THEN "Adult" ELSE "Unknown" END AS age_group'
          );
        }
        return;
      }
      
      // Check for aggregate functions
      const aggMatch = trimmed.match(/^(COUNT|SUM|AVG|MIN|MAX)\s*\(\s*(\*|[a-zA-Z_][a-zA-Z0-9_]*)\s*\)(?:\s+AS\s+([a-zA-Z_][a-zA-Z0-9_]*))?$/i);
      
      if (aggMatch) {
        const func = aggMatch[1].toUpperCase() as 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX';
        const col = aggMatch[2];
        const alias = aggMatch[3];
        
        columns.push({
          expression: trimmed.split(/\s+AS\s+/i)[0].trim(),
          alias: alias || `${func.toLowerCase()}(${col})`,
          isAggregate: true,
          aggregateFunc: func,
          aggregateColumn: col
        });
      } else {
        // Regular column with optional AS alias
        const aliasMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*|\*)\s+AS\s+([a-zA-Z_][a-zA-Z0-9_]*)$/i);
        
        if (aliasMatch) {
          const colName = aliasMatch[1];
          const alias = aliasMatch[2];
          
          if (colName !== '*') {
            this.ensureColumnExists(colName, 'SELECT');
          }
          
          columns.push({
            expression: colName,
            alias: alias,
            isAggregate: false
          });
        } else {
          // Simple column without alias
          if (trimmed !== '*' && !this.isSimpleColumnReference(trimmed)) {
            throw new QueryValidationError(
              `Unsupported expression in SELECT: "${trimmed}".`,
              'Supported expressions: column names, CASE ... END, SUBSTRING_INDEX(column, "@", -1), and aggregate functions.'
            );
          }

          if (trimmed !== '*') {
            this.ensureColumnExists(trimmed, 'SELECT');
          }
          
          columns.push({
            expression: trimmed,
            isAggregate: false
          });
        }
      }
    });

    return columns;
  }

  private splitByComma(str: string): string[] {
    const parts: string[] = [];
    let current = '';
    let parenDepth = 0;
    let caseDepth = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const remaining = str.slice(i).toUpperCase();
      
      // Helper to check if we're at a word boundary (start of keyword)
      const isWordBoundary = (index: number) => {
        if (index === 0) return true;
        const prevChar = str[index - 1];
        return !/[a-zA-Z0-9_]/.test(prevChar);
      };
      
      // Helper to check if position after keyword is a word boundary
      const isWordBoundaryAfter = (index: number, keywordLength: number) => {
        const afterIndex = index + keywordLength;
        if (afterIndex >= str.length) return true;
        const nextChar = str[afterIndex];
        return !/[a-zA-Z0-9_]/.test(nextChar);
      };
      
      // Track CASE...END blocks (only if they're standalone keywords)
      if (remaining.startsWith('CASE') && isWordBoundary(i) && isWordBoundaryAfter(i, 4)) {
        caseDepth++;
        i += 3; // Skip "CASE"
        current += 'CASE';
        continue;
      }
      
      if (remaining.startsWith('END') && isWordBoundary(i) && isWordBoundaryAfter(i, 3)) {
        caseDepth = Math.max(0, caseDepth - 1);
        i += 2; // Skip "END"
        current += 'END';
        continue;
      }
      
      if (char === '(') parenDepth++;
      if (char === ')') parenDepth--;
      
      // Only split on comma if not inside parentheses or CASE block
      if (char === ',' && parenDepth === 0 && caseDepth === 0) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    if (current.trim()) {
      parts.push(current.trim());
    }

    return parts;
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
    const matches = condition.trim().match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*(=|!=|<=|>=|<|>|NOT\s+LIKE|LIKE)\s*(.+)$/i);

    if (!matches) {
      throw new QueryValidationError(
        `Invalid WHERE condition: "${condition.trim()}".`,
        'Expected format: column OPERATOR value, e.g. country = "Sri Lanka"'
      );
    }

    return {
      column: matches[1],
      operator: matches[2].replace(/\s+/g, ' ').toUpperCase(),
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

    if (!isDoubleQuoted && !isSingleQuoted && !isNumber && !isBoolean) {
      throw new QueryValidationError(
        `Invalid value in WHERE condition: ${valueRaw}`,
        'Use quoted text or numbers. Example: WHERE city = "Colombo" or WHERE city = \'Colombo\''
      );
    }

    if ((operator === 'LIKE' || operator === 'NOT LIKE') && !isDoubleQuoted && !isSingleQuoted) {
      throw new QueryValidationError(
        `${operator} requires a quoted string value.`,
        'Example: WHERE email NOT LIKE "%@%"'
      );
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
    const cellValue = this.getColumnValue(row, condition.column);
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
        return this.matchesLikePattern(normalizedCellValue, compareValue);
      case 'NOT LIKE':
        return !this.matchesLikePattern(normalizedCellValue, compareValue);
      default:
        return false;
    }
  }

  private evaluateExpression(row: Record<string, any>, expression: string): any {
    const trimmed = expression.trim();
    if (!trimmed) {
      return null;
    }

    if (/^CASE\b/i.test(trimmed)) {
      return this.evaluateCaseExpression(row, trimmed);
    }

    if (/^SUBSTRING_INDEX\s*\(/i.test(trimmed)) {
      return this.evaluateSubstringIndexExpression(row, trimmed);
    }

    if (/^".*"$/.test(trimmed)) {
      return trimmed.slice(1, -1);
    }

    if (/^'.*'$/.test(trimmed)) {
      return trimmed.slice(1, -1);
    }

    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return Number(trimmed);
    }

    // Column reference - use case-insensitive lookup
    return this.getColumnValue(row, trimmed);
  }

  private evaluateCaseExpression(row: Record<string, any>, caseExpression: string): any {
    const normalized = caseExpression.replace(/\s+/g, ' ').trim();
    const upper = normalized.toUpperCase();

    if (!upper.startsWith('CASE ') || !upper.endsWith(' END')) {
      throw new QueryValidationError(
        `Invalid CASE expression: "${caseExpression}".`,
        'Expected format: CASE WHEN condition THEN value [WHEN ... THEN ...] ELSE value END'
      );
    }

    const body = normalized.slice(4, -3).trim();
    const whenThenRegex = /WHEN\s+(.+?)\s+THEN\s+(.+?)(?=\s+WHEN\s+|\s+ELSE\s+|$)/gi;
    const branches: Array<{ condition: string; value: string }> = [];

    let match = whenThenRegex.exec(body);
    while (match) {
      branches.push({ condition: match[1].trim(), value: match[2].trim() });
      match = whenThenRegex.exec(body);
    }

    const elseMatch = body.match(/\sELSE\s+(.+)$/i);
    const elseValueRaw = elseMatch ? elseMatch[1].trim() : undefined;

    for (const branch of branches) {
      if (this.evaluateCaseCondition(row, branch.condition)) {
        return this.parseCaseResultValue(branch.value, row);
      }
    }

    if (elseValueRaw !== undefined) {
      return this.parseCaseResultValue(elseValueRaw, row);
    }

    return null;
  }

  private evaluateCaseCondition(row: Record<string, any>, conditionRaw: string): boolean {
    const trimmed = conditionRaw.trim();
    const betweenMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s+BETWEEN\s+(.+?)\s+AND\s+(.+)$/i);

    if (betweenMatch) {
      const column = betweenMatch[1];
      const min = this.parseValue(betweenMatch[2].trim());
      const max = this.parseValue(betweenMatch[3].trim());
      const cellValue = this.normalizeValue(this.getColumnValue(row, column));

      return cellValue >= min && cellValue <= max;
    }

    const parsed = this.parseCondition(trimmed);
    return this.evaluateCondition(row, parsed);
  }

  private parseCaseResultValue(valueRaw: string, row: Record<string, any>): any {
    const trimmed = valueRaw.trim();

    if (/^".*"$/.test(trimmed)) {
      return trimmed.slice(1, -1);
    }

    if (/^'.*'$/.test(trimmed)) {
      return trimmed.slice(1, -1);
    }

    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      return Number(trimmed);
    }

    if (/^(true|false)$/i.test(trimmed)) {
      return trimmed.toLowerCase() === 'true';
    }

    // Column reference - use case-insensitive lookup
    return this.getColumnValue(row, trimmed);
  }

  private parseValue(valueRaw: string): string | number | boolean {
    if (/^".*"$/.test(valueRaw)) {
      return valueRaw.slice(1, -1);
    }

    if (/^'.*'$/.test(valueRaw)) {
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

  private isSimpleColumnReference(value: string): boolean {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value.trim());
  }

  private validateUnsupportedQueryPatterns(normalizedQuery: string): void {
    if (/\bJOIN\b/i.test(normalizedQuery)) {
      throw new QueryValidationError(
        'Relationship queries are not supported in Query Studio.',
        `Only one table is available: ${this.tableName}. Remove JOIN and query from ${this.tableName} directly.`
      );
    }

    if (/\(\s*SELECT\b/i.test(normalizedQuery) || /\bFROM\s*\(/i.test(normalizedQuery)) {
      throw new QueryValidationError(
        'Subqueries are not supported in Query Studio.',
        `Use single-level SELECT from ${this.tableName} with WHERE, GROUP BY, HAVING, ORDER BY, and LIMIT.`
      );
    }

    if (/\bUNION\b|\bINTERSECT\b|\bEXCEPT\b|\bWITH\b/i.test(normalizedQuery)) {
      throw new QueryValidationError(
        'Set operations and CTEs are not supported in Query Studio.',
        `Use a single SELECT statement from ${this.tableName}.`
      );
    }
  }

  private parseSubstringIndex(expression: string): SubstringIndexSpec {
    const match = expression
      .split(/\s+AS\s+/i)[0]
      .trim()
      .match(/^SUBSTRING_INDEX\s*\(\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*,\s*("[^"]*"|'[^']*')\s*,\s*(-?\d+)\s*\)$/i);

    if (!match) {
      throw new QueryValidationError(
        `Invalid SUBSTRING_INDEX syntax: "${expression}".`,
        'Expected: SUBSTRING_INDEX(column, "@", -1)'
      );
    }

    const delimiterToken = match[2].trim();
    const delimiter = delimiterToken.slice(1, -1);

    return {
      column: match[1],
      delimiter,
      count: Number(match[3])
    };
  }

  private evaluateSubstringIndexExpression(row: Record<string, any>, expression: string): string {
    const parsed = this.parseSubstringIndex(expression);
    const rawValue = this.getColumnValue(row, parsed.column);
    const text = rawValue == null ? '' : String(rawValue);

    if (parsed.count === 0) {
      return '';
    }

    const parts = text.split(parsed.delimiter);
    if (parts.length === 1) {
      return text;
    }

    if (parsed.count > 0) {
      return parts.slice(0, parsed.count).join(parsed.delimiter);
    }

    return parts.slice(parsed.count).join(parsed.delimiter);
  }

  private matchesLikePattern(value: string | number | boolean, pattern: string | number | boolean): boolean {
    const source = String(value);
    const rawPattern = String(pattern);
    const escapedPattern = rawPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexPattern = escapedPattern.replace(/%/g, '.*').replace(/_/g, '.');
    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(source);
  }

  private ensureColumnExists(column: string, clause: 'SELECT' | 'WHERE' | 'ORDER BY' | 'GROUP BY'): void {
    const availableColumns = this.getAvailableColumns();
    if (availableColumns.length === 0) {
      return;
    }

    // Case-insensitive column name comparison (SQL standard behavior)
    const columnLower = column.toLowerCase();
    const columnExists = availableColumns.some(col => col.toLowerCase() === columnLower);
    
    if (!columnExists) {
      throw new QueryValidationError(
        `Unknown column "${column}" in ${clause}.`,
        `Available columns: ${availableColumns.join(', ')}`
      );
    }
  }

  private evaluateHaving(row: Record<string, any>, havingClause: string, selectedColumns: ColumnSpec[]): boolean {
    const trimmed = havingClause.trim();
    
    // Parse HAVING condition: aggregate_function(col) OPERATOR value
    const aggMatch = trimmed.match(/^(COUNT|SUM|AVG|MIN|MAX)\s*\(\s*(\*|[a-zA-Z_][a-zA-Z0-9_]*)\s*\)\s*(=|!=|<=|>=|<|>)\s*(.+)$/i);
    
    if (aggMatch) {
      const func = aggMatch[1].toUpperCase();
      const col = aggMatch[2];
      const operator = aggMatch[3];
      const valueRaw = aggMatch[4].trim();
      
      const matchingAggregate = selectedColumns.find((selectedCol) => {
        if (!selectedCol.isAggregate || !selectedCol.aggregateFunc) {
          return false;
        }

        const selectedFunc = selectedCol.aggregateFunc.toUpperCase();
        const selectedAggCol = (selectedCol.aggregateColumn || '').toLowerCase();
        const queryAggCol = col.toLowerCase();
        return selectedFunc === func && selectedAggCol === queryAggCol;
      });

      if (!matchingAggregate) {
        throw new QueryValidationError(
          `HAVING references ${func}(${col}) but it's not in SELECT.`,
          `Add ${func}(${col}) to your SELECT clause or use an alias that matches.`
        );
      }

      const resultColumnName = matchingAggregate.alias || matchingAggregate.expression;
      
      const cellValue = this.getColumnValue(row, resultColumnName);
      const compareValue = this.parseValue(valueRaw);
      const normalizedCellValue = this.normalizeValue(cellValue);
      
      switch (operator) {
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
        default:
          return false;
      }
    }
    
    // Fallback to regular column-based evaluation for non-aggregate HAVING
    return this.evaluateWhere(row, havingClause);
  }
}
