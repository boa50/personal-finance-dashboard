# Personal Finance Dashboard — Agent Instructions

## Project overview

Personal Finance Dashboard (`personal-finance-dashboard`) is a financial portfolio analytics web application built with Next.js 14 App Router, React 18, D3.js v7, Ant Design v5, and Google Cloud BigQuery.

Target environments:
- Web browsers (Desktop & Tablet responsive dashboards)
- Server-Side Rendering (Node.js runtime on Next.js 14 App Router)
- Cloud Data Warehousing (Google Cloud BigQuery)

Core technologies:
- **Next.js 14** (`14.2.31`, React Server Components, App Router file-based architecture)
- **React 18** (`react` 18.2.0, `react-dom` 18.2.0)
- **D3.js v7** (`d3` 7.8.5, `@types/d3` 7.4.2) for custom SVG data visualizations:
  - Hierarchical Treemaps (`d3.hierarchy`, `d3.treemap`)
  - Categorical Bar Charts (`d3.scaleBand`, `d3.scaleLinear`, `d3.scaleOrdinal`)
  - Divergent Lollipop Charts (`d3.scaleBand`, `d3.scaleLinear`)
  - Curvature Time-Series Line & Area Charts (`d3.scaleTime`, `d3.line`, `d3.curveMonotoneX`)
- **Ant Design v5** (`antd` 5.11.0 + `@ant-design/cssinjs` 1.17.2 with SSR style registry)
- **Tailwind CSS** (`tailwindcss` 3.3.0, `postcss` 8, `autoprefixer` 10)
- **Google Cloud BigQuery** (`@google-cloud/bigquery` 7.9.4) for enterprise data warehouse queries
- **TypeScript 5** (`typescript` 5.x with strict type checking)

The repository is structured around Server-Side data ingestion in `app/page.tsx`, data layer queries and transformations under `app/data/`, custom D3 visualization modules under `app/charts/`, formatting and interface definitions under `app/aux/`, design tokens in `theme/` and `app/globals.css`, and SSR style registry in `lib/`.

---

## Important architecture

### 1. Data flow: BigQuery / Mock CSV → Data Layer → Server Component → Client Charts

For portfolio and financial data, follow this strict unidirectional flow:

```text
Google Cloud BigQuery / Mock CSVs
              │
              ▼
app/data/data.tsx: getData()
  - Currency conversion (convertToBrl)
  - KPI formulas (Invested, Costs, Realized/Unrealized Profits, Margins)
  - Portfolio aggregations (Treemap product buckets, FII sectors, 24m Dividends)
              │
              ▼
app/page.tsx (Async Server Component)
  - await getData() runs at request time on the server
  - ConfigProvider injects Ant Design theme
              │
              ▼
app/charts/* ('use client' Components)
  - Card.tsx: KPI Metric Cards
  - TreemapChart.tsx, BarChart.tsx, LollipopChart.tsx, LineChart.tsx
  - Interactive D3 SVG rendering, hover events, and Tooltip overlays
```

- Data acquisition and heavy calculations run exclusively on the server at request time.
- Chart components receive pre-aggregated, serializable data as props and handle mathematical SVG scaling and user interactivity in the browser.

### 2. Dual Data Source Strategy (`DATASOURCE`)

Personal Finance Dashboard supports zero-dependency offline development alongside production BigQuery:
- **Production (`DATASOURCE=db`)**: Connects to Google Cloud BigQuery via `@google-cloud/bigquery` using credentials decoded from `process.env.GCP_KEY_ENCODED` and queries dataset `process.env.DB_SCHEMA`.
- **Mock Mode (`DATASOURCE=mock` or unconfigured)**: Reads local CSV files from `app/data/mock/` using Node.js `fs.readFileSync` and `d3.csvParse`.

> **Rule**: Keep database queries and filesystem reads strictly encapsulated within `app/data/`. Never import `@google-cloud/bigquery` or `fs` into presentation components.

### 3. Server vs Client Component Boundaries & Dynamic Vercel Functions

The project adheres strictly to the React Server Components (RSC) boundary paradigm:
- **`app/page.tsx` is an on-demand Dynamic Server Component**: Configured with `export const dynamic = 'force-dynamic'`, `export const revalidate = 0`, and `export const maxDuration = 60`. It is compiled by Next.js and deployed on Vercel as a Serverless Function executing `getData()` at request time so BigQuery changes reflect dynamically without redeployment.
- **`app/api/finance/route.ts` is a Vercel Route Function**: Exposes `GET /api/finance` with `force-dynamic` and `maxDuration = 60` returning the complete portfolio dataset in JSON format.
- **`app/charts/*` components are Client Components**: Every chart file (`BarChart.tsx`, `LineChart.tsx`, `LollipopChart.tsx`, `TreemapChart.tsx`) must declare `'use client'` at the top to support local interactivity (`useState`, `useMemo`, SVG pointer events).
- **Transient UI State**: Tooltip states (`interactionData: InteractionData | null`) remain strictly isolated within individual chart components.

### 4. Financial Calculation Engine & KPIs

All financial calculations follow standardized mathematical models defined in `app/data/data.tsx`:
- **Currency Conversion (`convertToBrl`)**: Multiplies foreign amounts by exchange rates (`exchange` table); domestic Brazilian Real positions (`country === 'BR'`) pass through with 1:1 identity.
- **Total Invested**: $\sum \text{convertToBrl}(\text{total\_invested}_i, \text{country}_i)$.
- **Total Cost**: $\left(\sum \text{cost}_i\right) + \text{cost\_brl}_{\text{exchange}}$.
- **Profit Executed (Realized)**: $\sum \text{convertToBrl}(\text{profit\_executed}_i, \text{country}_i)$.
  - *Cryptocurrency Exception*: Cryptocurrencies (`country === 'Bitcoin'`) report realized profit already in BRL, so country is normalized to `'BR'` to prevent double conversion.
- **Profit to Execute (Unrealized)**: Uses explicit `profit_to_execute` if provided; otherwise derives unrealized profit as $\text{convertToBrl}(\text{total\_invested}) - \text{cost}$.
- **Total Profit**: $\text{profitExecuted} + \text{profitToExecute}$.
- **Profit Margins**: Ratios relative to total cost:
  - $\text{profitExecutedMargin} = \text{profitExecuted} / \text{cost}$
  - $\text{profitToExecuteMargin} = \text{profitToExecute} / \text{cost}$
  - $\text{profitMargin} = \text{profit} / \text{cost}$

### 5. D3 Visualization System & SVG Architecture

- **React owns the DOM/SVG nodes**: All `<svg>`, `<g>`, `<rect>`, `<path>`, `<circle>`, `<line>`, and `<text>` elements are declared in JSX. D3 is used strictly as a mathematical layout and scaling engine.
- **Base Chart Scaffold (`app/charts/components/BaseChart.tsx`)**: All charts wrap their SVG contents in `<BaseChart>`, standardizing the title heading, relative container, SVG dimensions, inner coordinate translation (`margin.left`, `margin.top`), and HTML tooltip positioning.
- **Axis Generator (`app/charts/components/Axis.tsx`)**: Reusable SVG axis component handling linear and time scales, tick marks, zero-tick options, and formatted labels.
- **Tooltip System (`app/aux/Tooltip.tsx`)**: Absolute-positioned HTML overlay positioned via SVG coordinate calculations with chart-specific styling (`.tooltip.bar`, `.tooltip.line`, `.tooltip.default`).
- **Inner Dimensions Resolution (`app/aux/Utils.tsx`)**: Inner chart bounds must always be computed via `getDims({ svgDims, margin })`.
- **Memoization**: D3 scales (`scaleLinear`, `scaleBand`, `scaleTime`, `scaleOrdinal`), hierarchies, and path curves must always be memoized via `useMemo` based on `[data, width, height]`.

### 6. Design System, Theming & Tokens

- **Dark Theme Palette**: Dark slate background gradient (`#28282B` to `#000000`), white typography (`#FFFFFF`), platinum axis lines (`#E5E4E2`), steel blue primary accents (`#4e79a7`), and vibrant orange divergent markers (`#f28e2c`) configured in `app/globals.css`.
- **Ant Design Tokens (`theme/themeConfig.ts`)**: `colorPrimary: '#1E88E5'`, `fontSize: 16`.
- **D3 Palettes (`app/aux/Constants.tsx`)**: Categorical color scale from `d3.schemeTableau10`; Sequential color scale from `d3.schemeBlues[9]`.
- **SSR Style Registry (`lib/AntdRegistry.tsx`)**: Wraps the root layout with `@ant-design/cssinjs` style provider to eliminate Flash of Unstyled Content (FOUC) during server-side rendering.

---

## Repository structure

```text
personal-finance-dashboard/
├── .agents/                        # Specialized AI agent instructions and skills
│   └── skills/
│       ├── dashboard-architecture/ # App Router, RSC boundaries, 3-tier component model
│       ├── dashboard-data-layer/   # BigQuery integration, credentials, tables, mock CSVs
│       ├── dashboard-financial-engine/ # KPI formulas, margins, currency conversions
│       ├── dashboard-d3-charts/    # D3.js SVG visualizations, scales, axes, tooltips
│       ├── dashboard-design-system/# Dark theme tokens, Ant Design, CSS classes, formats
│       ├── dashboard-quality/      # Validation workflow, math audit, SVG checks, linting
│       └── dashboard-deployment/   # Environment config, GCP service accounts, Next.js build
│
├── app/                            # Next.js 14 App Router pages, charts & data logic
│   ├── layout.tsx                  # Root layout, Google Inter font, Metadata, AntdRegistry
│   ├── page.tsx                    # Primary dashboard Server Component (dynamic Vercel Function)
│   ├── globals.css                 # Global CSS variables, dark theme gradients, SVG classes
│   ├── icon.png                    # Application browser favicon
│   │
│   ├── api/                        # Next.js App Router API Route Handlers (Vercel Functions)
│   │   └── finance/
│   │       └── route.ts            # GET /api/finance endpoint returning portfolio JSON
│   │
│   ├── aux/                        # Core utilities, formatters, and TypeScript interfaces
│   │   ├── Constants.tsx           # D3 color palettes, default margins, barPadding
│   │   ├── Formats.tsx             # Centralized BRL currency & Percentage formatters
│   │   ├── Interfaces.tsx          # TypeScript contracts (Investment, Stock, Exchange, Kpis, etc.)
│   │   ├── Tooltip.tsx             # Dynamic HTML tooltip overlay component
│   │   └── Utils.tsx               # Chart dimension calculation (getDims)
│   │
│   ├── charts/                     # D3 visualization components ('use client')
│   │   ├── Card.tsx                # KPI metric card with vector illustrations
│   │   ├── BarChart.tsx            # Grouped FII sector bar chart with hover tooltips
│   │   ├── LineChart.tsx           # 24-month dividend curve with gradient defs
│   │   ├── LollipopChart.tsx       # Divergent horizontal lollipop comparison
│   │   ├── TreemapChart.tsx        # Hierarchical portfolio treemap allocation
│   │   └── components/             # Reusable SVG chart primitives
│   │       ├── BaseChart.tsx       # Standard SVG canvas frame, title & tooltip wrapper
│   │       └── Axis.tsx            # Reusable D3 linear and time axis renderer
│   │
│   └── data/                       # Data layer & data transformations
│       ├── connection.tsx          # GCP service account key decoder & BigQuery client config
│       ├── data.tsx                # Master getData() aggregator & KPI calculation engine
│       └── mock/                   # Offline development CSV mock files
│           └── .keepit             # Directory keep file
│
├── lib/                            # Library integration helpers
│   └── AntdRegistry.tsx            # Ant Design SSR styled-components style registry
│
├── public/                         # Public static assets & vector card illustrations
│   ├── profit_executed.svg         # Realized profit icon
│   ├── profit_executed_margin.svg  # Realized margin icon
│   ├── profit_to_execute.svg       # Unrealized profit icon
│   ├── profit_to_execute_margin.svg# Unrealized margin icon
│   └── total_invested.svg          # Total invested portfolio icon
│
├── theme/                          # Ant Design theme tokens
│   └── themeConfig.ts              # Ant Design token customization
│
├── .env.local.example              # Template for required environment variables
├── .eslintrc.json                  # ESLint configuration with eslint-config-next
├── .gitignore                      # Git ignore rules (secrets, build outputs, node_modules)
├── next.config.js                  # Next.js configuration
├── package.json                    # Project dependencies and npm scripts
├── postcss.config.js               # PostCSS configuration for Tailwind CSS
├── README.md                       # Project description and quickstart instructions
├── tailwind.config.ts              # Tailwind CSS configuration
└── tsconfig.json                   # TypeScript configuration
```

---

## UI & Component guidelines

### 1. Chart & Visual Primitive Discipline
- Always wrap SVG charts in `<BaseChart>` (`app/charts/components/BaseChart.tsx`) for consistent layout, titles, margins, and tooltips.
- Always use `Axis` (`app/charts/components/Axis.tsx`) for D3 axis rendering instead of manually coding SVG `<line>` and `<text>` ticks.
- Always format currency values with `BRL.format(num, compact)` from `app/aux/Formats.tsx`.
- Always format percentage metrics with `Percentage.format(num)` from `app/aux/Formats.tsx`.
- Never display raw unrounded floating-point numbers in the UI.
- Ant Design components must render inside `<ConfigProvider theme={theme}>` and be enclosed by `<StyledComponentsRegistry>` in `app/layout.tsx`.

### 2. Responsiveness & SVG Sizing
- All charts must compute inner SVG drawing dimensions via `getDims({ svgDims, margin })` from `app/aux/Utils.tsx`.
- Never hardcode manual pixel subtractions (`svgDims.width - 50`) inside chart renderers.
- Use responsive flex container wrappers (`flex flex-row items-stretch min-w-full`) to allow cards and charts to adapt to viewports cleanly.

### 3. Theming & Dark Mode
- Color values must align with the dark theme palette in `app/globals.css`.
- Chart element styling must use dedicated CSS class hooks:
  - `.axis-line`, `.axis-text`, `.axis-label`
  - `.tooltip`, `.tooltip.bar`, `.tooltip.line`
  - `.line.primary`, `.line.divergent`
  - `.circle.primary`, `.circle.divergent`
- Never hardcode arbitrary hex color strings directly into SVG attributes when theme tokens are available.

### 4. Anti-Patterns Matrix

| Requirement | Mandatory Pattern | Forbidden Anti-Pattern |
| :--- | :--- | :--- |
| **Monetary Metrics** | `BRL.format(value, true)` | `value.toFixed(2)` or raw float |
| **Percentages** | `Percentage.format(value)` | `${value * 100}%` without formatting |
| **Chart Scaffolding** | `<BaseChart title="..." ...>` | Custom `<div>` and `<svg>` without standard frame |
| **Axis Rendering** | `<Axis x={x} y={y} ... />` | Ad-hoc SVG `<line>` mapping in chart files |
| **Chart Inner Bounds**| `getDims({ svgDims, margin })` | Manual dimension subtraction |
| **Component Boundary**| Server Component for data fetching; `'use client'` for charts | Putting `'use client'` on `app/page.tsx` |
| **D3 Scales** | Wrapped in `useMemo` | Scale creation on every component render |
| **Data Layer** | BigQuery & `fs` calls isolated to `app/data/` | Direct database/fs queries in components |

---

## Development commands

Use commands defined in `package.json`:

```bash
# Start Next.js local development server (http://localhost:3000)
npm run dev

# Compile production application bundle
npm run build

# Start production server after building
npm run start

# Lint TypeScript and JSX files
npm run lint

# TypeScript typechecking
npx tsc --noEmit
```

---

## Validation procedure

After implementing any feature or fix, execute this validation sequence:

### Step 1 — Inspect the Git Diff
```bash
git diff
```
Verify that:
- Unrelated files and temporary test scripts were not modified.
- No secrets (`bigquery-key.json`, `.env.local`, or base64 keys) are staged.

### Step 2 — Type Checking
```bash
npx tsc --noEmit
```
Verify zero TypeScript compilation errors.

### Step 3 — ESLint
```bash
npm run lint
```
Verify code adheres to Next.js and React lint rules.

### Step 4 — Production Build Verification
```bash
npm run build
```
Verify that Next.js compiles the server and client bundles with zero errors.

### Step 5 — Data & Chart Rendering Audit
Verify that:
- All cards display formatted currency or percentage values.
- SVG paths contain no `NaN` or negative coordinate values.
- Hovering over chart elements displays correctly formatted tooltip overlays.
- Margin formulas protect against division by zero.

### Step 6 — Final Review
Confirm:
- Design tokens and CSS class hooks used exclusively.
- React Server Component boundaries strictly maintained.
- Currency conversion properly respects Bitcoin exception and exchange rates.

---

## Git rules

- Do not commit unless explicitly asked by the user.
- Before asking the user to commit, verify `git status` contains only intended changes.
- Never stage or commit `.env*.local` or `bigquery-key.json`.
- Keep changes modular, focused, and easily reviewable.

---

## Agent workflow

For substantial tasks, follow this structured workflow:

### Phase 1 — Understand
Inspect existing code and summarize:
- Current behavior and architecture.
- Relevant files and dependencies.
- Expected behavior changes.

### Phase 2 — Plan
Create a concise implementation plan:
- Files to create or modify.
- Schema / query adjustments (if any).
- Visual presentation or formula updates.
- Validation steps.

### Phase 3 — Reuse Check
Before creating new components, utilities, or helpers:
1. Search `app/charts/components/` for existing chart primitives (`BaseChart`, `Axis`).
2. Search `app/aux/` for existing formatters (`Formats.tsx`), constants, or utils.
3. Search `app/data/` for existing queries or aggregations.
4. State which existing primitives will be reused.

### Phase 4 — Implement
Implement one logical increment at a time with clean, typed code. Ensure TypeScript contracts in `app/aux/Interfaces.tsx` remain synchronized.

### Phase 5 — Validate
Run `npx tsc --noEmit`, `npm run lint`, and `npm run build`. Verify runtime rendering on local server.

### Phase 6 — Documentation
Review `README.md` and update it whenever a new feature, route, configuration, or architectural pattern is introduced.

### Phase 7 — Review
Inspect final `git diff` for unintended changes, duplicated code, or hardcoded styles.

### Phase 8 — Report
Give a concise summary:
```text
Implemented:
- ...

Validated:
- ...

Not validated:
- ...

Potential follow-up:
- ...

Reuse:
- Existing components reused: ...
- New components created: ...
- Reason new components were necessary: ...
```

---

## Skill usage

Project-specific Skills are located under:
```text
.agents/skills/
```

Available Personal Finance Dashboard skills:
- **`dashboard-architecture`**: Next.js 14 App Router, Server vs Client Component boundaries, Ant Design SSR registry, 3-tier component hierarchy.
- **`dashboard-data-layer`**: Google Cloud BigQuery integration, credentials parsing, table schemas, SQL queries, and mock CSV datasets.
- **`dashboard-financial-engine`**: Currency conversion (`convertToBrl`), KPI formulas, profit margins, Bitcoin realized profit exception, FII sector grouping, and 24-month dividend aggregations.
- **`dashboard-d3-charts`**: Custom D3.js v7 and SVG visualization primitives (`BaseChart`, `Axis`, `Tooltip`), scales, layouts (Treemap, Bar, Lollipop, Line), and hover interactions.
- **`dashboard-design-system`**: Dark theme design tokens, Ant Design configuration, Tailwind CSS utilities, SVG styling classes, Tableau/Blues color palettes, KPI cards, and BRL/Percentage formatters.
- **`dashboard-quality`**: Validation workflow, TypeScript type checking, Next.js linting, build verification, financial precision auditing, SVG math safety, and secrets audit.
- **`dashboard-deployment`**: Environment configuration (`.env.local`), Google Cloud BigQuery service account setup, Next.js production builds, Docker containerization, and hosting checklists.

Load specialized skills for detailed implementation rules rather than guessing conventions.

---

## Updating agent instructions

Do not modify `AGENTS.md` or files under `.agents/skills/` during normal feature implementation unless explicitly requested.

If an architectural decision or recurring pattern emerges that improves future agent work, mention it in the final report under "Potential instruction improvement."

---

## Priority

When instructions conflict, prioritize:
1. User's explicit request.
2. Financial data integrity and mathematical accuracy.
3. Existing Next.js 14 App Router, D3.js, and Ant Design architecture.
4. These project instructions.
5. Specialized Skills for the task.
6. General coding preferences.
