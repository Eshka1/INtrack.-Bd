IN-Track Module 4 Translation Patch
===================================

WHAT THIS DOES
- Adds working English <-> Bangla translation
- Uses i18next + react-i18next
- Remembers the selected language in localStorage
- Translates Module 4 navigation and all four Module 4 pages

LOCAL TEST
1. Open PowerShell:
   cd D:\INTrackFrontend
   npm install i18next react-i18next

2. Copy the CONTENTS of this folder into:
   D:\INTrackFrontend\src\module4\

3. Allow Windows to merge/replace the matching files.

4. Start the frontend/backend and open:
   http://localhost:5173

5. Use the Language selector in the Module 4 header.

GITHUB LOCATION
Do NOT upload this ZIP as a separate translation project.
Copy these files into your existing GitHub folder:
   module4_frontend/

Final structure should include:
module4_frontend/
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
    AuditTrail.jsx
    SuperAdmin.jsx
    Export.jsx
    Notifications.jsx
  styles/

DEPENDENCIES
The main frontend package must have:
   npm install i18next react-i18next

This patch contains no backend secrets.
