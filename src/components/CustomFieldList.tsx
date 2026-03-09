import React from 'react';
import { FieldConfig } from '../types/schema';

interface CustomFieldListProps {
  fields: FieldConfig[];
  onEdit: (field: FieldConfig) => void;
  onDelete: (name: string) => void;
}

export const CustomFieldList: React.FC<CustomFieldListProps> = ({ fields, onEdit, onDelete }) => {
  const typeLabels: Record<string, string> = {
    randomString: 'Letters',
    randomNumeric: 'Numbers',
    randomAlphanumeric: 'Letters + Numbers',
    autoIncrement: 'Auto Count',
    autoIncrementCustom: 'Auto Count (Custom)',
    unixTimestamp: 'Timestamp',
    isoDate: 'Date',
    boolean: 'Yes / No',
    uuid: 'Unique ID',
    customPattern: 'Pattern'
  };

  if (fields.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-4 text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
        No custom fields added yet.
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Custom Fields</h3>
      <div className="overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-slate-100 text-left dark:bg-slate-700">
            <tr>
              <th className="border px-2 py-2 dark:border-slate-600 dark:text-slate-200">Name</th>
              <th className="border px-2 py-2 dark:border-slate-600 dark:text-slate-200">Type</th>
              <th className="border px-2 py-2 dark:border-slate-600 dark:text-slate-200">No duplicates</th>
              <th className="border px-2 py-2 dark:border-slate-600 dark:text-slate-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => (
              <tr key={field.name} className="odd:bg-white even:bg-slate-50 dark:odd:bg-slate-800 dark:even:bg-slate-700/40">
                <td className="border px-2 py-2 dark:border-slate-600 dark:text-slate-200">{field.name}</td>
                <td className="border px-2 py-2 dark:border-slate-600 dark:text-slate-200">{typeLabels[field.type] ?? field.type}</td>
                <td className="border px-2 py-2 dark:border-slate-600 dark:text-slate-200">{field.unique ? 'Yes' : 'No'}</td>
                <td className="border px-2 py-2 dark:border-slate-600">
                  <div className="flex flex-wrap gap-2">
                    <button className="rounded border px-2 py-1 text-xs dark:border-slate-600 dark:text-slate-100" onClick={() => onEdit(field)}>
                      Edit
                    </button>
                    <button className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 dark:border-red-700 dark:text-red-400" onClick={() => onDelete(field.name)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
