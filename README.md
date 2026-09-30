# Personal Finance Dashboard

Personal portfolio analytics dashboard built with Next.js 14 App Router, React 18, D3.js v7, Ant Design v5, and Google Cloud BigQuery.

Deploys seamlessly to **Vercel** with on-demand **Serverless Functions**, allowing financial data updates in BigQuery to reflect dynamically without redeploying the application.

---

## Features

- **Portfolio KPI Metrics**: Headline indicators for Total Invested, Realized Profit, Unrealized Profit, and corresponding profit margins.
- **Interactive D3 Visualizations**:
  - **Treemap Chart**: Hierarchical investment allocation by product.
  - **Bar Chart**: Grouped Real Estate Investment Trust (FII) distribution by sector.
  - **Lollipop Chart**: Comparison between initial purchase value and total market value.
  - **Line Chart**: Trailing 24-month dividend payment timeline with smooth monotone curves.
- **Dynamic Vercel Execution**: On-demand Server-Side Rendering (`force-dynamic`) via Vercel Functions ensures real-time BigQuery data reflection on every visit.
- **REST API Endpoint**: Exposes `GET /api/finance` for direct JSON data retrieval.
- **Dual Data Source**: Supports production Google Cloud BigQuery and offline local CSV development.
- **Dark Theme Design**: High-contrast slate-to-onyx palette, Ant Design tokens, and custom D3 SVG styling.

---

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components)
- **Library**: [React 18](https://react.dev/)
- **Visualizations**: [D3.js v7](https://d3js.org/)
- **UI Components**: [Ant Design v5](https://ant.design/) (`@ant-design/cssinjs` with SSR registry)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Data Warehouse**: [Google Cloud BigQuery](https://cloud.google.com/bigquery) (`@google-cloud/bigquery`)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)

---

## Getting Started

### 1. Installation

```bash
npm install
```

### 2. Environment Configuration

Create a `.env.local` file based on `.env.local.example`:

```bash
# Data ingestion mode: 'db' for live BigQuery, 'mock' for local CSV mock files
DATASOURCE=db

# Google Cloud BigQuery dataset name containing portfolio tables
DB_SCHEMA=my_dataset

# Google Cloud Project ID
PROJECT_ID=my_project_id

# Base64-encoded Google Cloud Service Account JSON key
GCP_KEY_ENCODED=eyJuYW1lIjoiZ2NwLXNlcnZpY2UtYWNjb3VudCIs...
```

To encode your GCP Service Account JSON key:
```bash
cat bigquery-key.json | base64 -w 0
```

### 3. Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

---

## API Endpoints

- **`GET /api/finance`**: Returns the complete aggregated financial dataset (KPIs, FII holdings, grouped FIIs, treemap allocation, dividends) in JSON format.

---

## Production Build

```bash
# Compile optimized production bundle
npm run build

# Start production server
npm run start
```

---

## Credits

- Vector illustrations from [SVGRepo](https://www.svgrepo.com/).