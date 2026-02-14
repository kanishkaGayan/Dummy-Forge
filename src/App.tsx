import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DataGenerator } from './lib/generators/dataGenerator';
import { exportToCSV } from './lib/exporters/csvExporter';
import { exportToPDF } from './lib/exporters/pdfExporter';
import { exportToSQL } from './lib/exporters/sqlExporter';
import { exportToTXT } from './lib/exporters/txtExporter';
import { exportToXLSX } from './lib/exporters/xlsxExporter';
import { CountrySelector } from './components/CountrySelector';
import { CustomFieldForm } from './components/CustomFieldForm';
import { CustomFieldList } from './components/CustomFieldList';
import { DataPreview } from './components/DataPreview';
import { DemographicsConfigPanel } from './components/DemographicsConfig';
import { ExportOptions } from './components/ExportOptions';
import { FieldSelector } from './components/FieldSelector';
import { LicenseAgreement } from './components/LicenseAgreement';
import { AboutPage } from './components/AboutPage';
import { ErrorDialog } from './components/ErrorHandler';
import { ExportSelection } from './types/exports';
import { DemographicsConfig, FieldConfig, GenerationConfig, LocationConfig } from './types/schema';
import appIcon from './icons/icon.png';
import { createError, DummyForgeError } from './lib/errors/ErrorCodes';

const defaultDemographics: DemographicsConfig = {
  malePercentage: 50,
  femalePercentage: 50,
  ageConfig: { mode: 'between', min: 18, max: 65 }
};

const defaultLocation: LocationConfig = {
  mode: 'random'
};

type SelectableField = FieldConfig & { selected: boolean };

const predefinedFields: SelectableField[] = [
  { name: 'firstName', type: 'firstName', unique: false, selected: true },
  { name: 'lastName', type: 'lastName', unique: false, selected: true },
  { name: 'fullName', type: 'fullName', unique: false, selected: false },
  { name: 'gender', type: 'gender', unique: false, selected: true },
  { name: 'age', type: 'age', unique: false, selected: true },
  { name: 'dateOfBirth', type: 'dateOfBirth', unique: false, selected: false },
  { name: 'email', type: 'email', unique: true, selected: true },
  { name: 'phone', type: 'phone', unique: false, selected: false },
  { name: 'country', type: 'country', unique: false, selected: false },
  { name: 'address', type: 'address', unique: false, selected: false }
];

const defaultExports: ExportSelection = {
  sql: true,
  csv: true,
  txt: false,
  pdf: false,
  xlsx: false
};

const LICENSE_KEY = 'dummyforge_license_accepted';

const App: React.FC = () => {
  const [licenseOpen, setLicenseOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [fields, setFields] = useState<SelectableField[]>(predefinedFields);
  const [customFields, setCustomFields] = useState<FieldConfig[]>([]);
  const [editingField, setEditingField] = useState<FieldConfig | null>(null);
  const editFormRef = useRef<HTMLDivElement | null>(null);
  const [demographics, setDemographics] = useState<DemographicsConfig>(defaultDemographics);
  const [location, setLocation] = useState<LocationConfig>(defaultLocation);
  const [recordCount, setRecordCount] = useState(1000);
  const [exportSelection, setExportSelection] = useState<ExportSelection>(defaultExports);
  const [data, setData] = useState<Record<string, string | number | boolean>[]>([]);
  const [error, setError] = useState<DummyForgeError | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [predefinedConflict, setPredefinedConflict] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(LICENSE_KEY) === 'true';
    setLicenseOpen(!accepted);
  }, []);

  useEffect(() => {
    if (editingField && editFormRef.current) {
      editFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [editingField]);

  useEffect(() => {
    if (data.length === 0 && showClearConfirm) {
      setShowClearConfirm(false);
    }
  }, [data.length, showClearConfirm]);

  const activeFields = useMemo(() => {
    return [...fields.filter((field) => field.selected), ...customFields];
  }, [fields, customFields]);

  const handleGenerate = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    window.setTimeout(() => {
      try {
        const generator = new DataGenerator();
        const config: GenerationConfig = {
          fields: activeFields.map((field) => ({
            name: field.name,
            type: field.type,
            unique: field.unique,
            config: field.config
          })),
          count: recordCount,
          demographics,
          location
        };

        const records = generator.generateRecords(config);
        setData(records);
      } catch (err) {
        if (err instanceof DummyForgeError) {
          setError(err);
        } else if (err instanceof Error) {
          setError(createError('DF-GEN-005', err.message, { originalError: err }));
        } else {
          setError(createError('DF-GEN-005', 'Unknown error'));
        }
      } finally {
        setIsGenerating(false);
      }
    }, 50);
  };

  const handleExport = () => {
    try {
      if (data.length === 0) {
        throw createError('DF-EXP-005');
      }

      const hasSelection = Object.values(exportSelection).some(Boolean);
      if (!hasSelection) {
        throw createError('DF-EXP-006');
      }

      if (exportSelection.csv) exportToCSV(data, 'dummy-forge.csv');
      if (exportSelection.pdf) exportToPDF(data, 'dummy-forge.pdf');
      if (exportSelection.txt) exportToTXT(data, 'dummy-forge.txt');
      if (exportSelection.xlsx) exportToXLSX(data, 'dummy-forge.xlsx');
      if (exportSelection.sql) {
        const sql = exportToSQL(data, 'DummyForge');
        const blob = new Blob([sql], { type: 'text/sql;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'dummy-forge.sql';
        link.click();
      }
    } catch (err) {
      if (err instanceof DummyForgeError) {
        setError(err);
      } else if (err instanceof Error) {
        setError(createError('DF-EXP-001', err.message, { originalError: err }));
      } else {
        setError(createError('DF-EXP-001', 'Unknown export error'));
      }
    }
  };

  const handleToggleField = (name: string) => {
    const normalized = name.trim().toLowerCase();
    const current = fields.find((field) => field.name === name);
    const willSelect = current ? !current.selected : false;

    if (willSelect) {
      const hasCustomConflict = customFields.some((field) => field.name.trim().toLowerCase() === normalized);
      if (hasCustomConflict) {
        setPredefinedConflict(`Remove the custom field "${name}" before re-selecting this predefined field.`);
        return;
      }
    }

    setPredefinedConflict(null);
    setFields((prev) => prev.map((field) => (field.name === name ? { ...field, selected: !field.selected } : field)));
  };

  const handleToggleUnique = (name: string) => {
    setFields((prev) => prev.map((field) => (field.name === name ? { ...field, unique: !field.unique } : field)));
  };

  const handleAddCustomField = (field: FieldConfig) => {
    setCustomFields((prev) => [...prev, field]);
  };

  const handleUpdateCustomField = (updated: FieldConfig) => {
    setCustomFields((prev) => prev.map((field) => (field.name === updated.name ? updated : field)));
    setEditingField(null);
  };

  const handleDeleteCustomField = (name: string) => {
    setCustomFields((prev) => prev.filter((field) => field.name !== name));
    if (editingField?.name === name) {
      setEditingField(null);
    }
    if (predefinedConflict && predefinedConflict.includes(`"${name}"`)) {
      setPredefinedConflict(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {error && <ErrorDialog error={error} onClose={() => setError(null)} />}
      {showAbout ? (
        <AboutPage onClose={() => setShowAbout(false)} />
      ) : (
        <>
          <LicenseAgreement
            open={licenseOpen}
            onAccept={() => {
              localStorage.setItem(LICENSE_KEY, 'true');
              setLicenseOpen(false);
            }}
            onDecline={() => {
              localStorage.removeItem(LICENSE_KEY);
              setLicenseOpen(true);
            }}
          />

          <header className="border-b bg-white px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={appIcon} alt="Dummy Forge" className="h-10 w-10 rounded" />
                <h1 className="text-2xl font-bold">Dummy Forge</h1>
              </div>
              <button
                onClick={() => setShowAbout(true)}
                className="rounded-md bg-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-300"
              >
                About
              </button>
            </div>
            <p className="text-sm text-slate-600">Generate realistic dummy data for education and development.</p>
          </header>

          <main className="mx-auto max-w-6xl space-y-6 px-8 py-6">
            <FieldSelector
              fields={fields}
              onToggle={handleToggleField}
              onToggleUnique={handleToggleUnique}
              disableUniqueFor={[
                'firstName',
                'lastName',
                'fullName',
                'country',
                'gender',
                'age',
                'dateOfBirth',
                'createdAt',
                'updatedAt',
                'registrationDate',
                'unixTimestamp',
                'isoDate'
              ]}
              conflictMessage={predefinedConflict}
            />
            <div ref={editFormRef}>
              <CustomFieldForm
                onAddField={handleAddCustomField}
                onUpdateField={handleUpdateCustomField}
                editingField={editingField}
                onCancelEdit={() => setEditingField(null)}
                reservedNames={[
                  ...fields.filter((field) => field.selected).map((field) => field.name),
                  ...customFields.filter((field) => field.name !== editingField?.name).map((field) => field.name)
                ]}
              />
            </div>
            <CustomFieldList fields={customFields} onEdit={setEditingField} onDelete={handleDeleteCustomField} />
            <div className="grid gap-6 md:grid-cols-2">
              <DemographicsConfigPanel
                value={demographics}
                recordCount={recordCount}
                onRecordCountChange={setRecordCount}
                onChange={setDemographics}
              />
              <CountrySelector value={location} onChange={setLocation} />
            </div>
            <ExportOptions value={exportSelection} onChange={setExportSelection} />

            <div className="flex flex-wrap gap-3">
              <button
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-blue-400"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                    Generating…
                  </span>
                ) : (
                  'Generate Data'
                )}
              </button>
              <button
                className="rounded border border-slate-300 bg-white px-4 py-2 text-sm"
                onClick={handleExport}
                disabled={data.length === 0}
              >
                Export Selected Formats
              </button>
              <button
                className="rounded border border-red-300 bg-white px-4 py-2 text-sm text-red-600"
                onClick={() => setShowClearConfirm(true)}
                disabled={data.length === 0}
              >
                Clear Data
              </button>
            </div>

            {showClearConfirm && (
              <div className="mt-3 flex flex-wrap items-center gap-3 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span>Clear all generated data?</span>
                <button
                  className="rounded bg-red-600 px-3 py-1 text-white"
                  onClick={() => {
                    setData([]);
                    setShowClearConfirm(false);
                  }}
                >
                  Yes, clear
                </button>
                <button className="rounded border px-3 py-1" onClick={() => setShowClearConfirm(false)}>
                  Cancel
                </button>
              </div>
            )}

            <DataPreview data={data} />
          </main>

          <footer className="mt-8 border-t bg-white py-6 text-center text-sm text-slate-600">
            <p>
              © 2026 Dummy Forge. All rights reserved. | Made by{' '}
              <a
                href="https://kanishka.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Kanishka Meddegoda
              </a>
            </p>
          </footer>
        </>
      )}
    </div>
  );
};

export default App;
