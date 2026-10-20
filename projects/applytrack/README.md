# ApplyTrack — Job Application Tracker

**Live demo:** https://asadlang05-ctrl.github.io/Learner-journal/projects/applytrack/

ApplyTrack is a small, mobile-friendly job-search tracker built with vanilla HTML, CSS and JavaScript. It is the companion mini-project to MarketSignal.

## Features

- Add, edit and delete job applications.
- Track status: Saved, Applied, Interview, Offer or Rejected.
- Search by role, company, location or notes.
- Filter applications by status.
- Set application and follow-up dates.
- Store records in browser `localStorage`.
- Export records as CSV.
- Escape user-entered text before rendering and accept only HTTP/HTTPS posting links.

## Run it

Open the live demo, or serve this folder with any static HTTP server. No package installation, account, backend or API key is required.

## Technical notes

- One self-contained `index.html` keeps the project easy to inspect.
- `localStorage` persists records in the current browser; records do not automatically sync to other devices.
- CSV export creates a temporary browser download.
- This project is a learning tool, not a cloud-synced job CRM.
