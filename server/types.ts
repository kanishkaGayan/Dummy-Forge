export type Gender = 'male' | 'female' | 'other' | 'non-binary';

export type LocationMode = 'random' | 'specific' | 'single';

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
  | 'landline'
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
  | 'registrationDate'
  | 'creditCard'
  | 'iban'
  | 'currency'
  | 'randomString'
  | 'randomNumeric'
  | 'randomAlphanumeric'
  | 'autoIncrement'
  | 'autoIncrementCustom'
  | 'unixTimestamp'
  | 'isoDate'
  | 'boolean'
  | 'customPattern';

export type AgeConfig =
  | { mode: 'between'; min: number; max: number }
  | { mode: 'under'; max: number }
  | { mode: 'above'; min: number }
  | { mode: 'exact'; value: number };

export interface FieldConfig {
  name: string;
  type: FieldType;
  unique: boolean;
  config?: {
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
  };
}

export interface DemographicsConfig {
  malePercentage: number;
  femalePercentage: number;
  ageConfig: AgeConfig;
}

export interface LocationConfig {
  mode: LocationMode;
  countries?: string[];
  singleCountry?: string;
}

export interface GenerationConfig {
  fields: FieldConfig[];
  count: number;
  demographics: DemographicsConfig;
  location: LocationConfig;
}
