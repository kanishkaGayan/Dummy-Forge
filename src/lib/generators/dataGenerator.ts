import { faker } from '@faker-js/faker';
import { format, subYears } from 'date-fns';
import { countries } from '../utils/countryData';
import { phoneRules } from '../utils/phoneRules';
import { getDialCode, countryDialCodes } from '../utils/countryDialCodes';
import { getCountryLocationEntry } from '../utils/locationData';
import { createError, DummyForgeError } from '../errors/ErrorCodes';
import {
  GenerationConfig,
  FieldConfig,
  Gender,
  AgeConfig,
  LocationConfig
} from '../../types/schema';

const genderOptions: Gender[] = ['male', 'female', 'other', 'non-binary'];
const supportedCountryCodes = countryDialCodes.map((country) => country.code);
const supportedCountryCodeSet = new Set(supportedCountryCodes);

export class DataGenerator {
  private uniqueTrackers: Map<string, Set<string>>;
  private counters: Map<string, number>;

  constructor() {
    this.uniqueTrackers = new Map();
    this.counters = new Map();
  }

  generateRecords(config: GenerationConfig): Record<string, string | number | boolean>[] {
    if (config.count > 100000) {
      throw createError('DF-GEN-003', `Requested ${config.count} records`, {
        requestedCount: config.count,
        maxAllowed: 100000
      });
    }

    if (!config.fields || config.fields.length === 0) {
      throw createError('DF-GEN-004');
    }

    const total = config.demographics.malePercentage + config.demographics.femalePercentage;
    if (total !== 100) {
      throw createError('DF-GEN-006', `Total percentage: ${total}%`, {
        malePercentage: config.demographics.malePercentage,
        femalePercentage: config.demographics.femalePercentage,
        total
      });
    }

    if (config.demographics.ageConfig.mode === 'between') {
      const { min, max } = config.demographics.ageConfig;
      if (min >= max) {
        throw createError('DF-GEN-007', `Invalid range: ${min} - ${max}`, { min, max });
      }
    }

    const records: Record<string, string | number | boolean>[] = [];

    try {
      for (let i = 0; i < config.count; i += 1) {
        const record: Record<string, string | number | boolean> = {};
        const gender = this.determineGender(i, config.demographics.malePercentage, config.demographics.femalePercentage);
        const countryCode = this.getCountryCode(config.location);
        let cachedFirstName: string | undefined;
        let cachedLastName: string | undefined;

        const getFirstName = () => {
          if (!cachedFirstName) {
            cachedFirstName = faker.person.firstName(gender === 'male' || gender === 'female' ? gender : undefined);
          }
          return cachedFirstName;
        };

        const getLastName = () => {
          if (!cachedLastName) {
            cachedLastName = faker.person.lastName();
          }
          return cachedLastName;
        };

        for (const field of config.fields) {
          let value: string | number | boolean;
          if (field.type === 'firstName') {
            value = getFirstName();
          } else if (field.type === 'lastName') {
            value = getLastName();
          } else if (field.type === 'fullName') {
            value = `${getFirstName()} ${getLastName()}`;
          } else {
            value = this.generateFieldValue(field, gender, config.location, config.demographics.ageConfig, i, countryCode);
          }

          const dateTypes = ['createdAt', 'updatedAt', 'registrationDate', 'unixTimestamp', 'isoDate'];
          if (field.unique && field.type !== 'boolean' && !dateTypes.includes(field.type)) {
            value = this.ensureUnique(field.name, String(value), field, gender, config.location, config.demographics.ageConfig, i, countryCode);
          }

          record[field.name] = value;
        }

        records.push(record);
      }
    } catch (error) {
      if (error instanceof DummyForgeError) {
        throw error;
      }
      if (error instanceof Error) {
        throw createError('DF-GEN-005', error.message, { originalError: error });
      }
      throw createError('DF-GEN-005', 'Unknown error');
    }

    return records;
  }

  private determineGender(index: number, malePercentage: number, femalePercentage: number): Gender {
    const total = malePercentage + femalePercentage;
    const roll = (index * 7) % 100;

    if (roll < malePercentage) return 'male';
    if (roll < total) return 'female';
    return genderOptions[(index + 3) % genderOptions.length];
  }

  private generateFieldValue(
    field: FieldConfig,
    gender: Gender,
    location: LocationConfig,
    ageConfig: AgeConfig,
    index: number,
    countryCode: string
  ): string | number | boolean {
    switch (field.type) {
      case 'firstName':
        return faker.person.firstName(gender === 'male' || gender === 'female' ? gender : undefined);
      case 'lastName':
        return faker.person.lastName();
      case 'fullName':
        return `${faker.person.firstName(gender === 'male' || gender === 'female' ? gender : undefined)} ${faker.person.lastName()}`;
      case 'gender':
        return gender;
      case 'age':
        return this.generateAge(ageConfig);
      case 'dateOfBirth':
        return this.generateDateOfBirth(ageConfig);
      case 'email':
        return this.generateEmail(gender);
      case 'phone':
      case 'mobilePhone':
      case 'landline':
        return this.generatePhone(countryCode);
      case 'country':
        return this.getCountryName(countryCode);
      case 'city':
        return this.getLocationParts(countryCode).city ?? faker.location.city();
      case 'state':
        return this.getLocationParts(countryCode).state ?? faker.location.state();
      case 'address':
        return this.generateAddress(countryCode);
      case 'streetAddress':
        return this.generateStreetAddress(countryCode);
      case 'postalCode':
        return faker.location.zipCode();
      case 'latitude':
        return Number(faker.location.latitude());
      case 'longitude':
        return Number(faker.location.longitude());
      case 'studentID':
        return `STU-${this.autoIncrement('studentID', 1000, 1)}`;
      case 'employeeID':
        return `EMP-${this.autoIncrement('employeeID', 5000, 1)}`;
      case 'uuid':
        return faker.string.uuid();
      case 'username':
        return faker.internet.userName({ firstName: faker.person.firstName(), lastName: faker.person.lastName() });
      case 'createdAt':
        return new Date().toISOString();
      case 'updatedAt':
        return new Date().toISOString();
      case 'registrationDate':
        return format(faker.date.past(), 'yyyy-MM-dd');
      case 'creditCard':
        return faker.finance.creditCardNumber();
      case 'iban':
        return faker.finance.iban();
      case 'currency':
        return faker.finance.currencyCode();
      case 'randomString':
        return this.randomString(field, false, false);
      case 'randomNumeric':
        return this.randomString(field, true, false);
      case 'randomAlphanumeric':
        return this.randomString(field, false, true);
      case 'autoIncrement':
        return this.autoIncrement(field.name, field.config?.start ?? 1, 1);
      case 'autoIncrementCustom':
        return this.autoIncrement(field.name, field.config?.start ?? 1, field.config?.step ?? 1);
      case 'unixTimestamp':
        return Math.floor(Date.now() / 1000) + index;
      case 'isoDate':
        return format(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX");
      case 'boolean':
        return this.booleanWithPercentage(field.config?.booleanTruePercentage);
      case 'customPattern':
        return this.patternValue(field.config?.pattern ?? 'XXX-####-XXX');
      default:
        return '';
    }
  }

  private generatePhone(countryCode: string): string {
    const rule = phoneRules[countryCode];
    const dialCode = getDialCode(countryCode);
    const national = rule
      ? faker.string.numeric(faker.number.int({ min: rule.minLength, max: rule.maxLength }))
      : faker.string.numeric({ length: { min: 8, max: 10 } });

    return `+${dialCode} ${national}`;
  }

  private generateEmail(gender: Gender): string {
    const first = faker.person.firstName(gender === 'male' || gender === 'female' ? gender : undefined).toLowerCase();
    const last = faker.person.lastName().toLowerCase();
    const number = faker.number.int({ min: 1, max: 9999 });
    const domain = faker.internet.domainName();
    return `${first}.${last}.${number}@${domain}`;
  }

  private generateAge(ageConfig: AgeConfig): number {
    switch (ageConfig.mode) {
      case 'between':
        return faker.number.int({ min: ageConfig.min, max: ageConfig.max });
      case 'under':
        return faker.number.int({ min: 1, max: ageConfig.max });
      case 'above':
        return faker.number.int({ min: ageConfig.min, max: ageConfig.min + 50 });
      case 'exact':
        return ageConfig.value;
    }
  }

  private generateDateOfBirth(ageConfig: AgeConfig): string {
    const age = this.generateAge(ageConfig);
    return subYears(new Date(), age).toISOString().split('T')[0];
  }

  private getCountryCode(location: LocationConfig): string {
    if (location.mode === 'single' && location.singleCountry && supportedCountryCodeSet.has(location.singleCountry)) {
      return location.singleCountry;
    }

    if (location.mode === 'specific' && location.countries && location.countries.length > 0) {
      const validCountries = location.countries.filter((country) => supportedCountryCodeSet.has(country));
      if (validCountries.length > 0) {
        return validCountries[faker.number.int({ min: 0, max: validCountries.length - 1 })];
      }
    }

    return supportedCountryCodes[faker.number.int({ min: 0, max: supportedCountryCodes.length - 1 })];
  }

  private getCountryName(countryCode: string): string {
    return countries.find((c) => c.code === countryCode)?.name ?? countryCode;
  }

  private getLocationParts(countryCode: string): { state?: string; city?: string; village?: string } {
    const locationEntry = getCountryLocationEntry(countryCode);
    if (!locationEntry) {
      return {};
    }

    return {
      state: this.pickRandom(locationEntry.states),
      city: this.pickRandom(locationEntry.cities),
      village: this.pickRandom(locationEntry.villages)
    };
  }

  private generateStreetAddress(countryCode: string): string {
    const locationParts = this.getLocationParts(countryCode);
    const houseNumber = this.generateAddressNumber();
    const village = locationParts.village ?? this.generateFallbackVillage();
    return `${houseNumber}, ${village}`;
  }

  private generateAddress(countryCode: string): string {
    const locationParts = this.getLocationParts(countryCode);
    const country = this.getCountryName(countryCode);
    const houseNumber = this.generateAddressNumber();
    const locality = this.selectSingleLocality(locationParts);
    return `${houseNumber}, ${locality}, ${country}`;
  }

  private selectSingleLocality(locationParts: { state?: string; city?: string; village?: string }): string {
    const available: string[] = [];
    if (locationParts.village) available.push(locationParts.village);
    if (locationParts.city) available.push(locationParts.city);
    if (locationParts.state) available.push(locationParts.state);

    if (available.length > 0) {
      return available[faker.number.int({ min: 0, max: available.length - 1 })];
    }

    return faker.location.city();
  }

  private pickRandom(values: string[]): string | undefined {
    if (values.length === 0) {
      return undefined;
    }

    return values[faker.number.int({ min: 0, max: values.length - 1 })];
  }

  private generateAddressNumber(): string {
    const digits = faker.number.int({ min: 1, max: 999 }).toString();
    const withPrefix = faker.datatype.boolean() ? `${faker.string.alpha({ length: 1, casing: 'upper' })}${digits}` : digits;
    const withSuffix = faker.datatype.boolean() ? `${withPrefix}/${faker.number.int({ min: 1, max: 9 })}` : withPrefix;
    return withSuffix;
  }

  private generateFallbackVillage(): string {
    return `${faker.location.city()} Village`;
  }

  private ensureUnique(
    fieldName: string,
    value: string,
    field: FieldConfig,
    gender: Gender,
    location: LocationConfig,
    ageConfig: AgeConfig,
    index: number,
    countryCode: string
  ): string {
    if (!this.uniqueTrackers.has(fieldName)) {
      this.uniqueTrackers.set(fieldName, new Set());
    }

    const tracker = this.uniqueTrackers.get(fieldName)!;
    let attempts = 0;
    let uniqueValue = value;

    while (tracker.has(uniqueValue) && attempts < 100) {
      uniqueValue = String(this.generateFieldValue(field, gender, location, ageConfig, index, countryCode));
      attempts += 1;
    }

    if (attempts >= 100) {
      throw createError('DF-GEN-001', `Failed to generate unique value for ${fieldName}`, {
        fieldName,
        fieldType: field.type
      });
    }

    tracker.add(uniqueValue);
    return uniqueValue;
  }

  private autoIncrement(key: string, start: number, step: number): number {
    const current = this.counters.get(key) ?? start;
    this.counters.set(key, current + step);
    return current;
  }

  private randomString(field: FieldConfig, numericOnly: boolean, alphanumeric: boolean): string {
    const min = field.config?.lengthMin ?? 5;
    const max = field.config?.lengthMax ?? 12;
    const length = faker.number.int({ min, max });
    const base = numericOnly
      ? faker.string.numeric(length)
      : alphanumeric
      ? faker.string.alphanumeric(length)
      : faker.string.alpha(length);

    const prefix = field.config?.prefix ?? '';
    const suffix = field.config?.suffix ?? '';
    return `${prefix}${base}${suffix}`;
  }

  private patternValue(pattern: string): string {
    return pattern
      .replace(/X/g, () => faker.string.alpha({ length: 1, casing: 'upper' }))
      .replace(/#/g, () => faker.string.numeric(1));
  }

  private booleanWithPercentage(percentage = 50): boolean {
    const clamped = Math.min(100, Math.max(0, percentage));
    return faker.number.int({ min: 1, max: 100 }) <= clamped;
  }
}
