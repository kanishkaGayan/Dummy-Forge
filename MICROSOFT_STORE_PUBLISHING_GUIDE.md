# DummyForge - Microsoft Store Publishing Guide
## Complete Step-by-Step Process for VS Code Agent

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [App Preparation](#app-preparation)
3. [MSIX Packaging](#msix-packaging)
4. [Privacy Policy & Terms](#privacy-policy--terms)
5. [Store Listing Assets](#store-listing-assets)
6. [Partner Center Setup](#partner-center-setup)
7. [Submission Process](#submission-process)
8. [Post-Submission](#post-submission)
9. [Common Issues](#common-issues)

---

## 1. Prerequisites

### Required Accounts & Tools
```bash
✅ Microsoft Partner Center Account ($19 one-time fee for individuals)
✅ Windows 10/11 for testing
✅ Valid code signing certificate OR Microsoft Store signing
✅ Node.js 20+ installed
✅ electron-builder configured
```

### Register for Partner Center
1. Go to: https://partner.microsoft.com/dashboard
2. Click "Enroll" → "Windows & Xbox"
3. Account type: Individual (or Company)
4. Pay $19 USD one-time registration fee
5. Complete identity verification (may take 24-48 hours)

---

## 2. App Preparation

### Update package.json

```json
{
  "name": "dummy-forge",
  "productName": "Dummy Forge",
  "version": "1.0.0",
  "description": "Educational data generation tool",
  "author": {
    "name": "Kanishka Meddegoda"
  },
  "homepage": "https://kanishka.dev",
  "repository": {
    "type": "git",
    "url": "REPLACE_WITH_REPO_URL"
  },
  "license": "MIT",
  "main": "dist/electron/main.js",
  "build": {
    "appId": "com.dummyforge.app",
    "productName": "Dummy Forge",
    "copyright": "Copyright © 2026 Kanishka Meddegoda",
    "win": {
      "target": [
        {
          "target": "appx",
          "arch": ["x64", "arm64"]
        }
      ],
      "publisherName": "CN=REPLACE_WITH_PUBLISHER_NAME",
      "applicationId": "DummyForge",
      "identityName": "REPLACE_WITH_PARTNER_CENTER_IDENTITY",
      "publisher": "CN=REPLACE_WITH_PUBLISHER_ID",
      "displayName": "Dummy Forge"
    },
    "appx": {
      "backgroundColor": "#428BCA",
      "showNameOnTiles": true,
      "languages": ["en-US"],
      "publisherDisplayName": "Kanishka Meddegoda",
      "applicationId": "DummyForge",
      "identityName": "REPLACE_WITH_PARTNER_CENTER_IDENTITY",
      "publisher": "CN=REPLACE_WITH_PUBLISHER_ID",
      "displayName": "Dummy Forge - Data Generator"
    },
    "directories": {
      "output": "release",
      "buildResources": "build"
    },
    "files": [
      "dist/**/*",
      "package.json"
    ],
    "extraFiles": [
      {
        "from": "LICENSE",
        "to": "LICENSE.txt"
      }
    ]
  }
}
```

### Dummy Forge-specific notes
- Export formats: CSV, SQL, PDF, TXT, XLSX
- External links open in the system browser
- Error handling: user-friendly dialogs with error codes and local log files
- Logs are stored under the app userData directory (per-user)

### electron-builder.yml Configuration

Create `electron-builder.yml`:

```yaml
appId: com.dummyforge.app
productName: Dummy Forge
copyright: Copyright © 2026 Kanishka Meddegoda
directories:
  output: release
  buildResources: build

win:
  target:
    - target: appx
      arch:
        - x64
        - arm64
  publisherName: CN=REPLACE_WITH_PUBLISHER_NAME
  applicationId: DummyForge
  identityName: REPLACE_WITH_PARTNER_CENTER_IDENTITY
  publisher: CN=REPLACE_WITH_PUBLISHER_ID

appx:
  backgroundColor: '#428BCA'
  showNameOnTiles: true
  addAutoLaunchExtension: false
  languages:
    - en-US
  publisherDisplayName: Kanishka Meddegoda
  applicationId: DummyForge
  identityName: REPLACE_WITH_PARTNER_CENTER_IDENTITY
  publisher: CN=REPLACE_WITH_PUBLISHER_ID
  displayName: Dummy Forge - Educational Data Generator

files:
  - dist/**/*
  - package.json
  - LICENSE

extraFiles:
  - from: PRIVACY_POLICY.md
    to: PRIVACY_POLICY.txt
  - from: TERMS_OF_SERVICE.md
    to: TERMS_OF_SERVICE.txt
```

### App Manifest (AppxManifest.xml)

Create `build/appx/AppxManifest.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<Package xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10"
         xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10"
         xmlns:rescap="http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities">

  <Identity Name="REPLACE_WITH_PARTNER_CENTER_IDENTITY"
            Publisher="CN=REPLACE_WITH_PUBLISHER_ID"
            Version="1.0.0.0" />

  <Properties>
    <DisplayName>Dummy Forge</DisplayName>
    <PublisherDisplayName>Kanishka Meddegoda</PublisherDisplayName>
    <Logo>build/icon.png</Logo>
    <Description>Educational data generation tool for developers and students</Description>
  </Properties>

  <Dependencies>
    <TargetDeviceFamily Name="Windows.Desktop" MinVersion="10.0.17763.0" MaxVersionTested="10.0.22621.0" />
  </Dependencies>

  <Capabilities>
    <rescap:Capability Name="runFullTrust" />
    <Capability Name="internetClient" />
  </Capabilities>

  <Applications>
    <Application Id="DummyForge" Executable="DummyForge.exe" EntryPoint="Windows.FullTrustApplication">
      <uap:VisualElements DisplayName="DummyForge"
                          Description="Generate realistic dummy data for education and development"
                          BackgroundColor="#428BCA"
                          Square150x150Logo="build/Square150x150Logo.png"
                          Square44x44Logo="build/Square44x44Logo.png">
        <uap:DefaultTile Wide310x150Logo="build/Wide310x150Logo.png"
                         Square310x310Logo="build/LargeTile.png"
                         Square71x71Logo="build/SmallTile.png"
                         ShortName="DummyForge">
          <uap:ShowNameOnTiles>
            <uap:ShowOn Tile="square150x150Logo"/>
            <uap:ShowOn Tile="wide310x150Logo"/>
            <uap:ShowOn Tile="square310x310Logo"/>
          </uap:ShowNameOnTiles>
        </uap:DefaultTile>
      </uap:VisualElements>
    </Application>
  </Applications>
</Package>
```

---

## 3. MSIX Packaging

### Required App Icons

Create these PNG files in `build/` folder:

```
build/
├── icon.png                     # 512x512 - App icon
├── Square44x44Logo.png          # 44x44 - Small tile
├── Square71x71Logo.png          # 71x71 - Small tile
├── Square150x150Logo.png        # 150x150 - Medium tile
├── Square310x310Logo.png        # 310x310 - Large tile
├── Wide310x150Logo.png          # 310x150 - Wide tile
├── StoreLogo.png                # 50x50 - Store logo
└── SplashScreen.png             # 620x300 - Splash screen
```

### Icon Specifications

```typescript
// Icon requirements:
// - Format: PNG with transparency
// - Color: Follow brand colors (#428BCA primary)
// - Design: Simple, recognizable at small sizes
// - Content: Forge/hammer icon + data symbols

Example icon design concept:
┌─────────────────┐
│                 │
│    🔨 + 📊     │  Hammer + Data chart
│                 │
│   DummyForge    │
│                 │
└─────────────────┘
```

### Build MSIX Package

```bash
# Install dependencies
npm install

# Build the app
npm run build

# Package for Microsoft Store
npm run package:appx

# Or use electron-builder directly
npx electron-builder --win appx
```

### Test MSIX Locally

```bash
# Enable developer mode in Windows Settings
# Settings > Update & Security > For Developers > Developer Mode

# Install certificate (if self-signed for testing)
Add-AppxPackage -Path "release/DummyForge 1.0.0.appx"

# Launch and test
# Find in Start Menu or search for "DummyForge"
```

---

## 4. Privacy Policy & Terms

### PRIVACY_POLICY.md

```markdown
# Privacy Policy for DummyForge

**Last Updated: [DATE]**

## Overview
DummyForge is committed to protecting your privacy. This privacy policy explains how we handle data in our application.

## Data Collection
**WE DO NOT COLLECT ANY PERSONAL DATA.**

DummyForge:
- Does NOT collect personal information
- Does NOT track user behavior
- Does NOT send data to external servers
- Does NOT use analytics or telemetry
- Does NOT require user accounts

## Data Generated by the App
All data generated by DummyForge is:
- Completely fictional and randomly generated
- Created locally on your device
- Never transmitted over the internet
- Under your complete control

## Data Storage
DummyForge stores:
- Application settings and preferences (locally on your device)
- Error logs (locally, for debugging purposes only)
- User-created data templates (locally on your device)

All data remains on your device and is never transmitted to us or third parties.

## Generated Data Disclaimer
The data generated by DummyForge is entirely fictional and does not represent real individuals or entities. Users are responsible for:
- Using generated data ethically and legally
- Compliance with applicable laws (GDPR, CCPA, etc.)
- Not using generated data for fraudulent purposes
- Not using generated data to impersonate real individuals

## Third-Party Services
DummyForge does NOT use any third-party services, analytics, or tracking tools.

## Children's Privacy
DummyForge does not knowingly collect any data from anyone, including children under 13.

## Your Rights
Since we don't collect data, there's nothing to delete, modify, or export. All data remains on your device under your control.

## Changes to Privacy Policy
We may update this privacy policy. We will notify users of any material changes through the app.

## Contact
If you have questions about this privacy policy:
- Email: privacy@yourcompany.com
- Website: https://yourwebsite.com

## Microsoft Store Compliance
This application complies with Microsoft Store policies regarding data collection and privacy.

---

**Summary: DummyForge does not collect, store, or transmit any user data. All operations are local to your device.**
```

### TERMS_OF_SERVICE.md

```markdown
# Terms of Service for DummyForge

**Last Updated: [DATE]**

## Agreement to Terms
By installing and using DummyForge, you agree to these Terms of Service.

## Educational Purpose
DummyForge is designed exclusively for:
- Educational purposes
- Software development and testing
- Database prototyping
- Learning SQL, data analysis, and related skills

## User Responsibilities

### You MUST:
- Use generated data ethically and legally
- Comply with all applicable laws and regulations
- Respect intellectual property rights
- Use the software for its intended educational purpose

### You MUST NOT:
- Use generated data to impersonate real individuals
- Use generated data for fraudulent purposes
- Use generated data to violate privacy laws (GDPR, CCPA, etc.)
- Distribute or sell generated data as if it were real
- Use the app to create data for illegal activities
- Reverse engineer, decompile, or disassemble the software

## Data Disclaimer
ALL DATA GENERATED IS FICTIONAL. The data:
- Does not represent real people, organizations, or entities
- Is randomly generated using algorithms
- Should never be used as if it were real data
- May not be suitable for production use without modification

## No Warranty
DummyForge is provided "AS IS" without warranty of any kind. We do not guarantee:
- Accuracy of generated data
- Suitability for any particular purpose
- Uninterrupted or error-free operation
- Data will be unique or realistic

## Limitation of Liability
TO THE MAXIMUM EXTENT PERMITTED BY LAW:
- We are not liable for any damages arising from use of DummyForge
- We are not responsible for how you use generated data
- We are not liable for any legal consequences from misuse
- Maximum liability is limited to the amount paid for the software (if any)

## License
DummyForge is licensed under the MIT License with Educational Use Clause. See LICENSE file for details.

## Data You Create
You retain all rights to data you generate using DummyForge. We claim no ownership over your generated datasets.

## Termination
We reserve the right to:
- Terminate access for violations of these terms
- Discontinue the service at any time
- Update or modify the software

## Privacy
See our Privacy Policy for information on how we handle data (spoiler: we don't collect any).

## Updates
We may update these terms. Continued use after changes constitutes acceptance.

## Governing Law
These terms are governed by the laws of [YOUR JURISDICTION].

## Contact
Questions about these terms:
- Email: legal@yourcompany.com
- Website: https://yourwebsite.com

## Microsoft Store Compliance
This application complies with Microsoft Store policies and the Microsoft Store Services Agreement.

---

**By using DummyForge, you acknowledge that:**
1. All generated data is fictional
2. You are responsible for how you use the data
3. You will use the app ethically and legally
4. You accept these terms and our Privacy Policy
```

---

## 5. Store Listing Assets

### Required Screenshots

Create 3-5 high-quality screenshots (1920x1080 or 3840x2160):

1. **Main Interface Screenshot**
   - Show field selection interface
   - Clean, professional look
   - Include sample data preview

2. **Data Generation Screenshot**
   - Show demographics configuration
   - Display generated data preview
   - Highlight unique features

3. **Export Options Screenshot**
   - Show export format selection
   - Display export progress/success
   - Show professional output examples

4. **Custom Fields Screenshot**
   - Show custom field creation dialog
   - Highlight flexibility and power
   - Display various field types

5. **Results Screenshot**
   - Show generated SQL/CSV/PDF output
   - Display professional formatting
   - Highlight quality of generated data

### Screenshot Guidelines

```
✅ Resolution: 1920x1080 (16:9) or 2560x1440
✅ Format: PNG or JPEG
✅ Size: Under 2MB each
✅ Content: Professional, clean UI
✅ Text: Readable, no blurry text
✅ Branding: Consistent colors and fonts
✅ Context: Show app in action, not empty screens
❌ Avoid: Personal data, offensive content, competitor logos
```

### App Tile Images

```
Required:
├── 71x71 App Icon
├── 150x150 App Icon
├── 310x150 Wide Tile (recommended)
├── 310x310 Large Tile (recommended)
└── 44x44 Small Icon

All should:
- Use brand colors (#428BCA)
- Be recognizable at small sizes
- Follow Windows design guidelines
- Have transparent backgrounds (where appropriate)
```

### Promotional Images

```
Store Listing Images (optional but recommended):
├── 2400x1200 Hero Image (Featured placement)
├── 1920x1080 Screenshot (16:9)
├── 414x180 Thumbnail
└── 846x468 Poster art
```

---

## 6. Partner Center Setup

### Step 1: Create App Reservation

```
1. Log into Partner Center: https://partner.microsoft.com/dashboard
2. Navigate to: Apps and games > Overview
3. Click: + New product > App
4. Product type: MSIX or PWA app
5. Name your app: "DummyForge"
6. Check name availability
7. Reserve the name (good for 3 months)
```

### Step 2: Get Publisher Information

```
After creating app reservation:
1. Go to: Product management > Product Identity
2. Copy the following:
   - Package/Identity/Name
   - Package/Identity/Publisher
   - Publisher Display Name
   
Example:
Identity Name: 12345YourCompany.DummyForge
Publisher: CN=12345678-XXXX-XXXX-XXXX-XXXXXXXXXXXX
Publisher Display Name: Your Company Name

3. Update these in your electron-builder.yml
```

### Step 3: Age Ratings

```
1. Navigate to: Age ratings
2. Fill out IARC questionnaire:
   
   Questions to answer:
   - Does app contain violence? NO
   - Does app contain sexual content? NO
   - Does app contain gambling? NO
   - Does app share location? NO
   - Does app collect personal data? NO
   - Does app have user interaction? YES (user-generated content - data files)
   - Does app have in-app purchases? NO
   
3. Submit questionnaire
4. Receive age ratings (typically: 3+ or PEGI 3)
```

### Step 4: Properties

```
1. Navigate to: Properties
2. Fill in:

Category: Developer tools (primary)
Subcategory: Database tools

Additional categories:
- Productivity > Utilities
- Developer tools > Data tools

Product declarations:
☐ This app accesses the internet
☐ This product depends on non-Microsoft drivers or NT services
☑ This app allows users to make digital purchases
   (if you plan to add paid features)

Display mode: Default (windowed)

System requirements:
Minimum:
- OS: Windows 10 version 1809 or higher
- Architecture: x64, ARM64
- Memory: 4 GB RAM
- DirectX: Not required
- Video memory: Not required

Recommended:
- OS: Windows 11
- Architecture: x64
- Memory: 8 GB RAM
```

### Step 5: Pricing and Availability

```
Markets: Select all (or specific countries)
Pricing: 
- Free (recommended for initial release)
- Or set price: $0.99 - $99.99

Discoverability:
☑ Make this product available in the Microsoft Store
☑ Make this product discoverable and available for purchase

Schedule:
Release: As soon as it passes certification

Visibility:
☑ Public audience
☐ Private audience (for testing only)
```

---

## 7. Submission Process

### Store Listing

```
Base Listing (English - United States):

Description (10,000 char max):
─────────────────────────────
DummyForge - Educational Data Generation Tool

Forge realistic dummy data for education, development, and testing.

🎯 FEATURES

✓ Generate up to 10,000 records
✓ 40+ predefined field types (names, emails, phones, addresses)
✓ Custom fields with patterns (e.g., "STU-####-XXX")
✓ Country-aware phone numbers and postal codes
✓ Demographics control (gender ratio, age ranges)
✓ Guaranteed unique fields
✓ Export to SQL, CSV, TXT, and PDF

🌍 COUNTRY-AWARE DATA

Phone numbers with correct country codes, postal codes in proper formats, and localized names and addresses for 25+ countries.

📊 PERFECT FOR

• Students learning SQL and databases
• Developers testing applications
• Data analysts prototyping dashboards
• Database administrators creating test environments
• Anyone needing realistic test data

⚠️ EDUCATIONAL PURPOSE ONLY

All generated data is completely fictional and randomly created. DummyForge is designed for educational and development purposes only.

🔒 PRIVACY FIRST

• No data collection
• No internet required
• All processing is local
• Your data stays on your device

🎓 FREE & OPEN SOURCE

Built by developers, for developers. Licensed under MIT with Educational Use Clause.

─────────────────────────────

Release notes:
─────────────────────────────
v1.0.0 - Initial Release
• 40+ field types
• Multi-format export (SQL, CSV, TXT, PDF)
• Country-aware data generation
• Demographics configuration
• Custom field patterns
• Guaranteed uniqueness
─────────────────────────────

What's new in this version:
Initial release of DummyForge!

Search terms (7 max):
1. data generator
2. dummy data
3. test data
4. fake data generator
5. mock data
6. SQL generator
7. database tool

Copyright and trademark info:
Copyright © 2024 Your Company Name. All rights reserved.
DummyForge is a trademark of Your Company Name.

Additional license terms:
MIT License with Educational Use Clause - See included LICENSE.txt

Support contact info:
Website: https://yourwebsite.com
Email: support@yourcompany.com
GitHub: https://github.com/yourusername/dummyforge
```

### Upload Package

```
1. Navigate to: Packages
2. Click: Upload package
3. Select your .appx or .msix file from release/ folder
4. Wait for upload (may take 10-30 minutes)
5. Package will be automatically validated
6. Check for errors or warnings
7. Fix any issues and re-upload if needed
```

### Trailer (Optional but Recommended)

```
Create a 30-60 second video showing:
1. App launching
2. Selecting fields
3. Configuring demographics
4. Generating data
5. Exporting to formats
6. Viewing generated files

Specifications:
- Resolution: 1920x1080 (16:9)
- Format: MP4
- Max size: 2GB
- Length: 30-120 seconds
- Aspect ratio: 16:9
```

---

## 8. Post-Submission

### Certification Process

```
Timeline:
• Submission: Immediate
• Pre-processing: 1-24 hours
• Certification: 1-3 business days
• Publishing: 1-24 hours after approval

Typical stages:
1. ✅ Pre-processing (automated checks)
2. 🔄 Certification (manual review)
3. ✅ Signing (Microsoft signs your package)
4. 📦 Publishing (live in store)
5. ✅ In the Store (available to users)

You'll receive email notifications at each stage.
```

### Common Certification Failures

```
❌ Privacy Policy Issues
Fix: Ensure privacy policy URL is accessible and compliant

❌ Age Rating Problems
Fix: Complete IARC questionnaire accurately

❌ Package Validation Errors
Fix: Ensure AppxManifest.xml is correct

❌ Icon/Image Requirements
Fix: Provide all required icon sizes

❌ Description Issues
Fix: Remove prohibited content, fix formatting

❌ Functionality Problems
Fix: Ensure app works on Windows 10/11

❌ Security Issues
Fix: Remove any malicious code, update dependencies
```

### If Rejected

```
1. Read rejection email carefully
2. Note specific issues mentioned
3. Fix all listed problems
4. Update app version number
5. Rebuild and re-upload package
6. Resubmit with notes explaining fixes
```

### After Approval

```
1. App goes live within 24 hours
2. Appears in Microsoft Store search
3. Available for download
4. Start monitoring:
   - Reviews and ratings
   - Crash reports
   - Acquisition metrics
   - Usage statistics

5. Respond to user reviews
6. Plan updates based on feedback
```

---

## 9. Common Issues & Solutions

### Issue: Package Validation Failed

```
Error: "The package manifest is invalid"

Solution:
1. Check AppxManifest.xml syntax
2. Ensure all referenced icons exist
3. Verify publisher ID matches Partner Center
4. Validate with: makeappx.exe verify /p package.appx
```

### Issue: Icons Not Displaying

```
Error: "Missing required visual elements"

Solution:
1. Create all required icon sizes:
   - 44x44, 71x71, 150x150, 310x310, 310x150
2. Ensure PNG format with transparency
3. Place in build/ directory
4. Rebuild package
```

### Issue: App Crashes on Launch

```
Error: "Application failed to start"

Solution:
1. Test locally first: npm run package:appx
2. Install certificate: certutil -addstore TrustedPeople cert.cer
3. Install package: Add-AppxPackage
4. Check Windows Event Viewer for errors
5. Review error logs in AppData folder
```

### Issue: Publisher Name Mismatch

```
Error: "Publisher in manifest doesn't match reserved identity"

Solution:
1. Get correct publisher from Partner Center > Product Identity
2. Update in electron-builder.yml:
   publisher: "CN=EXACT-STRING-FROM-PARTNER-CENTER"
3. Rebuild package
```

### Issue: Age Rating Required

```
Error: "Age ratings required before submission"

Solution:
1. Navigate to Partner Center > Age ratings
2. Complete IARC questionnaire
3. Save ratings
4. Return to submission
```

---

## 10. Build Scripts

Add to package.json:

```json
{
  "scripts": {
    "dev": "concurrently \"vite\" \"electron .\"",
    "build": "tsc && vite build",
    "package:win": "electron-builder --win",
    "package:appx": "electron-builder --win appx",
    "package:all": "electron-builder --win --mac --linux",
    "test:appx": "npm run build && npm run package:appx",
    "publish:store": "npm run build && npm run package:appx"
  }
}
```

---

## 11. Checklist Before Submission

```
Pre-Submission Checklist:

App Preparation:
☐ Version number updated
☐ All dependencies up to date
☐ Error handling implemented
☐ Logging implemented
☐ App tested on Windows 10 & 11
☐ Performance optimized
☐ No hardcoded paths
☐ All features working

Documentation:
☐ Privacy policy created and uploaded
☐ Terms of service created
☐ README.md complete
☐ LICENSE file included
☐ Help documentation available

Assets:
☐ All required icon sizes created
☐ 3-5 screenshots captured
☐ Store description written
☐ Search terms selected
☐ Trailer video created (optional)

Package:
☐ MSIX package built
☐ Package tested locally
☐ No validation errors
☐ Publisher ID correct
☐ Version number correct
☐ All files included

Partner Center:
☐ App name reserved
☐ Age ratings completed
☐ Pricing set
☐ Markets selected
☐ Store listing complete
☐ Support info provided

Legal:
☐ Privacy policy URL working
☐ Terms of service accessible
☐ Copyright notices correct
☐ Trademarks cleared
☐ License compliant
```

---

## 12. Maintenance & Updates

### Releasing Updates

```
1. Update version in package.json (e.g., 1.0.0 → 1.1.0)
2. Update release notes
3. Build new package: npm run package:appx
4. Test new version locally
5. Go to Partner Center > Packages
6. Upload new package
7. Update "What's new" section
8. Submit for certification

Update frequency:
• Bug fixes: As needed
• Feature updates: Monthly or quarterly
• Security updates: Immediately
```

### Monitoring

```
Partner Center Analytics:
• Acquisitions (downloads)
• Usage (active users)
• Health (crash reports)
• Reviews and ratings
• Demographic data

Key metrics to track:
• Install conversion rate
• Retention rate (7-day, 30-day)
• Crash-free rate (target: >99%)
• Average rating (target: >4.0)
• Review response rate (target: 100%)
```

---

## Developer Contact (for Store listing)

- Developer: Kanishka Meddegoda
- Website: https://kanishka.dev
- LinkedIn: https://www.linkedin.com/in/kanishka-me/

Use these links in the Store listing support/contact section.

## Support Resources

```
Microsoft Documentation:
• Store Policies: https://docs.microsoft.com/en-us/windows/uwp/publish/store-policies
• App Submission: https://docs.microsoft.com/en-us/windows/apps/publish/
• Partner Center: https://partner.microsoft.com/dashboard

electron-builder:
• Documentation: https://www.electron.build/
• Windows targets: https://www.electron.build/configuration/win

Community:
• Microsoft Store Developer Forums
• Stack Overflow (tag: microsoft-store)
• GitHub Issues (electron-builder)
```

---

## Final Notes

**Timeline Overview:**
- Partner Center Setup: 1-2 days (including verification)
- App Preparation: 1-2 weeks
- Package Building: 1 day
- Testing: 2-3 days
- Submission: Minutes
- Certification: 1-3 business days
- **Total: 2-4 weeks** from start to live

**Costs:**
- Partner Center Registration: $19 USD (one-time)
- App Submission: Free
- Updates: Free
- Code Signing (if needed): $0-300/year

**Success Tips:**
1. Test thoroughly before submission
2. Follow all Store policies exactly
3. Provide complete, accurate information
4. Respond quickly to certification feedback
5. Monitor and respond to user reviews
6. Keep app updated regularly

---

**You're now ready to publish DummyForge to the Microsoft Store! 🚀**
