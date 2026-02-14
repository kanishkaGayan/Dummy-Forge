import React, { useEffect, useMemo, useState } from 'react';

interface DataPreviewProps {
  data: Record<string, string | number | boolean>[];
  limit?: number;
}

export const DataPreview: React.FC<DataPreviewProps> = ({ data, limit = 100 }) => {
  const [page, setPage] = useState(1);


  useEffect(() => {
    setPage(1);
  }, [data.length]);

  const columns = useMemo(() => (data.length > 0 ? Object.keys(data[0]) : []), [data]);
  const totalPages = Math.max(1, Math.ceil(data.length / limit));
  const safePage = Math.min(page, totalPages);

  const rows = useMemo(() => {
    if (data.length === 0) return [];
    const start = (safePage - 1) * limit;
    return data.slice(start, start + limit);
  }, [data, limit, safePage]);

  if (data.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-4 text-sm text-slate-500 shadow-sm">
        No data generated yet.
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-700">
          Preview ({Math.min(limit, data.length)} rows)
        </h3>
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <button
            className="rounded border px-2 py-1"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={safePage === 1}
          >
            Prev
          </button>
          <span>
            Page {safePage} of {totalPages}
          </span>
          <button
            className="rounded border px-2 py-1"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={safePage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
      <div className="max-h-80 overflow-auto">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 bg-slate-100">
            <tr>
              {columns.map((col) => (
                <th key={col} className="border px-2 py-1 text-left font-semibold">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                {columns.map((col) => {
                  const normalized = col.toLowerCase();
                  const shouldWrap = normalized.includes('email') || normalized.includes('address');
                  return (
                    <td
                      key={col}
                      className={`border px-2 py-1 ${shouldWrap ? 'whitespace-normal break-words' : 'whitespace-nowrap'}`}
                    >
                      {String(row[col])}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
