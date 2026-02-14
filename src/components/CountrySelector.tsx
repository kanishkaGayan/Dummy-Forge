import React, { useMemo, useState } from 'react';
import { countries } from '../lib/utils/countryData';
import { LocationConfig } from '../types/schema';

interface CountrySelectorProps {
  value: LocationConfig;
  onChange: (value: LocationConfig) => void;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({ value, onChange }) => {
  const [specificSearch, setSpecificSearch] = useState('');
  const [singleSearch, setSingleSearch] = useState('');

  const filteredSpecific = useMemo(() => {
    const query = specificSearch.trim().toLowerCase();
    if (!query) return countries;
    return countries.filter((country) =>
      `${country.name} ${country.code}`.toLowerCase().includes(query)
    );
  }, [specificSearch]);

  const filteredSingle = useMemo(() => {
    const query = singleSearch.trim().toLowerCase();
    if (!query) return countries;
    return countries.filter((country) =>
      `${country.name} ${country.code}`.toLowerCase().includes(query)
    );
  }, [singleSearch]);

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Country & Location Settings</h3>
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={value.mode === 'random'}
            onChange={() => onChange({ mode: 'random' })}
          />
          Random countries
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={value.mode === 'specific'}
            onChange={() => onChange({ mode: 'specific', countries: value.countries ?? [] })}
          />
          Specific countries
        </label>
        {value.mode === 'specific' && (
          <div className="space-y-2">
            <input
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="Search countries..."
              value={specificSearch}
              onChange={(event) => setSpecificSearch(event.target.value)}
            />
            <div className="max-h-56 overflow-auto rounded border">
              {filteredSpecific.map((country) => {
                const selected = (value.countries ?? []).includes(country.code);
                return (
                  <button
                    type="button"
                    key={country.code}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                      selected ? 'bg-blue-50 text-blue-700' : 'bg-white'
                    }`}
                    onClick={() => {
                      const current = value.countries ?? [];
                      const next = selected
                        ? current.filter((code) => code !== country.code)
                        : [...current, country.code];
                      onChange({ mode: 'specific', countries: next });
                      setSpecificSearch('');
                    }}
                  >
                    <span>{country.name}</span>
                    <span className="text-xs text-slate-500">{selected ? 'Selected' : ''}</span>
                  </button>
                );
              })}
            </div>
            {(value.countries ?? []).length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs">
                {(value.countries ?? []).map((code) => {
                  const name = countries.find((c) => c.code === code)?.name ?? code;
                  return (
                    <span key={code} className="rounded-full border bg-slate-50 px-2 py-1">
                      {name}
                    </span>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-slate-500">Showing {filteredSpecific.length} countries</p>
          </div>
        )}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={value.mode === 'single'}
            onChange={() => onChange({ mode: 'single', singleCountry: value.singleCountry ?? 'US' })}
          />
          Single country
        </label>
        {value.mode === 'single' && (
          <div className="space-y-2">
            <input
              className="w-full rounded border px-3 py-2 text-sm"
              placeholder="Search countries..."
              value={singleSearch}
              onChange={(event) => setSingleSearch(event.target.value)}
            />
            <select
              className="w-full rounded border px-3 py-2 text-sm"
              value={value.singleCountry ?? 'US'}
              onChange={(event) => onChange({ mode: 'single', singleCountry: event.target.value })}
            >
              {filteredSingle.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">Showing {filteredSingle.length} countries</p>
          </div>
        )}
      </div>
    </div>
  );
};
