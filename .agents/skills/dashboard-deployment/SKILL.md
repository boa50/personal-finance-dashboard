---
name: dashboard-deployment
description: Use when configuring environment variables, GCP BigQuery service accounts, Next.js production builds, Docker, or deployment workflows for personal-finance-dashboard.
---

# Personal Finance Dashboard — Deployment & Environment

## Goal

Provide clear procedures for configuring environment variables, authenticating Google Cloud BigQuery service accounts, executing production builds, and deploying Personal Finance Dashboard safely across hosting targets.

---

## 1. Environment Configuration

Personal Finance Dashboard requires four primary environment variables configured in `.env.local` (local development) or secret management systems (production):

```bash
# Data ingestion mode: 'db' for live BigQuery, 'mock' for local CSV files
DATASOURCE=db

# Google Cloud BigQuery dataset name containing portfolio tables
DB_SCHEMA=my_financial_dataset

# Google Cloud Project ID
PROJECT_ID=my-gcp-project-id

# Base64-encoded Google Cloud Service Account JSON key
GCP_KEY_ENCODED=eyJuYW1lIjoiZ2NwLXNlcnZpY2UtYWNjb3VudCIs...
```

### Reference Template (`.env.local.example`)
Always keep `.env.local.example` in sync with any newly introduced environment variables without committing actual secrets.

---

## 2. Google Cloud BigQuery Service Account Setup

To authorize Personal Finance Dashboard to query your BigQuery portfolio tables:

### 1. Required IAM Roles
The service account requires the following Google Cloud IAM roles on the project:
- **`roles/bigquery.dataViewer`** (BigQuery Data Viewer): Grants read-only access to dataset tables and views.
- **`roles/bigquery.jobUser`** (BigQuery Job User): Grants permission to submit queries and run query jobs.
- **Google Drive Read-Only Scope** (`https://www.googleapis.com/auth/drive.readonly`): Required if tables reference external Google Sheets data sources.

### 2. Service Account Key Generation & Base64 Encoding
1. In Google Cloud Console, navigate to **IAM & Admin → Service Accounts**.
2. Select or create your service account, click **Keys → Add Key → Create New Key (JSON)**.
3. Download the key JSON file (e.g. `bigquery-key.json`).
4. Generate the base64-encoded string:
   ```bash
   cat bigquery-key.json | base64 -w 0
   ```
5. Paste the single-line string into `GCP_KEY_ENCODED` in `.env.local`.

---

## 3. Production Build & Execution

Execute the Next.js production lifecycle commands:

```bash
# 1. Compile production application bundle
npm run build

# 2. Launch production server on port 3000
npm run start
```

### Standalone Output Configuration (Optional Container Deployment)
If deploying via Docker or containerized environments (e.g. Google Cloud Run), update `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
}

module.exports = nextConfig
```
This generates `.next/standalone`, bundling only necessary `node_modules` for minimal Docker image size.

---

## 4. Vercel Deployment & Serverless Functions

When deploying to **Vercel**:
- Both `app/page.tsx` and `app/api/finance/route.ts` are automatically deployed as **Vercel Serverless Functions** (Node.js runtime).
- Because `export const dynamic = 'force-dynamic'` and `export const revalidate = 0` are declared, requests execute on-demand at request time, allowing BigQuery updates to reflect immediately without redeploying.
- The `export const maxDuration = 60` setting in route files and `vercel.json` configures the maximum function execution window up to 60 seconds.
- Database queries in `app/data/data.tsx` run concurrently using `Promise.all`, finishing within 3–5 seconds to stay well below the timeout threshold.
- Set `DATASOURCE=db`, `DB_SCHEMA`, `PROJECT_ID`, and `GCP_KEY_ENCODED` under **Project Settings → Environment Variables** on Vercel.

### Vercel Configuration (`vercel.json`)
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "functions": {
    "app/page.tsx": {
      "maxDuration": 60
    },
    "app/api/finance/route.ts": {
      "maxDuration": 60
    }
  }
}
```

---

## 5. Pre-Deployment Checklist

Before pushing changes to production:

1. [ ] **Verify Environment**: Ensure `DATASOURCE=db`, `DB_SCHEMA`, `PROJECT_ID`, and `GCP_KEY_ENCODED` are configured in target deployment environment.
2. [ ] **Clean Typecheck**: Run `npx tsc --noEmit` to guarantee zero type errors.
3. [ ] **Linter Check**: Run `npm run lint` to guarantee clean code style.
4. [ ] **Production Build**: Run `npm run build` locally to confirm bundle builds successfully.
5. [ ] **Credentials Check**: Confirm `bigquery-key.json` and `.env*.local` are omitted from the git tree (`git status`).
