import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FieldConfig, FieldType } from '../types/schema';
import { sanitizeFieldName, sanitizePattern, sanitizeAffix, sanitizeNumber, sanitizePercentage } from '../lib/utils/sanitizer';

const fieldTypeOptions: Array<{ value: FieldType; label: string; helper: string }> = [
  { value: 'randomString', label: 'Letters', helper: 'Random letters (A-Z)' },
  { value: 'randomNumeric', label: 'Numbers', helper: 'Random numbers' },
  { value: 'randomAlphanumeric', label: 'Letters + Numbers', helper: 'Mixed letters and numbers' },
  { value: 'autoIncrement', label: 'Auto Count', helper: '1, 2, 3...' },
  { value: 'autoIncrementCustom', label: 'Auto Count (Custom)', helper: 'Pick start and step' },
  { value: 'unixTimestamp', label: 'Timestamp', helper: 'Current time' },
  { value: 'isoDate', label: 'Date', helper: 'YYYY-MM-DD' },
  { value: 'boolean', label: 'Yes / No', helper: 'True or False' },
  { value: 'uuid', label: 'Unique ID', helper: 'Random unique ID' },
  { value: 'customPattern', label: 'Pattern', helper: 'Your own pattern' }
];

const patternPresets = [
  { label: 'XXX-####-XXX', value: 'XXX-####-XXX' },
  { label: 'INV-####', value: 'INV-####' },
  { label: 'AA-#####', value: 'AA-#####' },
  { label: 'USER-###', value: 'USER-###' }
];

interface CustomFieldFormProps {
  onAddField: (field: FieldConfig) => void;
  onUpdateField: (field: FieldConfig) => void;
  editingField?: FieldConfig | null;
  onCancelEdit: () => void;
  reservedNames: string[];
}

interface CustomFieldFormValues {
  name: string;
  type: FieldType;
  unique: boolean;
  lengthMin?: number;
  lengthMax?: number;
  numberMin?: number;
  numberMax?: number;
  prefix?: string;
  suffix?: string;
  start?: number;
  step?: number;
  pattern?: string;
  dateFormat?: 'iso' | 'us' | 'eu';
  booleanTruePercentage?: number;
}

export const CustomFieldForm: React.FC<CustomFieldFormProps> = ({
  onAddField,
  onUpdateField,
  editingField,
  onCancelEdit,
  reservedNames
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
    trigger,
    resetField
  } = useForm<CustomFieldFormValues>({
    defaultValues: {
      type: 'randomString',
      unique: false,
      lengthMin: 1,
      lengthMax: 6
    },
    mode: 'onChange',
    reValidateMode: 'onChange'
  });

  const selectedType = watch('type');
  const uniqueValue = watch('unique');
  const nameValue = watch('name') ?? '';
  const prefixValue = watch('prefix') ?? '';
  const suffixValue = watch('suffix') ?? '';
  const normalizedReserved = React.useMemo(
    () => new Set(reservedNames.map((name) => name.trim().toLowerCase())),
    [reservedNames]
  );

  useEffect(() => {
    trigger('name');
  }, [normalizedReserved, trigger]);

  useEffect(() => {
    if (editingField) {
      reset({
        name: editingField.name,
        type: editingField.type,
        unique: editingField.unique,
        lengthMin: editingField.config?.lengthMin,
        lengthMax: editingField.config?.lengthMax,
        numberMin: editingField.config?.numberMin,
        numberMax: editingField.config?.numberMax,
        prefix: editingField.config?.prefix,
        suffix: editingField.config?.suffix,
        start: editingField.config?.start,
        step: editingField.config?.step,
        pattern: editingField.config?.pattern,
        dateFormat: editingField.config?.dateFormat,
        booleanTruePercentage: editingField.config?.booleanTruePercentage
      });
    } else {
      reset({ type: 'randomString', unique: false });
    }
  }, [editingField, reset]);

  useEffect(() => {
    if (selectedType === 'uuid') {
      setValue('unique', true);
    }
    if (selectedType === 'boolean') {
      setValue('unique', false);
    }
  }, [selectedType, setValue]);

  const onSubmit = (values: CustomFieldFormValues) => {
    // Sanitize all inputs
    const sanitizedName = sanitizeFieldName(values.name);
    const sanitizedPattern = values.pattern ? sanitizePattern(values.pattern) : undefined;
    const sanitizedPrefix = values.prefix ? sanitizeAffix(values.prefix) : undefined;
    const sanitizedSuffix = values.suffix ? sanitizeAffix(values.suffix) : undefined;
    
    const payload: FieldConfig = {
      name: sanitizedName,
      type: values.type,
      unique: values.unique,
      config: {
        lengthMin: sanitizeNumber(values.lengthMin, 1, 1000),
        lengthMax: sanitizeNumber(values.lengthMax, 1, 1000),
        numberMin: sanitizeNumber(values.numberMin, -999999999, 999999999),
        numberMax: sanitizeNumber(values.numberMax, -999999999, 999999999),
        prefix: sanitizedPrefix,
        suffix: sanitizedSuffix,
        start: sanitizeNumber(values.start, 1, 999999999),
        step: sanitizeNumber(values.step, 1, 999999999),
        pattern: sanitizedPattern,
        dateFormat: values.dateFormat,
        booleanTruePercentage: sanitizePercentage(values.booleanTruePercentage)
      }
    };

    if (editingField) {
      onUpdateField(payload);
      onCancelEdit();
    } else {
      onAddField(payload);
    }
    reset({
      name: '',
      type: 'randomString',
      unique: false,
      lengthMin: 1,
      lengthMax: 6,
      numberMin: undefined,
      numberMax: undefined,
      prefix: '',
      suffix: '',
      start: undefined,
      step: undefined,
      pattern: '',
      dateFormat: undefined,
      booleanTruePercentage: undefined
    });
    resetField('lengthMin', { defaultValue: 1 });
    resetField('lengthMax', { defaultValue: 6 });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
        {editingField ? 'Edit Custom Field' : 'Add Custom Field'}
      </h3>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Field name</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            disabled={!!editingField}
            maxLength={20}
            {...register('name', {
              required: 'Field name is required.',
              validate: (value) => {
                const normalized = value.trim().toLowerCase();
                if (!normalized) {
                  return 'Field name is required.';
                }
                if (value.length > 20) {
                  return 'Field name cannot exceed 20 characters.';
                }
                if (normalizedReserved.has(normalized)) {
                  return 'Field name already exists or matches a predefined field.';
                }
                return true;
              }
            })}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{Math.max(0, 20 - nameValue.length)} characters remaining</p>
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          {editingField && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Name can’t be changed while editing.</p>}
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">Type</label>
          <select className="mt-1 w-full rounded border-2 border-slate-300 bg-slate-50 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100" {...register('type')}>
            {fieldTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {fieldTypeOptions.find((option) => option.value === selectedType)?.helper}
          </p>
        </div>
        {(selectedType === 'randomString' || selectedType === 'randomNumeric' || selectedType === 'randomAlphanumeric') && (
          <>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Min length</label>
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                {...register('lengthMin', {
                  setValueAs: (value) => (value === '' ? undefined : Number(value)),
                  validate: (value) => {
                    if (value === undefined) return true;
                    if (Number.isNaN(value)) return 'Min length is required.';
                    if (value <= 0) return 'Min length must be at least 1.';
                    const max = getValues('lengthMax');
                    if (max !== undefined && value > max) {
                      return 'Min length cannot exceed max length.';
                    }
                    return true;
                  }
                })}
              />
              {errors.lengthMin && <p className="mt-1 text-xs text-red-600">{errors.lengthMin.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Max length</label>
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                {...register('lengthMax', {
                  setValueAs: (value) => (value === '' ? undefined : Number(value)),
                  validate: (value) => {
                    if (value === undefined) return true;
                    if (Number.isNaN(value)) return 'Max length is required.';
                    if (value <= 0) return 'Max length must be at least 1.';
                    if (value > 20) return 'Max length cannot exceed 20.';
                    const min = getValues('lengthMin');
                    if (min !== undefined && value < min) {
                      return 'Max length cannot be less than min length.';
                    }
                    return true;
                  }
                })}
              />
              {errors.lengthMax && <p className="mt-1 text-xs text-red-600">{errors.lengthMax.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Prefix (optional)
                <span className="ml-1 cursor-help text-slate-400" title="Text added before the value.">ⓘ</span>
              </label>
              <input
                className="mt-1 w-full rounded border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                maxLength={6}
                {...register('prefix', {
                  validate: (value) => {
                    if (!value) return true;
                    return value.length <= 6 || 'Prefix cannot exceed 6 characters.';
                  }
                })}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{Math.max(0, 6 - prefixValue.length)} characters remaining</p>
              {errors.prefix && <p className="mt-1 text-xs text-red-600">{errors.prefix.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Suffix (optional)
                <span className="ml-1 cursor-help text-slate-400" title="Text added after the value.">ⓘ</span>
              </label>
              <input
                className="mt-1 w-full rounded border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                maxLength={6}
                {...register('suffix', {
                  validate: (value) => {
                    if (!value) return true;
                    return value.length <= 6 || 'Suffix cannot exceed 6 characters.';
                  }
                })}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{Math.max(0, 6 - suffixValue.length)} characters remaining</p>
              {errors.suffix && <p className="mt-1 text-xs text-red-600">{errors.suffix.message}</p>}
            </div>
          </>
        )}

        {(selectedType === 'autoIncrement' || selectedType === 'autoIncrementCustom') && (
          <>
            <div>
              <label className="text-xs font-medium text-slate-600">Start at</label>
              <input type="number" className="mt-1 w-full rounded border px-3 py-2 text-sm" {...register('start', { valueAsNumber: true })} />
            </div>
            {selectedType === 'autoIncrementCustom' && (
              <div>
                <label className="text-xs font-medium text-slate-600">Step</label>
                <input type="number" className="mt-1 w-full rounded border px-3 py-2 text-sm" {...register('step', { valueAsNumber: true })} />
              </div>
            )}
          </>
        )}

        {selectedType === 'customPattern' && (
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-medium text-slate-600">Pattern</label>
            <input className="mt-1 w-full rounded border px-3 py-2 text-sm" {...register('pattern')} />
            <p className="text-xs text-slate-500">Use X for letters and # for numbers. Example: XXX-####-XXX</p>
            <div className="flex flex-wrap gap-2">
              {patternPresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  className="rounded border px-2 py-1 text-xs"
                  onClick={() => setValue('pattern', preset.value)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {selectedType === 'boolean' && (
          <div>
            <label className="text-xs font-medium text-slate-600">Yes %</label>
            <input
              type="number"
              min={0}
              max={100}
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
              {...register('booleanTruePercentage', { valueAsNumber: true })}
            />
            <p className="mt-1 text-xs text-slate-500">No % will be {100 - (watch('booleanTruePercentage') ?? 50)}%</p>
          </div>
        )}
        <div className="flex items-center gap-2 pt-6">
          <input type="checkbox" {...register('unique')} disabled={selectedType === 'uuid' || selectedType === 'boolean'} />
          <span className="text-sm text-slate-700">No duplicates</span>
          {selectedType === 'uuid' && (
            <span className="text-xs text-slate-500">Unique ID is always unique.</span>
          )}
          {selectedType === 'boolean' && (
            <span className="text-xs text-slate-500">Yes/No can repeat.</span>
          )}
          {selectedType !== 'uuid' && uniqueValue && selectedType === 'unixTimestamp' && (
            <span className="text-xs text-slate-500">Timestamps are already unique per row.</span>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm text-white">
          {editingField ? 'Update Field' : 'Add Field'}
        </button>
        {editingField && (
          <button type="button" className="rounded border px-4 py-2 text-sm" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
