# Clinic Flow

Front-desk board for a medical clinic: register patients and move them through
Registered → Checked in → In queue → Waiting for payment → Checked out.

Data is stored locally in the browser (`localStorage`); there is no backend.

## Features

- Patient registration (name, HN, phone, date of birth, reason for visit)
- One-click stage transitions, plus a "Back" action to undo a mistaken move
- Automatic queue numbers when a patient enters the queue
- Bill amount entered at the end of the visit, collected at check-out
- Search by name, HN or phone, and per-stage counters with collected total

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

Requires Node 20.19+ / 22+.
