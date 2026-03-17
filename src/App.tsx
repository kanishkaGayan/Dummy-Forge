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
import { QueryEditor } from './components/QueryEditor';
import UpdateNotification from './components/UpdateNotification';
import { Database, Moon, Sun, TerminalSquare } from 'lucide-react';
import { ExportSelection } from './types/exports';
import { DemographicsConfig, FieldConfig, GenerationConfig, LocationConfig } from './types/schema';
import appIcon from './icons/icon.svg';
import { createError, DummyForgeError } from './lib/errors/ErrorCodes';

type TabType = 'generator' | 'query';

const defaultDemographics: DemographicsConfig = {
  malePercentage: 50,
  femalePercentage: 50,
  ageConfig: { mode: 'between', min: 18, max: 65 }
};

const defaultLocation: LocationConfig = {
  mode: 'random'
};

const THEME_KEY = 'dummyforge_theme';

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
  // Initialize theme from localStorage to prevent flash
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_KEY);
      return saved === 'dark' ? 'dark' : 'light';
    }
    return 'light';
  });
  const [activeTab, setActiveTab] = useState<TabType>('generator');
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
  const [generationProgress, setGenerationProgress] = useState(0);

  useEffect(() => {
    const accepted = localStorage.getItem(LICENSE_KEY) === 'true';
    setLicenseOpen(!accepted);
    // Apply initial theme to DOM
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    // Save theme to localStorage whenever it changes
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

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

  const showAgeSelection = useMemo(
    () => fields.some((field) => field.selected && (field.type === 'age' || field.type === 'dateOfBirth')),
    [fields]
  );

  const showGenderSelection = useMemo(
    () => fields.some((field) => field.selected && field.type === 'gender'),
    [fields]
  );

  const showLocationSettings = useMemo(() => {
    const locationDependentTypes = new Set([
      'country',
      'phone',
      'mobilePhone',
      'landline',
      'address',
      'streetAddress',
      'city',
      'state',
      'postalCode'
    ]);

    return fields.some((field) => field.selected && locationDependentTypes.has(field.type));
  }, [fields]);

  const handleGenerate = () => {
    if (isGenerating) return;
    
    // Validate unique fields constraints
    const uniqueFields = activeFields.filter(f => f.unique);
    if (uniqueFields.length > 0) {
      const maxUniqueCount = Math.min(recordCount, 100000);
      const estimatedUniqueCapacity = 100000; // Capacity for unique values
      
      if (recordCount > estimatedUniqueCapacity && uniqueFields.length > 0) {
        setError(createError(
          'DF-GEN-006',
          `Cannot generate ${recordCount} records with unique fields. Maximum allowed: ${estimatedUniqueCapacity} records with unique fields.`
        ));
        return;
      }
    }
    
    setIsGenerating(true);
    setGenerationProgress(5);
    const startTime = Date.now();

    const progressTimer = window.setInterval(() => {
      setGenerationProgress((prev) => (prev < 90 ? prev + 5 : prev));
    }, 120);
    
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
        
        // Validate generation success
        if (!records || records.length === 0) {
          throw createError('DF-GEN-005', 'Data generation produced no records');
        }
        
        if (records.length < recordCount) {
          console.warn(`Generated ${records.length} records instead of requested ${recordCount}`);
        }
        
        setData(records);
        setGenerationProgress(100);
        
        // Show success notification
        const duration = Date.now() - startTime;
        console.log(`✓ Successfully generated ${records.length} records in ${duration}ms`);
        
      } catch (err) {
        if (err instanceof DummyForgeError) {
          setError(err);
        } else if (err instanceof Error) {
          setError(createError('DF-GEN-005', err.message, { originalError: err }));
        } else {
          setError(createError('DF-GEN-005', 'Unknown error'));
        }
      } finally {
        window.clearInterval(progressTimer);
        window.setTimeout(() => {
          setIsGenerating(false);
          setGenerationProgress(0);
        }, 250);
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
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors duration-300 dark:bg-slate-900 dark:text-slate-200">
      {error && <ErrorDialog error={error} onClose={() => setError(null)} />}
      <UpdateNotification />
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

          <header className="border-b border-slate-200 bg-white px-8 py-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={appIcon} alt="Dummy Forge" className="h-10 w-10 rounded" />
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold tracking-tight">Dummy Forge</h1>
                  <p className="text-xs leading-tight text-slate-500 dark:text-slate-400">Generate realistic dummy data for education and development.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  aria-label="Toggle theme"
                >
                  <span className="inline-flex items-center gap-2">
                    {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    {theme === 'light' ? 'Dark' : 'Light'}
                  </span>
                </button>
                <button
                  onClick={() => setShowAbout(true)}
                  className="rounded-md bg-slate-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                >
                  About
                </button>
              </div>
            </div>
          </header>

          <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-8 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
            <div className="flex gap-2 border-b border-transparent py-1">
              <button
                onClick={() => setActiveTab('generator')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'generator'
                    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Data Generator
                </span>
              </button>
              <button
                onClick={() => setActiveTab('query')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'query'
                    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <TerminalSquare className="h-4 w-4" />
                  Query Studio
                </span>
              </button>
            </div>
          </div>

          <main className="mx-auto max-w-6xl space-y-6 px-8 py-6">
            {activeTab === 'generator' ? (
              <>
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
            <div className={`grid gap-6 ${showLocationSettings ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
              <DemographicsConfigPanel
                value={demographics}
                recordCount={recordCount}
                showAgeSelection={showAgeSelection}
                showGenderSelection={showGenderSelection}
                onRecordCountChange={setRecordCount}
                onChange={setDemographics}
              />
              {showLocationSettings && <CountrySelector value={location} onChange={setLocation} />}
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
                className="rounded border border-slate-300 bg-white px-4 py-2 text-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                onClick={handleExport}
                disabled={data.length === 0}
              >
                Export Selected Formats
              </button>
              <button
                className="rounded border border-red-300 bg-white px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:border-red-700 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-950/30"
                onClick={() => setShowClearConfirm(true)}
                disabled={data.length === 0}
              >
                Clear Data
              </button>
            </div>

            {isGenerating && (
              <div className="rounded border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
                <div className="mb-2 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span>Generating data, please wait...</span>
                  <span>{Math.min(100, Math.max(0, generationProgress))}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full bg-blue-600 transition-all duration-150"
                    style={{ width: `${Math.min(100, Math.max(0, generationProgress))}%` }}
                  />
                </div>
              </div>
            )}

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

            {data.length > 0 && <DataPreview data={data} />}
              </>
            ) : (
              <>
                <QueryEditor data={data} />
                {data.length === 0 && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-800/60">
                    <h3 className="mb-2 font-semibold text-slate-700 dark:text-slate-100">No data available</h3>
                    <p className="text-sm text-slate-600 mb-4 dark:text-slate-300">
                      Generate some data in the <strong>Data Generator</strong> tab first, then come back here to query it.
                    </p>
                    <button
                      onClick={() => setActiveTab('generator')}
                      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      Go to Generator
                    </button>
                  </div>
                )}
              </>
            )}
          </main>

          <footer className="mt-8 border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <p>
              © 2026 Dummy Forge. All rights reserved. | Made by{' '}
              <a
                href="https://kanishka.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
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
