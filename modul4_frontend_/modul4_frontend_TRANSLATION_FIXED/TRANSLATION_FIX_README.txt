IN-Track Module 4 - Translation Fix
===================================

EXACT PROBLEM FOUND IN YOUR GITHUB BRANCH:
The working translation files were uploaded here:
  modul4_frontend/module4_translation/module4_translation_frontend_patch/

But the app actually loads files from:
  modul4_frontend/

So the real Module4Dashboard.jsx and components/LanguageSwitcher.jsx remained the old non-i18n versions.

THIS FIXED FOLDER:
- moves i18n/ to the real modul4_frontend root
- replaces the real Module4Dashboard.jsx
- replaces the real LanguageSwitcher.jsx
- updates AuditTrail, SuperAdmin, Export and Notifications to use translations
- removes the unnecessary nested module4_translation folder
- keeps your current api/module4Api.js unchanged

LOCAL LOCATION:
Copy/replace the CONTENTS of this folder into:
  D:\INTrackFrontend\src\module4\

Required npm packages (run once in D:\INTrackFrontend):
  npm install i18next react-i18next

GITHUB:
Replace the CONTENTS of your existing branch folder:
  modul4_frontend/
with this fixed folder's contents.

Do NOT create another nested translation folder.

Expected root structure:
  modul4_frontend/
    Module4Dashboard.jsx
    api/
    components/
      LanguageSwitcher.jsx
    i18n/
      index.js
      locales/
        en/translation.json
        bn/translation.json
    pages/
    styles/
