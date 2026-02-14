# DataForge - Complete Development Specification

## Project Overview
Build a cross-platform Electron desktop application for generating realistic dummy/mock data for educational and development purposes. The app allows users to configure data schemas, generate large datasets (up to 10,000 records), and export in multiple formats.

---

## Tech Stack

### Frontend
- **Electron** (v28+) - Desktop application framework
- **TypeScript** (v5+) - Type-safe development
- **React** (v18+) - UI framework
- **Tailwind CSS** (v3+) - Styling
- **shadcn/ui** - Component library (optional but recommended)
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend
- **Node.js** (v20+)
- **Express.js** (v4+) - API server
- **SQLite3** (better-sqlite3) - Local data storage
- **TypeScript** - Type safety

### Key Libraries
- **@faker-js/faker** (v8+) - Realistic data generation (100% accurate)
- **libphonenumber-js** - Phone number validation and formatting
- **jsPDF** & **jsPDF-AutoTable** - PDF export
- **papaparse** - CSV parsing/generation
- **uuid** - UUID generation
- **date-fns** - Date manipulation
- **electron-builder** - App packaging and distribution

---

## Application Architecture

```
dataforge/
├── electron/
│   ├── main.ts              # Electron main process
│   ├── preload.ts           # Preload script for IPC
│   └── menu.ts              # Application menu
├── src/
│   ├── components/
│   │   ├── FieldSelector.tsx
│   │   ├── CustomFieldForm.tsx
│   │   ├── CountrySelector.tsx
│   │   ├── DemographicsConfig.tsx
│   │   ├── ExportOptions.tsx
│   │   └── DataPreview.tsx
│   ├── lib/
│   │   ├── generators/
│   │   │   ├── personalData.ts
│   │   │   ├── contactData.ts
│   │   │   ├── locationData.ts
│   │   │   └── customData.ts
│   │   ├── exporters/
│   │   │   ├── pdfExporter.ts
│   │   │   ├── csvExporter.ts
│   │   │   ├── txtExporter.ts
│   │   │   └── sqlExporter.ts
│   │   └── utils/
│   │       ├── validation.ts
│   │       └── countryData.ts
│   ├── types/
│   │   ├── schema.ts
│   │   └── exports.ts
│   ├── App.tsx
│   └── main.tsx
├── server/
│   ├── index.ts             # Express server
│   ├── routes/
│   │   ├── generate.ts      # Data generation endpoints
│   │   └── export.ts        # Export endpoints
│   └── database/
│       └── init.ts          # SQLite initialization
└── package.json
```

---

## Data Schema Requirements

### 1. Predefined Fields (Checkboxes)

**Personal Information:**
- `firstName` - Gender-aware (uses @faker-js/faker)
  - Checkbox: "Unique" (ensures no duplicates)
- `lastName`
  - Checkbox: "Unique"
- `fullName` - Combines first + last
- `gender` - Male/Female/Other/Non-binary
- `age` - Configurable ranges
- `dateOfBirth` - Calculated from age

**Contact Information:**
- `email` - Format: firstname.lastname.number@domain.com
  - Checkbox: "Unique" (MUST be checked by default)
- `phone` - Country-code aware
  - Checkbox: "Unique"
- `mobilePhone` - Cell phone numbers
- `landline` - Home/office numbers

**Location Data:**
- `country` - ISO codes + full names
- `city` - Country-appropriate cities
- `state` / `province` - Based on country
- `address` - Full street address
- `streetAddress` - Street name + number
- `postalCode` / `zipCode` - Country format-aware
- `latitude` / `longitude` - Geographic coordinates

**Identifiers:**
- `studentID` - Auto-increment or custom format
- `employeeID` - Custom format
- `uuid` - RFC4122 UUID v4
- `username` - Based on name + numbers

**Temporal:**
- `createdAt` - Unix timestamp or ISO date
- `updatedAt` - Unix timestamp or ISO date
- `registrationDate` - Date in various formats

**Financial (Optional):**
- `creditCard` - Fake but valid Luhn algorithm
- `iban` - International bank account
- `currency` - ISO currency codes

### 2. Custom Fields

Users can add unlimited custom fields with:

**Field Properties:**
- Field name (user input)
- Field type (dropdown):
  - `randomString` - Random alphabetic (A-Z, a-z)
  - `randomNumeric` - Random numbers
  - `randomAlphanumeric` - Mix of letters + numbers
  - `autoIncrement` - Start from 1, increment by 1
  - `autoIncrementCustom` - User defines start and step
  - `unixTimestamp` - Current or random range
  - `isoDate` - ISO 8601 format
  - `boolean` - True/False
  - `uuid` - Version 4 UUID
  - `customPattern` - User defines pattern (e.g., "XXX-####-XXX")
  
**Field Configuration:**
- Length (for strings): min/max
- Range (for numbers): min/max
- Format (for dates): ISO, US, EU, etc.
- Prefix/Suffix: Optional text before/after value
- **Checkbox: "Unique"** (enforces uniqueness)

---

## User Interface Requirements

### Main Window Layout

```
┌─────────────────────────────────────────────────────┐
│  DataForge                                    [_][□][×]│
├─────────────────────────────────────────────────────┤
│  Step 1: Select Data Fields                        │
│  ┌───────────────────────────────────────────────┐ │
│  │ Predefined Fields:                            │ │
│  │ □ First Name    □ Last Name    □ Email        │ │
│  │ □ Phone         □ Country      □ Address      │ │
│  │ □ Age           □ Gender       □ Date of Birth│ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Custom Fields:                                     │
│  [+ Add Custom Field]                               │
│                                                     │
│  Step 2: Configure Demographics                    │
│  ┌───────────────────────────────────────────────┐ │
│  │ Total Records: [____1000____] (0-10,000)      │ │
│  │                                                │ │
│  │ Gender Distribution:                           │ │
│  │ Male: [__50__]%  Female: [__50__]%            │ │
│  │                                                │ │
│  │ Age Configuration:                             │ │
│  │ ○ Between [18] and [65]                       │ │
│  │ ○ Under [__]    ○ Above [__]   ○ Exact [__]  │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Step 3: Country & Location Settings               │
│  ┌───────────────────────────────────────────────┐ │
│  │ ○ Random countries                             │ │
│  │ ○ Specific countries: [Select countries...]   │ │
│  │ ○ Single country: [United States ▼]           │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Step 4: Export Format                             │
│  ☑ SQL   ☑ CSV   ☑ TXT   ☑ PDF                    │
│                                                     │
│  [Generate Data]         [Preview (100 rows)]      │
└─────────────────────────────────────────────────────┘
```

### Custom Field Dialog

```
┌─────────────────────────────────────┐
│  Add Custom Field              [×]  │
├─────────────────────────────────────┤
│  Field Name:                        │
│  [____________________________]     │
│                                     │
│  Data Type:                         │
│  [Random String        ▼]           │
│                                     │
│  Configuration:                     │
│  Length: Min [5]  Max [15]          │
│                                     │
│  Prefix: [____] Suffix: [____]      │
│                                     │
│  ☑ Unique (no duplicates)           │
│                                     │
│  [Cancel]              [Add Field]  │
└─────────────────────────────────────┘
```

---

## Core Functionality Implementation

### 1. Data Generation Engine

```typescript
// src/lib/generators/dataGenerator.ts

import { faker } from '@faker-js/faker';
import { parsePhoneNumber } from 'libphonenumber-js';

interface GenerationConfig {
  fields: FieldConfig[];
  count: number;
  demographics: {
    malePercentage: number;
    femalePercentage: number;
    ageConfig: AgeConfig;
  };
  location: {
    mode: 'random' | 'specific' | 'single';
    countries?: string[];
    singleCountry?: string;
  };
}

interface FieldConfig {
  name: string;
  type: string;
  unique: boolean;
  config?: any;
}

class DataGenerator {
  private uniqueTrackers: Map<string, Set<any>>;
  
  constructor() {
    this.uniqueTrackers = new Map();
  }
  
  generateRecords(config: GenerationConfig): Record<string, any>[] {
    const records = [];
    
    for (let i = 0; i < config.count; i++) {
      const record: Record<string, any> = {};
      const gender = this.determineGender(i, config.demographics);
      
      config.fields.forEach(field => {
        let value = this.generateFieldValue(field, gender, config);
        
        // Handle uniqueness
        if (field.unique) {
          value = this.ensureUnique(field.name, value, field, gender, config);
        }
        
        record[field.name] = value;
      });
      
      records.push(record);
    }
    
    return records;
  }
  
  private generateFieldValue(
    field: FieldConfig, 
    gender: string, 
    config: GenerationConfig
  ): any {
    switch (field.type) {
      case 'firstName':
        return faker.person.firstName(gender.toLowerCase() as any);
      
      case 'lastName':
        return faker.person.lastName();
      
      case 'email':
        return faker.internet.email();
      
      case 'phone':
        const country = this.getCountry(config);
        return this.generatePhone(country);
      
      case 'address':
        return this.generateAddress(this.getCountry(config));
      
      case 'age':
        return this.generateAge(config.demographics.ageConfig);
      
      case 'autoIncrement':
        return field.config?.start || 1 + records.length;
      
      case 'randomString':
        return faker.string.alpha(field.config?.length || 10);
      
      case 'randomNumeric':
        return faker.string.numeric(field.config?.length || 10);
      
      case 'uuid':
        return faker.string.uuid();
      
      case 'unixTimestamp':
        return Math.floor(Date.now() / 1000);
      
      // Add more field types...
      
      default:
        return null;
    }
  }
  
  private generatePhone(country: string): string {
    const phoneNumber = faker.phone.number();
    try {
      const parsed = parsePhoneNumber(phoneNumber, country as any);
      return parsed.formatInternational();
    } catch {
      return phoneNumber;
    }
  }
  
  private ensureUnique(
    fieldName: string,
    value: any,
    field: FieldConfig,
    gender: string,
    config: GenerationConfig
  ): any {
    if (!this.uniqueTrackers.has(fieldName)) {
      this.uniqueTrackers.set(fieldName, new Set());
    }
    
    const tracker = this.uniqueTrackers.get(fieldName)!;
    let attempts = 0;
    let uniqueValue = value;
    
    while (tracker.has(uniqueValue) && attempts < 100) {
      uniqueValue = this.generateFieldValue(field, gender, config);
      attempts++;
    }
    
    if (attempts >= 100) {
      // Fallback: append random suffix
      uniqueValue = `${value}_${faker.string.alphanumeric(6)}`;
    }
    
    tracker.add(uniqueValue);
    return uniqueValue;
  }
}
```

### 2. Export Implementations

#### SQL Export
```typescript
// src/lib/exporters/sqlExporter.ts

export function exportToSQL(
  data: Record<string, any>[],
  tableName: string = 'GeneratedData'
): string {
  if (data.length === 0) return '';
  
  const columns = Object.keys(data[0]);
  let sql = `CREATE TABLE ${tableName} (\n`;
  
  // Generate column definitions
  columns.forEach((col, idx) => {
    const sampleValue = data[0][col];
    const dataType = typeof sampleValue === 'number' ? 'INT' : 'VARCHAR(255)';
    const comma = idx < columns.length - 1 ? ',' : '';
    sql += `    ${col} ${dataType}${comma}\n`;
  });
  
  sql += ');\n\n';
  sql += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES\n`;
  
  // Generate insert values
  data.forEach((record, idx) => {
    const values = columns.map(col => {
      const value = record[col];
      return typeof value === 'string' ? `'${value.replace(/'/g, "''")}'` : value;
    });
    
    const comma = idx < data.length - 1 ? ',' : ';';
    sql += `(${values.join(', ')})${comma}\n`;
  });
  
  return sql;
}
```

#### PDF Export
```typescript
// src/lib/exporters/pdfExporter.ts

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportToPDF(
  data: Record<string, any>[],
  filename: string = 'data.pdf'
): void {
  const doc = new jsPDF();
  
  const columns = Object.keys(data[0]);
  const rows = data.map(record => columns.map(col => record[col]));
  
  autoTable(doc, {
    head: [columns],
    body: rows,
    theme: 'grid',
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 8 }
  });
  
  doc.save(filename);
}
```

#### CSV Export
```typescript
// src/lib/exporters/csvExporter.ts

import Papa from 'papaparse';

export function exportToCSV(
  data: Record<string, any>[],
  filename: string = 'data.csv'
): void {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
```

---

## License & Legal Requirements

### License Agreement (MIT with Educational Use Clause)

```
MIT License with Educational Use Clause

Copyright (c) 2024 DataForge Contributors

EDUCATIONAL PURPOSE DISCLAIMER:
This software is designed exclusively for educational, testing, and development 
purposes. The data generated by this application is entirely fictional and 
randomly generated. 

IMPORTANT DISCLAIMERS:
1. NO REAL DATA: All generated data is synthetic and does not represent real 
   individuals, organizations, or entities.

2. NO LIABILITY: The developers, contributors, and distributors of this 
   software assume NO responsibility or liability for:
   - How the generated data is used
   - Any misuse of the generated data
   - Any damages arising from the use of this software
   - Any legal implications from improper use

3. USER RESPONSIBILITY: Users of this software acknowledge that they are 
   solely responsible for:
   - Compliance with applicable laws and regulations
   - Ethical use of generated data
   - Not using generated data to impersonate real individuals
   - Not using generated data for fraudulent purposes

4. GDPR & PRIVACY COMPLIANCE: Generated data should not be used in ways 
   that violate privacy laws. Users must ensure compliance with GDPR, CCPA, 
   and other data protection regulations.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### In-App License Display

Add a prominent license acceptance dialog on first launch:

```typescript
// First launch dialog
const LicenseAgreement: React.FC = () => {
  return (
    <Dialog>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Educational Use Agreement</DialogTitle>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto prose">
          <p className="font-bold text-red-600">
            IMPORTANT: This tool generates FICTIONAL data for educational purposes only.
          </p>
          <ul>
            <li>All data is randomly generated and does not represent real people</li>
            <li>You are responsible for using this data ethically and legally</li>
            <li>The developers assume NO liability for misuse</li>
            <li>Do not use for fraud, identity theft, or illegal purposes</li>
          </ul>
          {/* Full license text */}
        </div>
        <DialogFooter>
          <Button onClick={handleDecline}>Decline</Button>
          <Button onClick={handleAccept}>I Accept</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

---

## Package.json Dependencies

```json
{
  "name": "dataforge",
  "version": "1.0.0",
  "description": "Educational data generation tool",
  "main": "dist/electron/main.js",
  "scripts": {
    "dev": "concurrently \"vite\" \"electron .\"",
    "build": "tsc && vite build && electron-builder",
    "preview": "vite preview"
  },
  "dependencies": {
    "@faker-js/faker": "^8.4.0",
    "express": "^4.18.2",
    "better-sqlite3": "^9.2.2",
    "libphonenumber-js": "^1.10.51",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.2",
    "papaparse": "^5.4.1",
    "uuid": "^9.0.1",
    "date-fns": "^3.0.6",
    "zod": "^3.22.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.49.3"
  },
  "devDependencies": {
    "electron": "^28.1.0",
    "electron-builder": "^24.9.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.10",
    "@vitejs/plugin-react": "^4.2.1",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.33",
    "concurrently": "^8.2.2"
  }
}
```

---

## Implementation Phases

### Phase 1: Core Setup (Week 1)
- Initialize Electron + React + TypeScript project
- Set up Tailwind CSS and basic UI components
- Implement license agreement dialog
- Create main window layout

### Phase 2: Data Generation (Week 2)
- Implement @faker-js/faker integration
- Build field selector component
- Create custom field configuration
- Implement uniqueness tracking
- Add demographics configuration

### Phase 3: Location & Phone (Week 3)
- Country selection system
- Phone number generation with country codes
- Address generation based on country
- Postal code formatting

### Phase 4: Export System (Week 4)
- SQL export implementation
- CSV export implementation
- TXT export implementation
- PDF export with jsPDF

### Phase 5: Polish & Testing (Week 5)
- Error handling
- Performance optimization for 10,000 records
- Data preview functionality
- Packaging with electron-builder

---

## Key Technical Decisions

### Why @faker-js/faker?
- **100% maintained** - Active development
- **Comprehensive localization** - 70+ locales
- **Type-safe** - Full TypeScript support
- **Realistic data** - Real-world patterns
- **Performance** - Can generate 10K records in seconds

### Why better-sqlite3 over sqlite3?
- **Synchronous API** - Easier to use in Electron
- **7x faster** - Native C++ bindings
- **No callbacks** - Cleaner code

### Why Electron?
- **Cross-platform** - Windows, macOS, Linux
- **Native feel** - Desktop application experience
- **File system access** - Direct export capabilities
- **No browser limitations** - Large data handling

---

## Testing Strategy

### Unit Tests
```typescript
// Example test for uniqueness
describe('DataGenerator', () => {
  it('should generate unique emails when unique flag is set', () => {
    const generator = new DataGenerator();
    const data = generator.generateRecords({
      fields: [{ name: 'email', type: 'email', unique: true }],
      count: 1000,
      // ...
    });
    
    const emails = data.map(r => r.email);
    const uniqueEmails = new Set(emails);
    expect(uniqueEmails.size).toBe(1000);
  });
});
```

---

## Additional Features to Consider

1. **Template System** - Save/load field configurations
2. **Batch Export** - Generate multiple files at once
3. **Data Validation** - Validate generated data before export
4. **Statistics Dashboard** - Show distribution charts
5. **Dark Mode** - System theme integration
6. **Multi-language Support** - i18n for UI
7. **Auto-update** - Electron auto-updater integration
8. **Cloud Sync** - Save templates to cloud (future)

---

## Performance Considerations

- Use Web Workers for generation of 10K+ records
- Implement virtual scrolling for data preview
- Stream large exports instead of loading into memory
- Add progress indicators for long operations
- Debounce preview updates

---

## Security Considerations

1. **No external API calls** - All generation is local
2. **No data collection** - Privacy-first approach
3. **Clear data warnings** - Prevent misuse
4. **Sandboxed execution** - Electron contextIsolation
5. **Input validation** - Prevent injection attacks

---

## Build & Distribution

### Electron Builder Configuration

```json
{
  "build": {
    "appId": "com.dataforge.app",
    "productName": "DataForge",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "package.json"
    ],
    "mac": {
      "category": "public.app-category.developer-tools",
      "target": ["dmg", "zip"]
    },
    "win": {
      "target": ["nsis", "portable"]
    },
    "linux": {
      "target": ["AppImage", "deb"]
    }
  }
}
```

---

## Final Checklist

- [ ] License agreement implemented and prominent
- [ ] All field types working correctly
- [ ] Uniqueness enforced properly
- [ ] Phone numbers have correct country codes
- [ ] All export formats working
- [ ] Performance tested with 10,000 records
- [ ] Error handling for all edge cases
- [ ] UI is responsive and intuitive
- [ ] Cross-platform testing (Win/Mac/Linux)
- [ ] Documentation complete
- [ ] Code is type-safe (no `any` types)
- [ ] Security audit completed

---

## Development Command Summary

```bash
# Initial setup
npm init
npm install [all dependencies]

# Development
npm run dev

# Build
npm run build

# Package for distribution
npm run dist
```

---

## Support & Resources

- **Faker.js Docs**: https://fakerjs.dev/
- **Electron Docs**: https://www.electronjs.org/docs
- **Tailwind Docs**: https://tailwindcss.com/docs
- **React Hook Form**: https://react-hook-form.com/

---

**Good luck with your DataForge application! This is a solid educational project that will teach you full-stack development, data generation, and desktop app packaging.**
