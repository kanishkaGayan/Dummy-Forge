import React from 'react';
import { FieldConfig } from '../types/schema';

interface FieldSelectorProps {
  fields: Array<FieldConfig & { selected: boolean }>;
  onToggle: (name: string) => void;
  onToggleUnique: (name: string) => void;
  disableUniqueFor?: string[];
  conflictMessage?: string | null;
}

export const FieldSelector: React.FC<FieldSelectorProps> = ({
  fields,
  onToggle,
  onToggleUnique,
  disableUniqueFor = [],
  conflictMessage
}) => {
  const disabledSet = new Set(disableUniqueFor);
  const toReadableLabel = (value: string) =>
    value
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/^./, (char) => char.toUpperCase());

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Predefined Fields</h3>
      {conflictMessage && (
        <p className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300">
          {conflictMessage}
        </p>
      )}
      <div className="grid gap-3 md:grid-cols-3">
        {fields.map((field) => (
          <div
            key={field.name}
            className={`rounded border p-3 transition-all duration-200 ${field.selected ? 'border-blue-300 bg-blue-50/40' : 'border-slate-200 bg-white'}`}
          >
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={field.selected}
                onChange={() => onToggle(field.name)}
              />
              <span className="font-medium">{toReadableLabel(field.name)}</span>
            </label>
            {!disabledSet.has(field.name) && (
              <label className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={field.unique}
                  onChange={() => onToggleUnique(field.name)}
                />
                Unique
              </label>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
