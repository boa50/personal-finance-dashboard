---
name: dashboard-data-layer
description: Use when modifying database queries, Google Cloud BigQuery integration, service account authentication, table schemas, mock CSV data loaders, or data pipelines in personal-finance-dashboard.
---

# Personal Finance Dashboard — Data Layer & BigQuery

## Goal

Provide robust, secure, and dual-mode financial data acquisition supporting production Google Cloud BigQuery queries and local offline mock CSV datasets.

---

## 1. Dual-Mode DataSource Architecture

The application switches between live Google Cloud BigQuery and local offline CSV mock files via the `DATASOURCE` environment variable:

```text
                  process.env.DATASOURCE
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
    'db' (Production)                'mock' (Offline / Dev)
         │                                   │
         ▼                                   ▼
  Google Cloud BigQuery               Local Mock CSV Files
  - Client: @google-cloud/bigquery    - Parser: d3.csvParse
  - Auth: Base64 GCP Service Key      - Path: app/data/mock/*.csv
  - SQL Queries on DB_SCHEMA          - Synchronous fs.readFileSync
         │                                   │
         └─────────────────┬─────────────────┘
                           │
                           ▼
                  Structured TypeScript
                Interfaces (app/aux/Interfaces)
```

- When `process.env.DATASOURCE === 'db'`, queries run against Google Cloud BigQuery using the dataset defined in `process.env.DB_SCHEMA`.
- When `process.env.DATASOURCE !== 'db'` (or unconfigured), the application reads mock CSV files from `./app/data/mock/`.

---

## 2. BigQuery Authentication & Connection (`app/data/connection.tsx`)

Service account authentication uses base64-encoded credentials passed through the environment:

```typescript
export const getGCPCredentials = () => {
    const credential = JSON.parse(atob(process.env.GCP_KEY_ENCODED || ""))

    return {
        credentials: {
            client_email: credential.client_email,
            private_key: credential.private_key,
        },
        projectId: process.env.PROJECT_ID,
        scopes: [
            'https://www.googleapis.com/auth/drive.readonly'
        ] 
    }
}
```

### Key Encoding Procedure
To encode a Google Cloud Service Account JSON key for `.env.local`:
```bash
cat bigquery-key.json | base64 -w 0
```
Store the resulting single-line string in `GCP_KEY_ENCODED`.

---

## 3. Database Tables & Schema Specifications

Tables reside within the BigQuery dataset specified by `process.env.DB_SCHEMA`:

| Table Name | Schema (`process.env.DB_SCHEMA.*`) | Key Columns & Types | Description |
| :--- | :--- | :--- | :--- |
| **`investments`** | `${DB_SCHEMA}.investments` | `product` (STRING)<br>`sub_product` (STRING)<br>`country` (STRING)<br>`total_invested` (NUMERIC)<br>`profit_executed` (NUMERIC)<br>`profit_to_execute` (NUMERIC)<br>`cost` (NUMERIC) | Master portfolio positions across asset classes (Equities, FIIs, Crypto, International, Fixed Income). |
| **`stocks`** | `${DB_SCHEMA}.stocks` | `ticker` (STRING)<br>`type` (STRING: 'FII', 'STOCK')<br>`country` (STRING)<br>`fii_sector` (STRING)<br>`balance` (NUMERIC)<br>`total_invested` (NUMERIC)<br>`average_price` (NUMERIC)<br>`cost_buying` (NUMERIC) | Individual asset holding details, purchase history, and FII sector classifications. |
| **`exchange`** | `${DB_SCHEMA}.exchange` | `from` (STRING: ISO country/currency code)<br>`to` (STRING)<br>`rate` (STRING / NUMERIC) | Currency exchange rates to BRL (e.g. `US` -> `BRL`). |
| **`exchange_cost`** | `${DB_SCHEMA}.exchange_cost` | `cost_brl` (NUMERIC)<br>`cost_int` (NUMERIC)<br>`cost_int_avg` (NUMERIC) | Realized IOF and spread exchange transaction costs in BRL. |
| **`dividends`** | `${DB_SCHEMA}.dividends` | `ticker` (STRING)<br>`month` (DATE / STRING)<br>`amount` (NUMERIC)<br>`type` (STRING)<br>`country` (STRING) | Monthly dividend and income distributions received. |
| **`crypto`** | `${DB_SCHEMA}.crypto` | `coin` (STRING)<br>`cost` (NUMERIC)<br>`quantity` (NUMERIC) | Cryptocurrency holdings, base cost, and quantities. |

---

## 4. Query Execution Standards (`app/data/data.tsx`)

### BigQuery Job Execution
```typescript
const getResults = async (query: string): Promise<Array<any>> => {
    const bigQuery = new BigQuery(getGCPCredentials())
    const [job] = await bigQuery.createQueryJob({ query: query })
    const [rows] = await job.getQueryResults()
    return rows
}
```

### Query Patterns

1. **Investments Table**:
   ```sql
   SELECT * FROM `${DB_SCHEMA}.investments`
   ```
2. **FII Holdings Filter**:
   ```sql
   SELECT 
       ticker,
       balance, 
       total_invested, 
       fii_sector
   FROM `${DB_SCHEMA}.stocks` 
   WHERE type = 'FII'
   AND total_invested > 0
   ```
3. **Rolling 24-Month Dividends**:
   ```sql
   SELECT * FROM `${DB_SCHEMA}.dividends` d
   WHERE DATE_DIFF(DATE_TRUNC(CURRENT_DATE(), MONTH), d.month, MONTH) <= 24
   ```
   Filters income received within the last 2 calendar years relative to the current execution date.

---

## 5. Mock Data Architecture (`app/data/mock/`)

For offline development, testing, and continuous integration:
- Mock CSV parser: `d3.csvParse(fs.readFileSync('./app/data/mock/${filename}.csv', 'utf8'))`.
- Supported mock filenames:
  - `investments.csv`: Mirrors `Investment` interface.
  - `fiis.csv`: Mirrors `Stock` FII subset.
  - `exchange.csv`: Mirrors currency pairs.
  - `exchange_cost.csv`: Single row with `cost_brl`.
  - `dividends.csv`: Monthly distribution records.
- In mock mode, dividend month dates are normalized via `{ ...d, month: { value: d.month } }` to match the BigQuery Date object format.

---

## 6. Implementation Rules for Data Layer Changes

1. **Keep Secrets Out of VCS**:
   - Never commit `bigquery-key.json` or unencoded private keys.
   - `.env.local` is ignored by `.gitignore`. Keep `.env.local.example` updated with variable names only.
2. **Synchronize TypeScript Contracts**:
   - Whenever table schemas change, update the corresponding interfaces in `app/aux/Interfaces.tsx` (`Investment`, `Stock`, `Exchange`, `ExchangeCost`, `Dividend`, `Crypto`).
3. **Safe Numeric Conversion**:
   - BigQuery numeric columns or CSV string values must always be parsed to numbers using unary `+` (e.g. `+d.total_invested`, `+d.cost`).
4. **Graceful Nullish Values**:
   - Handle nullable database columns gracefully (e.g. `d.cost ? +d.cost : 0`, `d.profit_to_execute ? ... : ...`).
5. **Encapsulation**:
   - All data fetching and transformation logic must remain isolated within `app/data/`. Never import `@google-cloud/bigquery` or `fs` into `app/charts/` or presentation components.
