import React from 'react';
import { ExportSelection } from '../types/exports';

interface ExportOptionsProps {
  value: ExportSelection;
  onChange: (value: ExportSelection) => void;
}

export const ExportOptions: React.FC<ExportOptionsProps> = ({ value, onChange }) => {
  const toggle = (key: keyof ExportSelection) => {
    onChange({ ...value, [key]: !value[key] });
  };

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Export Format</h3>
      <div className="flex flex-wrap gap-4 text-sm">
        {(['sql', 'csv', 'txt', 'pdf', 'xlsx'] as (keyof ExportSelection)[]).map((key) => (
          <label key={key} className="flex items-center gap-2">
            <input type="checkbox" checked={value[key]} onChange={() => toggle(key)} />
            {key.toUpperCase()}
          </label>
        ))}
      </div>
    </div>
  );
};
