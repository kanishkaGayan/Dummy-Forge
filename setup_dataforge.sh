#!/bin/bash

# DataForge Project Initialization Script
# This script sets up the complete project structure

echo "🔨 DataForge - Project Setup"
echo "=============================="
echo ""

# Create project directory
PROJECT_NAME="dataforge"
echo "📁 Creating project directory: $PROJECT_NAME"
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

# Initialize npm
echo "📦 Initializing npm..."
npm init -y

# Install dependencies
echo "📥 Installing dependencies..."
echo "   This may take a few minutes..."

# Production dependencies
npm install @faker-js/faker express better-sqlite3 libphonenumber-js \
  jspdf jspdf-autotable papaparse uuid date-fns zod \
  react react-dom react-hook-form @hookform/resolvers

# Dev dependencies
npm install -D electron electron-builder typescript vite \
  @vitejs/plugin-react tailwindcss autoprefixer postcss \
  concurrently @types/react @types/react-dom @types/express \
  @types/better-sqlite3 @types/papaparse @types/uuid \
  @typescript-eslint/eslint-plugin @typescript-eslint/parser

echo "✅ Dependencies installed"

# Create directory structure
echo "📂 Creating project structure..."

mkdir -p electron
mkdir -p src/{components,lib/{generators,exporters,utils},types,styles}
mkdir -p server/{routes,database}
mkdir -p public

# Create tsconfig.json
cat > tsconfig.json << 'EOL'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "electron", "server"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOL

# Create tsconfig.node.json
cat > tsconfig.node.json << 'EOL'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOL

# Create vite.config.ts
cat > vite.config.ts << 'EOL'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  },
});
EOL

# Create tailwind.config.js
cat > tailwind.config.js << 'EOL'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOL

# Create postcss.config.js
cat > postcss.config.js << 'EOL'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOL

# Create electron/main.ts
cat > electron/main.ts << 'EOL'
import { app, BrowserWindow } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
EOL

# Create electron/preload.ts
cat > electron/preload.ts << 'EOL'
import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  // Add IPC methods here
});
EOL

# Create src/main.tsx
cat > src/main.tsx << 'EOL'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
EOL

# Create src/App.tsx
cat > src/App.tsx << 'EOL'
import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          DataForge
        </h1>
        <p className="text-center text-gray-600">
          Educational Data Generation Tool
        </p>
      </div>
    </div>
  );
}

export default App;
EOL

# Create src/styles/index.css
cat > src/styles/index.css << 'EOL'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
EOL

# Create index.html
cat > index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DataForge</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOL

# Create LICENSE
cat > LICENSE << 'EOL'
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
EOL

# Create README.md
cat > README.md << 'EOL'
# DataForge

Educational data generation tool for developers and students.

## ⚠️ IMPORTANT DISCLAIMER

This tool generates **FICTIONAL data for educational purposes only**. All generated data is randomly created and does not represent real individuals or entities. See LICENSE for full legal terms.

## Features

- Generate up to 10,000 records
- Multiple field types (personal, contact, location, custom)
- Export to SQL, CSV, TXT, PDF
- Country-aware phone numbers and addresses
- Guaranteed unique fields
- Demographics configuration

## Installation

\`\`\`bash
npm install
\`\`\`

## Development

\`\`\`bash
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
\`\`\`

## License

MIT with Educational Use Clause - See LICENSE file
EOL

# Update package.json with scripts
cat > package.json << 'EOL'
{
  "name": "dataforge",
  "version": "1.0.0",
  "description": "Educational data generation tool",
  "main": "dist/electron/main.js",
  "scripts": {
    "dev": "concurrently \"vite\" \"wait-on http://localhost:3000 && electron .\"",
    "build": "tsc && vite build",
    "electron:build": "electron-builder",
    "package": "npm run build && npm run electron:build",
    "preview": "vite preview"
  },
  "keywords": ["data", "generator", "faker", "mock", "educational"],
  "author": "Your Name",
  "license": "MIT"
}
EOL

# Create .gitignore
cat > .gitignore << 'EOL'
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Build outputs
dist/
release/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Environment
.env
.env.local
EOL

echo ""
echo "✅ Project structure created successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. cd $PROJECT_NAME"
echo "   2. Review DATAFORGE_BUILD_PROMPT.md for detailed specifications"
echo "   3. npm run dev (to start development server)"
echo ""
echo "🎯 Read the complete build prompt in: DATAFORGE_BUILD_PROMPT.md"
echo ""
echo "Happy coding! 🚀"
