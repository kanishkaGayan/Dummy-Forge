import countriesSql from '../../../countries_data_expanded.sql?raw';
import { countries } from './countryData';

interface ParsedCountry {
  countryId: number;
  countryName: string;
}

export interface CountryLocationEntry {
  countryId: number;
  countryCode: string;
  countryName: string;
  states: string[];
  cities: string[];
  villages: string[];
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const decodeSqlString = (value: string) => value.replace(/''/g, "'");

const countryAliases = new Map<string, string>([
  ['czechrepublic', 'CZ'],
  ['ivorycoast', 'CI'],
  ['cotedivoire', 'CI'],
  ['curacao', 'CW'],
  ['southkorea', 'KR'],
  ['northkorea', 'KP'],
  ['usa', 'US'],
  ['unitedstatesofamerica', 'US']
]);

const codeByNormalizedName = new Map<string, string>(
  countries.map((country) => [normalize(country.name), country.code])
);

const countriesById = new Map<number, ParsedCountry>();
const statesByCountryId = new Map<number, string[]>();
const citiesByCountryId = new Map<number, string[]>();
const villagesByCountryId = new Map<number, string[]>();

const countryRegex = /INSERT INTO Countries VALUES \((\d+),\s*'((?:''|[^'])*)'\);/g;
const regionRegex = /INSERT INTO (States|Cities|Villages) VALUES \((\d+),\s*(\d+),\s*'((?:''|[^'])*)'\);/g;

for (const match of countriesSql.matchAll(countryRegex)) {
  const countryId = Number(match[1]);
  const countryName = decodeSqlString(match[2]);
  countriesById.set(countryId, { countryId, countryName });
}

for (const match of countriesSql.matchAll(regionRegex)) {
  const tableName = match[1];
  const countryId = Number(match[3]);
  const regionName = decodeSqlString(match[4]);

  const targetMap =
    tableName === 'States' ? statesByCountryId : tableName === 'Cities' ? citiesByCountryId : villagesByCountryId;

  const current = targetMap.get(countryId) ?? [];
  current.push(regionName);
  targetMap.set(countryId, current);
}

const entries: CountryLocationEntry[] = [];

for (const parsedCountry of countriesById.values()) {
  const normalizedName = normalize(parsedCountry.countryName);
  const countryCode =
    codeByNormalizedName.get(normalizedName) ?? countryAliases.get(normalizedName);

  if (!countryCode) {
    continue;
  }

  entries.push({
    countryId: parsedCountry.countryId,
    countryCode,
    countryName: parsedCountry.countryName,
    states: statesByCountryId.get(parsedCountry.countryId) ?? [],
    cities: citiesByCountryId.get(parsedCountry.countryId) ?? [],
    villages: villagesByCountryId.get(parsedCountry.countryId) ?? []
  });
}

const locationByCode = new Map<string, CountryLocationEntry>(
  entries.map((entry) => [entry.countryCode, entry])
);

export const getCountryLocationEntry = (countryCode: string): CountryLocationEntry | undefined =>
  locationByCode.get(countryCode.toUpperCase());
