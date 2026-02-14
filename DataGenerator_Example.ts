// DataGenerator.ts - Complete Implementation Example
// Place this in: src/lib/generators/DataGenerator.ts

import { faker } from '@faker-js/faker';
import { parsePhoneNumber } from 'libphonenumber-js';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type Gender = 'male' | 'female' | 'other';
export type AgeMode = 'between' | 'under' | 'above' | 'exact';
export type LocationMode = 'random' | 'specific' | 'single';

export interface AgeConfig {
  mode: AgeMode;
  min?: number;
  max?: number;
  exact?: number;
}

export interface LocationConfig {
  mode: LocationMode;
  countries?: string[]; // ISO country codes
  singleCountry?: string;
}

export interface DemographicsConfig {
  malePercentage: number;
  femalePercentage: number;
  otherPercentage?: number;
  ageConfig: AgeConfig;
}

export type FieldType =
  | 'firstName'
  | 'lastName'
  | 'fullName'
  | 'gender'
  | 'age'
  | 'dateOfBirth'
  | 'email'
  | 'phone'
  | 'mobilePhone'
  | 'country'
  | 'city'
  | 'state'
  | 'address'
  | 'streetAddress'
  | 'postalCode'
  | 'latitude'
  | 'longitude'
  | 'studentID'
  | 'employeeID'
  | 'uuid'
  | 'username'
  | 'createdAt'
  | 'updatedAt'
  | 'randomString'
  | 'randomNumeric'
  | 'randomAlphanumeric'
  | 'autoIncrement'
  | 'unixTimestamp'
  | 'isoDate'
  | 'boolean'
  | 'customPattern';

export interface CustomFieldConfig {
  length?: number;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  start?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  pattern?: string; // e.g., "XXX-###-XXX" where X=letter, #=number
  format?: 'iso' | 'us' | 'eu';
}

export interface FieldConfig {
  name: string;
  type: FieldType;
  unique: boolean;
  config?: CustomFieldConfig;
}

export interface GenerationConfig {
  fields: FieldConfig[];
  count: number;
  demographics: DemographicsConfig;
  location: LocationConfig;
}

// ============================================================================
// COUNTRY DATA (Top 50 countries for realistic data)
// ============================================================================

export const COUNTRIES = {
  US: { name: 'United States', code: 'US', locale: 'en_US' },
  CA: { name: 'Canada', code: 'CA', locale: 'en_CA' },
  GB: { name: 'United Kingdom', code: 'GB', locale: 'en_GB' },
  AU: { name: 'Australia', code: 'AU', locale: 'en_AU' },
  DE: { name: 'Germany', code: 'DE', locale: 'de' },
  FR: { name: 'France', code: 'FR', locale: 'fr' },
  IT: { name: 'Italy', code: 'IT', locale: 'it' },
  ES: { name: 'Spain', code: 'ES', locale: 'es' },
  MX: { name: 'Mexico', code: 'MX', locale: 'es_MX' },
  BR: { name: 'Brazil', code: 'BR', locale: 'pt_BR' },
  JP: { name: 'Japan', code: 'JP', locale: 'ja' },
  IN: { name: 'India', code: 'IN', locale: 'en_IN' },
  CN: { name: 'China', code: 'CN', locale: 'zh_CN' },
  KR: { name: 'South Korea', code: 'KR', locale: 'ko' },
  NL: { name: 'Netherlands', code: 'NL', locale: 'nl' },
  SE: { name: 'Sweden', code: 'SE', locale: 'sv' },
  NO: { name: 'Norway', code: 'NO', locale: 'nb_NO' },
  FI: { name: 'Finland', code: 'FI', locale: 'fi' },
  DK: { name: 'Denmark', code: 'DK', locale: 'da' },
  PL: { name: 'Poland', code: 'PL', locale: 'pl' },
  ZA: { name: 'South Africa', code: 'ZA', locale: 'en_ZA' },
  NZ: { name: 'New Zealand', code: 'NZ', locale: 'en_NZ' },
  CH: { name: 'Switzerland', code: 'CH', locale: 'de_CH' },
  AT: { name: 'Austria', code: 'AT', locale: 'de_AT' },
  BE: { name: 'Belgium', code: 'BE', locale: 'nl_BE' },
};

// ============================================================================
// MAIN DATA GENERATOR CLASS
// ============================================================================

export class DataGenerator {
  private uniqueTrackers: Map<string, Set<any>>;
  private autoIncrementCounters: Map<string, number>;
  private currentIndex: number;

  constructor() {
    this.uniqueTrackers = new Map();
    this.autoIncrementCounters = new Map();
    this.currentIndex = 0;
  }

  /**
   * Main method to generate records
   */
  public generateRecords(config: GenerationConfig): Record<string, any>[] {
    this.resetTrackers();
    const records: Record<string, any>[] = [];

    for (let i = 0; i < config.count; i++) {
      this.currentIndex = i;
      const gender = this.determineGender(i, config.demographics);
      const country = this.getCountry(config.location);
      const age = this.generateAge(config.demographics.ageConfig);

      const record: Record<string, any> = {};

      config.fields.forEach((field) => {
        let value = this.generateFieldValue(field, gender, country, age, config);

        // Handle uniqueness
        if (field.unique) {
          value = this.ensureUnique(field.name, value, field, gender, country, age, config);
        }

        record[field.name] = value;
      });

      records.push(record);
    }

    return records;
  }

  /**
   * Reset all trackers for a new generation session
   */
  private resetTrackers(): void {
    this.uniqueTrackers.clear();
    this.autoIncrementCounters.clear();
    this.currentIndex = 0;
  }

  /**
   * Determine gender based on demographics config and index
   */
  private determineGender(index: number, demographics: DemographicsConfig): Gender {
    const rand = Math.random() * 100;
    
    if (rand < demographics.malePercentage) {
      return 'male';
    } else if (rand < demographics.malePercentage + demographics.femalePercentage) {
      return 'female';
    } else {
      return 'other';
    }
  }

  /**
   * Get country based on location config
   */
  private getCountry(location: LocationConfig): string {
    switch (location.mode) {
      case 'single':
        return location.singleCountry || 'US';
      
      case 'specific':
        if (!location.countries || location.countries.length === 0) {
          return 'US';
        }
        return location.countries[Math.floor(Math.random() * location.countries.length)];
      
      case 'random':
      default:
        const countryKeys = Object.keys(COUNTRIES);
        return countryKeys[Math.floor(Math.random() * countryKeys.length)];
    }
  }

  /**
   * Generate age based on config
   */
  private generateAge(config: AgeConfig): number {
    switch (config.mode) {
      case 'between':
        const min = config.min || 18;
        const max = config.max || 65;
        return faker.number.int({ min, max });
      
      case 'under':
        return faker.number.int({ min: 1, max: (config.max || 18) - 1 });
      
      case 'above':
        return faker.number.int({ min: (config.min || 65) + 1, max: 100 });
      
      case 'exact':
        return config.exact || 25;
      
      default:
        return faker.number.int({ min: 18, max: 65 });
    }
  }

  /**
   * Generate value for a specific field
   */
  private generateFieldValue(
    field: FieldConfig,
    gender: Gender,
    country: string,
    age: number,
    config: GenerationConfig
  ): any {
    const countryData = COUNTRIES[country as keyof typeof COUNTRIES];
    
    // Set locale for faker if available
    if (countryData?.locale) {
      faker.setLocale(countryData.locale);
    }

    switch (field.type) {
      // ========== PERSONAL DATA ==========
      case 'firstName': {
        const sex = gender === 'other' ? undefined : (gender as 'male' | 'female');
        return faker.person.firstName(sex);
      }

      case 'lastName':
        return faker.person.lastName();

      case 'fullName': {
        const sex = gender === 'other' ? undefined : (gender as 'male' | 'female');
        return faker.person.fullName({ sex });
      }

      case 'gender':
        return gender.charAt(0).toUpperCase() + gender.slice(1);

      case 'age':
        return age;

      case 'dateOfBirth': {
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - age;
        return faker.date.birthdate({ min: age, max: age, mode: 'age' });
      }

      // ========== CONTACT DATA ==========
      case 'email': {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const num = faker.number.int({ min: 1, max: 99999 });
        return `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${num}@email.com`;
      }

      case 'phone':
      case 'mobilePhone':
        return this.generatePhone(country, field.type === 'mobilePhone');

      // ========== LOCATION DATA ==========
      case 'country':
        return countryData?.name || country;

      case 'city':
        return faker.location.city();

      case 'state':
        return faker.location.state();

      case 'address':
        return faker.location.streetAddress({ useFullAddress: true });

      case 'streetAddress':
        return faker.location.streetAddress();

      case 'postalCode':
        return this.generatePostalCode(country);

      case 'latitude':
        return faker.location.latitude();

      case 'longitude':
        return faker.location.longitude();

      // ========== IDENTIFIERS ==========
      case 'studentID':
      case 'employeeID': {
        const prefix = field.config?.prefix || '';
        const suffix = field.config?.suffix || '';
        const num = this.getAutoIncrement(field.name, field.config);
        return `${prefix}${num}${suffix}`;
      }

      case 'uuid':
        return uuidv4();

      case 'username': {
        const firstName = faker.person.firstName().toLowerCase();
        const num = faker.number.int({ min: 1, max: 9999 });
        return `${firstName}${num}`;
      }

      // ========== TEMPORAL DATA ==========
      case 'createdAt':
      case 'updatedAt':
        return new Date().toISOString();

      case 'unixTimestamp':
        return Math.floor(Date.now() / 1000);

      case 'isoDate':
        return faker.date.recent().toISOString().split('T')[0];

      // ========== CUSTOM FIELD TYPES ==========
      case 'randomString': {
        const length = this.getRandomLength(field.config);
        return faker.string.alpha(length);
      }

      case 'randomNumeric': {
        const length = this.getRandomLength(field.config);
        return faker.string.numeric(length);
      }

      case 'randomAlphanumeric': {
        const length = this.getRandomLength(field.config);
        return faker.string.alphanumeric(length);
      }

      case 'autoIncrement': {
        return this.getAutoIncrement(field.name, field.config);
      }

      case 'boolean':
        return faker.datatype.boolean();

      case 'customPattern': {
        if (!field.config?.pattern) return '';
        return this.generateFromPattern(field.config.pattern);
      }

      default:
        console.warn(`Unknown field type: ${field.type}`);
        return null;
    }
  }

  /**
   * Generate phone number with country code
   */
  private generatePhone(countryCode: string, mobile: boolean = false): string {
    try {
      // Use faker to generate a phone number
      const phoneNumber = mobile ? faker.phone.number() : faker.phone.number();
      
      // Try to parse and format with country code
      try {
        const parsed = parsePhoneNumber(phoneNumber, countryCode as any);
        return parsed.formatInternational();
      } catch {
        // If parsing fails, return faker number with country prefix
        const countryCallingCode = this.getCountryCallingCode(countryCode);
        return `${countryCallingCode} ${phoneNumber}`;
      }
    } catch (error) {
      return faker.phone.number();
    }
  }

  /**
   * Get country calling code
   */
  private getCountryCallingCode(countryCode: string): string {
    const codes: Record<string, string> = {
      US: '+1', CA: '+1', GB: '+44', AU: '+61', DE: '+49',
      FR: '+33', IT: '+39', ES: '+34', MX: '+52', BR: '+55',
      JP: '+81', IN: '+91', CN: '+86', KR: '+82', NL: '+31',
      SE: '+46', NO: '+47', FI: '+358', DK: '+45', PL: '+48',
      ZA: '+27', NZ: '+64', CH: '+41', AT: '+43', BE: '+32',
    };
    return codes[countryCode] || '+1';
  }

  /**
   * Generate country-specific postal code
   */
  private generatePostalCode(countryCode: string): string {
    switch (countryCode) {
      case 'US':
        return faker.location.zipCode();
      
      case 'CA':
        // Canadian format: A1A 1A1
        return `${faker.string.alpha(1).toUpperCase()}${faker.number.int({ min: 0, max: 9 })}${faker.string.alpha(1).toUpperCase()} ${faker.number.int({ min: 0, max: 9 })}${faker.string.alpha(1).toUpperCase()}${faker.number.int({ min: 0, max: 9 })}`;
      
      case 'GB':
        // UK format: AA1 1AA
        return `${faker.string.alpha(2).toUpperCase()}${faker.number.int({ min: 1, max: 9 })} ${faker.number.int({ min: 1, max: 9 })}${faker.string.alpha(2).toUpperCase()}`;
      
      case 'DE':
      case 'FR':
      case 'IT':
      case 'ES':
        // European 5-digit format
        return faker.string.numeric(5);
      
      default:
        return faker.location.zipCode();
    }
  }

  /**
   * Get random length from config
   */
  private getRandomLength(config?: CustomFieldConfig): number {
    if (config?.length) return config.length;
    
    const min = config?.minLength || 5;
    const max = config?.maxLength || 15;
    return faker.number.int({ min, max });
  }

  /**
   * Get auto-increment value
   */
  private getAutoIncrement(fieldName: string, config?: CustomFieldConfig): number {
    if (!this.autoIncrementCounters.has(fieldName)) {
      const start = config?.start || 1;
      this.autoIncrementCounters.set(fieldName, start);
      return start;
    }

    const current = this.autoIncrementCounters.get(fieldName)!;
    const step = config?.step || 1;
    const next = current + step;
    this.autoIncrementCounters.set(fieldName, next);
    return current;
  }

  /**
   * Generate value from pattern
   * Pattern: X = letter, # = number
   * Example: "XXX-###-XXX" -> "ABC-123-DEF"
   */
  private generateFromPattern(pattern: string): string {
    return pattern.replace(/[X#]/g, (char) => {
      if (char === 'X') {
        return faker.string.alpha(1).toUpperCase();
      } else if (char === '#') {
        return faker.number.int({ min: 0, max: 9 }).toString();
      }
      return char;
    });
  }

  /**
   * Ensure uniqueness for a field value
   */
  private ensureUnique(
    fieldName: string,
    value: any,
    field: FieldConfig,
    gender: Gender,
    country: string,
    age: number,
    config: GenerationConfig
  ): any {
    if (!this.uniqueTrackers.has(fieldName)) {
      this.uniqueTrackers.set(fieldName, new Set());
    }

    const tracker = this.uniqueTrackers.get(fieldName)!;
    let attempts = 0;
    let uniqueValue = value;
    const maxAttempts = 1000;

    while (tracker.has(uniqueValue) && attempts < maxAttempts) {
      uniqueValue = this.generateFieldValue(field, gender, country, age, config);
      attempts++;
    }

    if (attempts >= maxAttempts) {
      // Fallback: append random suffix to ensure uniqueness
      const suffix = faker.string.alphanumeric(8);
      uniqueValue = `${value}_${suffix}`;
      
      // If still not unique (very unlikely), use UUID
      if (tracker.has(uniqueValue)) {
        uniqueValue = `${value}_${uuidv4()}`;
      }
    }

    tracker.add(uniqueValue);
    return uniqueValue;
  }
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/*
const generator = new DataGenerator();

const config: GenerationConfig = {
  fields: [
    { name: 'firstName', type: 'firstName', unique: false },
    { name: 'lastName', type: 'lastName', unique: false },
    { name: 'email', type: 'email', unique: true },
    { name: 'phone', type: 'phone', unique: false },
    { name: 'country', type: 'country', unique: false },
    { name: 'age', type: 'age', unique: false },
    { name: 'studentID', type: 'autoIncrement', unique: true, config: { prefix: 'STU', start: 1000 } },
  ],
  count: 1000,
  demographics: {
    malePercentage: 50,
    femalePercentage: 50,
    ageConfig: {
      mode: 'between',
      min: 18,
      max: 65,
    },
  },
  location: {
    mode: 'specific',
    countries: ['US', 'CA', 'GB'],
  },
};

const data = generator.generateRecords(config);
console.log(data);
*/
