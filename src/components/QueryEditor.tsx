import React, { useState, useMemo } from 'react';
import { SQLExecutor, QueryDiagnostic, QueryResult } from '../lib/utils/sqlExecutor';

interface QueryEditorProps {
  data: Record<string, any>[];
  onDataImport?: (data: Record<string, any>[]) => void;
  onDataExport?: (data: Record<string, any>[], filename: string) => void;
}

const SQL_KEYWORDS = [
  'SELECT',
  'FROM',
  'WHERE',
  'AND',
  'OR',
  'ORDER BY',
  'GROUP BY',
  'LIMIT',
  'LIKE',
  'ASC',
  'DESC'
];

const SQL_TEMPLATES = [
  'SELECT * FROM data',
  'SELECT column FROM data',
  'SELECT column FROM data WHERE column = "value"',
  'SELECT column FROM data WHERE column LIKE "value"',
  'SELECT column FROM data WHERE column = "value" AND column2 > 10',
  'SELECT column FROM data ORDER BY column ASC',
  'SELECT column FROM data ORDER BY column DESC',
  'SELECT column FROM data LIMIT 10'
];

interface SuggestionMatch {
  start: number;
  end: number;
  token: string;
}

const getCurrentToken = (value: string, cursorPosition: number): SuggestionMatch => {
  const boundedCursor = Math.max(0, Math.min(cursorPosition, value.length));
  let start = boundedCursor;
  let end = boundedCursor;

  while (start > 0 && /[\w*]/.test(value[start - 1])) {
    start -= 1;
  }

  while (end < value.length && /[\w*]/.test(value[end])) {
    end += 1;
  }

  return {
    start,
    end,
    token: value.slice(start, end)
  };
};

export const QueryEditor: React.FC<QueryEditorProps> = ({ data, onDataImport, onDataExport }) => {
  const [query, setQuery] = useState('SELECT * FROM data;');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<QueryDiagnostic[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [resultPage, setResultPage] = useState(1);
  const [rowsPerPage] = useState(20);

  const executor = useMemo(() => {
    const exec = new SQLExecutor();
    exec.setData(data);
    return exec;
  }, [data]);

  const columns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const totalResultPages = useMemo(() => {
    if (!result) return 1;
    return Math.max(1, Math.ceil(result.rows.length / rowsPerPage));
  }, [result, rowsPerPage]);

  const safeResultPage = Math.min(resultPage, totalResultPages);

  const pagedResultRows = useMemo(() => {
    if (!result) return [];
    const startIndex = (safeResultPage - 1) * rowsPerPage;
    return result.rows.slice(startIndex, startIndex + rowsPerPage);
  }, [result, safeResultPage, rowsPerPage]);

  const generateSuggestions = (inputText: string, fullQuery: string): string[] => {
    const token = inputText.trim().toLowerCase();
    const hasFrom = /\bfrom\b/i.test(fullQuery);
    const hasSelect = /\bselect\b/i.test(fullQuery);
    const inWhere = /\bwhere\b/i.test(fullQuery) && !/\border\s+by\b/i.test(fullQuery) && !/\blimit\b/i.test(fullQuery);

    const keywordSuggestions = SQL_KEYWORDS.filter((keyword) =>
      token ? keyword.toLowerCase().startsWith(token) : hasSelect ? ['FROM', 'WHERE', 'ORDER BY', 'LIMIT'].includes(keyword) : true
    );

    const templateSuggestions = SQL_TEMPLATES.filter((template) =>
      token ? template.toLowerCase().startsWith(token) : !hasFrom
    );

    const columnSuggestions = columns
      .filter((column) => {
        if (!token) return hasSelect;
        return column.toLowerCase().startsWith(token) || column.toLowerCase().includes(token);
      })
      .slice(0, 10);

    const valueSuggestions = inWhere
      ? ['"value"', '"Sri Lanka"', '"Colombo"', '10', '100', 'true', 'false']
          .filter((value) => (token ? value.toLowerCase().startsWith(token) : true))
      : [];

    return [...new Set([...keywordSuggestions, ...columnSuggestions, ...valueSuggestions, ...templateSuggestions])].slice(0, 12);
  };

  const applySuggestion = (suggestion: string, cursorPosition: number) => {
    const tokenMatch = getCurrentToken(query, cursorPosition);
    const before = query.slice(0, tokenMatch.start);
    const after = query.slice(tokenMatch.end);
    const needsSpace = after.length === 0 || !after.startsWith(' ');
    const nextValue = `${before}${suggestion}${needsSpace ? ' ' : ''}${after}`;
    setQuery(nextValue);
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setDiagnostics(executor.analyzeQuery(newQuery));

    const cursorPosition = e.target.selectionStart ?? newQuery.length;
    setCursorPosition(cursorPosition);
    const tokenMatch = getCurrentToken(newQuery, cursorPosition);
    const newSuggestions = generateSuggestions(tokenMatch.token, newQuery);
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0);
    setSelectedSuggestion(newSuggestions.length > 0 ? 0 : -1);
  };

  const handleQueryKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestion((prev) => (prev + 1) % suggestions.length);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestion((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
      return;
    }

    if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
      e.preventDefault();
      const suggestionToApply = suggestions[selectedSuggestion >= 0 ? selectedSuggestion : 0];
      const cursorPosition = (e.currentTarget.selectionStart ?? query.length);
      applySuggestion(suggestionToApply, cursorPosition);
      return;
    }

    if (e.key === ' ') {
      const caret = e.currentTarget.selectionStart ?? query.length;
      const tokenMatch = getCurrentToken(query, caret);
      const autoSuggestions = generateSuggestions(tokenMatch.token, query).filter((item) =>
        item.toLowerCase().startsWith(tokenMatch.token.toLowerCase())
      );

      if (tokenMatch.token.length >= 2 && autoSuggestions.length === 1) {
        e.preventDefault();
        applySuggestion(autoSuggestions[0], caret);
      }
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setShowSuggestions(false);
      setSelectedSuggestion(-1);
    }
  };

  const handleExecute = () => {
    setError(null);
    setResult(null);
    setResultPage(1);
    setSelectedSuggestion(-1);
    setShowSuggestions(false);

    const queryDiagnostics = executor.analyzeQuery(query);
    setDiagnostics(queryDiagnostics);

    const structuralError = queryDiagnostics.find((diag) => diag.severity === 'error');
    if (structuralError) {
      setError(structuralError.hint ? `${structuralError.message} Hint: ${structuralError.hint}` : structuralError.message);
      return;
    }

    try {
      const queryResult = executor.execute(query);
      setResult(queryResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    applySuggestion(suggestion, cursorPosition || query.length);
  };

  const handleExportData = () => {
    if (result && result.rows.length > 0 && onDataExport) {
      onDataExport(result.rows, 'query-result.sql');
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 rounded-lg bg-white p-6 shadow-sm">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-700">SQL Query Editor</h2>
          <div className="flex gap-2">
            <button
              onClick={handleExecute}
              className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 transition-colors"
            >
              Execute
            </button>
            {result && (
              <button
                onClick={handleExportData}
                className="rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition-colors"
              >
                Export Result
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          <textarea
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleQueryKeyDown}
            onClick={(e) => setCursorPosition((e.currentTarget as HTMLTextAreaElement).selectionStart ?? query.length)}
            onKeyUp={(e) => setCursorPosition((e.currentTarget as HTMLTextAreaElement).selectionStart ?? query.length)}
            placeholder="SELECT * FROM data WHERE condition..."
            className="h-40 w-full rounded-lg border border-slate-300 bg-slate-50 p-3 font-mono text-sm text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 z-50 mt-1 w-64 rounded-lg border border-slate-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    handleSuggestionClick(suggestion);
                  }}
                  className={`block w-full px-3 py-2 text-left text-sm ${
                    index === selectedSuggestion
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500">
          Available columns: {columns.length > 0 ? columns.join(', ') : 'No data available'}
        </p>
        <p className="text-xs text-slate-500">Tip: Use <strong>Tab</strong> or <strong>Enter</strong> to accept suggestions.</p>
        <p className="text-xs text-slate-500">Use double quotes for text values: <strong>WHERE country = "Sri Lanka"</strong></p>

        {diagnostics.length > 0 && (
          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
            <p className="mb-1 font-semibold text-slate-700">Query Structure Monitor</p>
            {diagnostics.map((diag, index) => (
              <p key={`${diag.message}-${index}`} className={diag.severity === 'error' ? 'text-red-700' : 'text-slate-600'}>
                {diag.severity === 'error' ? 'Error: ' : 'Info: '}
                {diag.message}
                {diag.hint ? ` (${diag.hint})` : ''}
              </p>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 animate-in fade-in">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-700">
              Results ({result.rowCount} rows, {result.executionTime}ms)
            </h3>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <button
                  type="button"
                  className="rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setResultPage((prev) => Math.max(1, prev - 1))}
                  disabled={safeResultPage === 1}
                >
                  Prev
                </button>
                <span>
                  Page {safeResultPage} of {totalResultPages}
                </span>
                <button
                  type="button"
                  className="rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => setResultPage((prev) => Math.min(totalResultPages, prev + 1))}
                  disabled={safeResultPage === totalResultPages}
                >
                  Next
                </button>
              </div>
          </div>

          <div className="overflow-auto rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  {result.columns.map((col) => (
                    <th key={col} className="border-r border-slate-200 px-4 py-2 text-left font-semibold text-slate-700">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedResultRows.map((row, idx) => (
                  <tr key={idx} className="border-t border-slate-200 hover:bg-slate-50">
                    {result.columns.map((col) => (
                      <td key={col} className="border-r border-slate-200 px-4 py-2 text-slate-900">
                        {String(row[col] ?? '-')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.rows.length > rowsPerPage && (
            <p className="text-xs text-slate-500">
              Showing {(safeResultPage - 1) * rowsPerPage + 1}–{Math.min(safeResultPage * rowsPerPage, result.rowCount)} of {result.rowCount} rows
            </p>
          )}
        </div>
      )}
    </div>
  );
};
