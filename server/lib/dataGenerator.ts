import { faker } from '@faker-js/faker';
import { getCountryCallingCode } from 'libphonenumber-js';
import { format, subYears } from 'date-fns';
import { countries } from '../utils/countryData';
import { phoneRules } from '../utils/phoneRules';
import { AgeConfig, FieldConfig, Gender, GenerationConfig, LocationConfig } from '../types';

const genderOptions: Gender[] = ['male', 'female', 'other', 'non-binary'];

export class DataGenerator {
  private uniqueTrackers = new Map<string, Set<string>>();
  private counters = new Map<string, number>();

  generateRecords(config: GenerationConfig): Record<string, string | number | boolean>[] {
    const records: Record<string, string | number | boolean>[] = [];

    for (let i = 0; i < config.count; i += 1) {
      const record: Record<string, string | number | boolean> = {};
      const gender = this.determineGender(i, config.demographics.malePercentage, config.demographics.femalePercentage);
      const countryCode = this.getCountryCode(config.location);

      for (const field of config.fields) {
        let value = this.generateFieldValue(field, gender, config.location, config.demographics.ageConfig, i, countryCode);

        const dateTypes = ['createdAt', 'updatedAt', 'registrationDate', 'unixTimestamp', 'isoDate'];
        if (field.unique && field.type !== 'boolean' && !dateTypes.includes(field.type)) {
          value = this.ensureUnique(field.name, String(value), field, gender, config.location, config.demographics.ageConfig, i, countryCode);
        }

        record[field.name] = value;
      }

      records.push(record);
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
        return faker.location.city();
      case 'state':
        return faker.location.state();
      case 'address':
        return `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()}, ${this.getCountryName(countryCode)}`;
      case 'streetAddress':
        return faker.location.streetAddress();
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
    if (rule) {
      const length = faker.number.int({ min: rule.minLength, max: rule.maxLength });
      const national = faker.string.numeric(length);
      return `+${rule.dialCode} ${national}`;
    }

    try {
      const callingCode = getCountryCallingCode(countryCode as never);
      const national = faker.string.numeric({ length: { min: 8, max: 10 } });
      return `+${callingCode} ${national}`;
    } catch {
      return faker.phone.number();
    }
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
    if (location.mode === 'single' && location.singleCountry) return location.singleCountry;
    if (location.mode === 'specific' && location.countries && location.countries.length > 0) {
      return location.countries[faker.number.int({ min: 0, max: location.countries.length - 1 })];
    }
    return faker.location.countryCode();
  }

  private getCountryName(countryCode: string): string {
    return countries.find((c) => c.code === countryCode)?.name ?? countryCode;
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
      uniqueValue = `${value}_${faker.string.alphanumeric(6)}`;
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
