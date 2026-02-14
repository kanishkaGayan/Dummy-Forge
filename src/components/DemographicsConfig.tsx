import React from 'react';
import { AgeConfig, DemographicsConfig } from '../types/schema';

interface DemographicsConfigProps {
  value: DemographicsConfig;
  recordCount: number;
  onRecordCountChange: (count: number) => void;
  onChange: (value: DemographicsConfig) => void;
}

export const DemographicsConfigPanel: React.FC<DemographicsConfigProps> = ({
  value,
  recordCount,
  onRecordCountChange,
  onChange
}) => {
  const updateAgeConfig = (ageConfig: AgeConfig) => {
    onChange({ ...value, ageConfig });
  };

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Configure Demographics</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-slate-600">Total Records (1-10,000)</label>
          <input
            type="number"
            min={1}
            max={10000}
            value={recordCount}
            onChange={(event) => onRecordCountChange(Number(event.target.value))}
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Female %</label>
          <input
            type="number"
            min={0}
            max={100}
            value={value.femalePercentage}
            onChange={(event) => {
              const female = Math.min(100, Math.max(0, Number(event.target.value)));
              onChange({
                ...value,
                femalePercentage: female,
                malePercentage: 100 - female
              });
            }}
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-slate-500">Male % will be {100 - value.femalePercentage}%</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold text-slate-600">Age selection</p>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={value.ageConfig.mode === 'between'}
            onChange={() => updateAgeConfig({ mode: 'between', min: 18, max: 65 })}
          />
          Between
        </label>
        {value.ageConfig.mode === 'between' && (
          <div className="ml-6 flex gap-2">
            <input
              type="number"
              className="w-24 rounded border px-2 py-1 text-sm"
              value={value.ageConfig.min}
              onChange={(event) =>
                updateAgeConfig({
                  mode: 'between',
                  min: Number(event.target.value),
                  max: value.ageConfig.mode === 'between' ? value.ageConfig.max : 65
                })
              }
            />
            <input
              type="number"
              className="w-24 rounded border px-2 py-1 text-sm"
              value={value.ageConfig.max}
              onChange={(event) =>
                updateAgeConfig({
                  mode: 'between',
                  min: value.ageConfig.mode === 'between' ? value.ageConfig.min : 18,
                  max: Number(event.target.value)
                })
              }
            />
          </div>
        )}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={value.ageConfig.mode === 'under'}
            onChange={() => updateAgeConfig({ mode: 'under', max: 18 })}
          />
          Under
        </label>
        {value.ageConfig.mode === 'under' && (
          <input
            type="number"
            className="ml-6 w-24 rounded border px-2 py-1 text-sm"
            value={value.ageConfig.max}
            onChange={(event) => updateAgeConfig({ mode: 'under', max: Number(event.target.value) })}
          />
        )}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={value.ageConfig.mode === 'above'}
            onChange={() => updateAgeConfig({ mode: 'above', min: 65 })}
          />
          Above
        </label>
        {value.ageConfig.mode === 'above' && (
          <input
            type="number"
            className="ml-6 w-24 rounded border px-2 py-1 text-sm"
            value={value.ageConfig.min}
            onChange={(event) => updateAgeConfig({ mode: 'above', min: Number(event.target.value) })}
          />
        )}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={value.ageConfig.mode === 'exact'}
            onChange={() => updateAgeConfig({ mode: 'exact', value: 30 })}
          />
          Exact
        </label>
        {value.ageConfig.mode === 'exact' && (
          <input
            type="number"
            className="ml-6 w-24 rounded border px-2 py-1 text-sm"
            value={value.ageConfig.value}
            onChange={(event) => updateAgeConfig({ mode: 'exact', value: Number(event.target.value) })}
          />
        )}
      </div>
    </div>
  );
};
