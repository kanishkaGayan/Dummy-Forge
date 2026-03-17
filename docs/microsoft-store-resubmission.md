# Microsoft Store resubmission notes

## Product
- Product: Dummy Forge
- Product ID: 9P8TZT0650H6
- Previous review date: 2026-03-12
- Remediation date: 2026-03-13

## Certification issue addressed
Policy `10.1.1.11 - On Device Tiles` failed because the packaged Windows tile images did not uniquely represent Dummy Forge.

## Design update
A new branded icon system was created for Dummy Forge. The tile artwork uses:
- a dark slate rounded-square plate for strong contrast in both light and dark Windows surfaces
- a custom `D` symbol to represent `Dummy`
- three orange data bars inside the mark to represent generated rows and datasets
- a gold spark accent to communicate the `Forge` concept

This avoids generic placeholder imagery and keeps the icon recognizable at small sizes.

## Updated source assets
- [src/icons/dummy-forge-tile.svg](../src/icons/dummy-forge-tile.svg)
- [src/icons/dummy-forge-wide-tile.svg](../src/icons/dummy-forge-wide-tile.svg)

## Updated Windows assets
- [build/appx/Square44x44Logo.png](../build/appx/Square44x44Logo.png)
- [build/appx/Square50x50Logo.png](../build/appx/Square50x50Logo.png)
- [build/appx/StoreLogo.png](../build/appx/StoreLogo.png)
- [build/appx/Square71x71Logo.png](../build/appx/Square71x71Logo.png)
- [build/appx/Square150x150Logo.png](../build/appx/Square150x150Logo.png)
- [build/appx/Wide310x150Logo.png](../build/appx/Wide310x150Logo.png)
- [build/appx/Square310x310Logo.png](../build/appx/Square310x310Logo.png)
- [build/appx/icon.png](../build/appx/icon.png)

## Additional branding updates
- [public/icon.png](../public/icon.png)
- [public/apple-touch-icon.png](../public/apple-touch-icon.png)
- [public/favicon-16x16.png](../public/favicon-16x16.png)
- [public/favicon-32x32.png](../public/favicon-32x32.png)
- [public/favicon.ico](../public/favicon.ico)

## Validation checklist
- Verified square tile assets exist at 44, 50, 71, 150, and 310 pixels
- Corrected the wide tile asset to its proper 310x150 dimensions
- Preserved PNG format for Store submission assets
- Kept branding consistent with the in-app icon shown in the React UI
- Chose high-contrast colors for readability on Microsoft Surface-class displays
- Re-generated all app icon derivatives from the current primary icon (`public/icon.png`)
- Completed file existence and exact-size validation across all required icon outputs (`CHECK_RESULT PASS`)

## Resubmission message draft
Dummy Forge, Product ID `9P8TZT0650H6`, has been updated to address policy `10.1.1.11 - On Device Tiles`.

Changes made:
1. Replaced the previous default Windows tile images with a custom Dummy Forge brand icon.
2. Added uniquely branded square tile assets for 44x44, 71x71, 150x150, and 310x310 sizes.
3. Corrected the wide tile asset to a true 310x150 branded image.
4. Updated the Store logo and app icon assets for consistent Windows branding.

Please review the updated package for the corrected tile imagery.
