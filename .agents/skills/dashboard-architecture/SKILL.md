---
name: dashboard-architecture
description: Use when modifying the application architecture, Next.js 14 App Router layout, server vs client component boundaries, Ant Design SSR integration, or 3-tier component hierarchy in personal-finance-dashboard.
---

# Personal Finance Dashboard — Application Architecture

## Goal

Maintain a high-performance, cleanly separated Next.js 14 App Router architecture combining server-side financial data aggregation with interactive D3.js and Ant Design client visualizations.

---

## 1. High-Level System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                          Data Ingestion Tier                            │
│  - Google Cloud BigQuery (Production / DB mode: DATASOURCE='db')        │
│  - Local CSV Files (Development / Mock mode: DATASOURCE='mock')         │
│  - BigQuery Client & Credentials Service (app/data/connection.tsx)      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Data Layer & Financial Engine                      │
│  - app/data/data.tsx: getData()                                         │
│  - Currency conversion (convertToBrl via exchange rates)                │
│  - KPI aggregation (Invested, Costs, Realized/Unrealized Profits)       │
│  - Time-series grouping (Dividends rolling 24-month window)             │
│  - Portfolio hierarchy (Treemap grouping) & FII sector aggregation      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   Server Component Shell (Next.js 14)                   │
│  - app/layout.tsx: Root layout, Google Inter font, Metadata             │
│  - lib/AntdRegistry.tsx: Ant Design SSR StyledComponentsRegistry        │
│  - app/page.tsx: Async Server Component calling await getData()         │
│  - ConfigProvider: Theme injection (theme/themeConfig.ts)               │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│             Presentation & D3 Visualization Layer ('use client')        │
│  - app/charts/Card.tsx: KPI Metric Cards with vector icons              │
│  - app/charts/TreemapChart.tsx: D3 Hierarchy & Treemap Layout           │
│  - app/charts/BarChart.tsx: D3 Categorical Bar Chart + Legend           │
│  - app/charts/LollipopChart.tsx: D3 Horizontal Divergent Lollipop       │
│  - app/charts/LineChart.tsx: D3 Curvature Time-Series Line + Area       │
│  - app/charts/components/BaseChart.tsx: Common SVG Canvas & Frame       │
│  - app/charts/components/Axis.tsx: D3 Linear & Time Axis Generator     │
│  - app/aux/Tooltip.tsx: Dynamic HTML Tooltip Overlay                    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 3-Tier Component Hierarchy

### Tier 1 — Visual Primitives & Chart Foundation (`app/charts/components/`, `app/aux/`)
Pure, reusable foundation primitives responsible for chart scaffolding, math scaling, axis generation, and tooltips:
- **`BaseChart`** (`app/charts/components/BaseChart.tsx`): Standard SVG wrapper establishing the coordinate system (`translate(margin.left, margin.top)`), title heading, and tooltip container.
- **`Axis`** (`app/charts/components/Axis.tsx`): Reusable D3 axis generator supporting both `scaleTime` and `scaleLinear`, zero-tick suppression, custom formatters, and tick lines.
- **`Tooltip`** (`app/aux/Tooltip.tsx`): Absolute-positioned overlay positioned by SVG coordinates with chart-specific styling (`.tooltip.bar`, `.tooltip.line`, `.tooltip.default`).
- **`Formats`** (`app/aux/Formats.tsx`): Centralized numeric and currency formatters (`BRL.format` with compact K/M support, `Percentage.format`).
- **`Constants`** (`app/aux/Constants.tsx`): Standard chart margins (`left: 16`, `right: 16`, `top: 16`, `bottom: 20`), `barPadding = 0.2`, `colourSchemeCategorical` (Tableau10), `colourSchemeSequential` (Blues9).
- **`Utils`** (`app/aux/Utils.tsx`): Chart dimension resolution (`getDims({ svgDims, margin })`).

### Tier 2 — Domain Composite Visualizations (`app/charts/`)
Domain-specific charts and metric cards binding financial data to interactive D3 layouts:
- **`Card`** (`app/charts/Card.tsx`): KPI metric card displaying title, formatted value (`BRL` or `Percentage`), and vector icon illustration (`totalInvested`, `profitExecuted`, `profitExecutedMargin`, `profitToExecute`, `profitToExecuteMargin`).
- **`TreemapChart`** (`app/charts/TreemapChart.tsx`): Hierarchical investment product breakdown using `d3.hierarchy` and `d3.treemap` with sequential blue coloring and boundary-aware label fitting.
- **`BarChart`** (`app/charts/BarChart.tsx`): Grouped FII sector distribution with categorical Tableau10 coloring, interactive tooltips, and optional legend/axes.
- **`LollipopChart`** (`app/charts/LollipopChart.tsx`): Horizontal lollipop comparison visualizing initial balance vs total invested per asset with category color coding.
- **`LineChart`** (`app/charts/LineChart.tsx`): Rolling 24-month dividend trend line with smooth `d3.curveMonotoneX` interpolation, SVG gradient definitions, and interactive circular hover markers.

### Tier 3 — Application Shell & Server Routes (`app/`, `lib/`, `theme/`)
Top-level Next.js route handlers managing server data acquisition, metadata, and styling context:
- **`app/layout.tsx`**: HTML root layout configuring Next.js font optimization (`Inter`), global stylesheets (`globals.css`), and the Ant Design SSR style registry.
- **`lib/AntdRegistry.tsx`**: Client-side styled-components registry intercepting Ant Design inline styles for flicker-free Server-Side Rendering (SSR).
- **`app/page.tsx`**: Async React Server Component executing `await getData()`, laying out the dashboard grid, and passing structured datasets to client charts.
- **`theme/themeConfig.ts`**: Ant Design theme token configuration (`colorPrimary: '#1E88E5'`, `fontSize: 16`).

---

## 3. Server vs Client Component Boundaries

Personal Finance Dashboard strictly enforces the React Server Components (RSC) boundary model:

### Server Component Rules (`app/page.tsx`, `app/layout.tsx`)
- `app/page.tsx` must remain an **async Server Component**. Never add `'use client'` to `page.tsx`.
- Data fetching occurs exclusively on the server at request time via `await getData()`.
- Server Components have direct access to backend resources: GCP BigQuery SDK, Node.js `fs`, environment secrets (`process.env.GCP_KEY_ENCODED`).
- Server Components pass serializable plain JavaScript objects and arrays (`kpis`, `fiiData`, `treemapData`, etc.) to client chart components as props.

### Client Component Rules (`app/charts/*`)
- All chart components utilizing D3 interactivity, browser DOM events, `useState`, or `useMemo` must start with `'use client'`.
- Client components receive immutable data props from Server Components and compute D3 scales and layout geometry locally.
- Tooltip states (`interactionData: InteractionData | null`) remain strictly local to each chart component.

---

## 4. Ant Design & SSR Styled-Components Registry

To prevent Flash of Unstyled Content (FOUC) when rendering Ant Design v5 components on Next.js 14 App Router:
- `lib/AntdRegistry.tsx` utilizes `@ant-design/cssinjs` with `createCache()` and `useServerInsertedHTML`.
- All Ant Design widgets (`ConfigProvider`, etc.) must render within `StyledComponentsRegistry` in `app/layout.tsx`.
- Dark theme tokens in `theme/themeConfig.ts` harmonize with global CSS variables in `app/globals.css`.

---

## 5. Architectural Constraints & Rules

1. **Server-Side Data Security**: Never query BigQuery or read mock CSV files directly inside client components. All database queries and filesystem reads belong in `app/data/`.
2. **Preserve RSC Boundary**: Keep `app/page.tsx` as a Server Component. Do not convert the entire page into a client component to handle local state.
3. **Memoize D3 Computations**: All D3 scales (`scaleLinear`, `scaleBand`, `scaleTime`, `scaleOrdinal`), treemap generators, and line curves must be wrapped in `useMemo` dependent on `[data, width, height]`.
4. **Coordinate Consistency**: Always use `getDims({ svgDims, margin })` from `app/aux/Utils.tsx` to compute inner chart bounds. Never compute inner SVG dimensions with ad-hoc subtraction.
5. **Format Standard**: All displayed monetary numbers must be formatted via `BRL.format()` from `app/aux/Formats.tsx`. All percentage metrics must use `Percentage.format()`. Never display raw unformatted floating point values to the user.
6. **No External Chart Libraries**: D3.js v7 is the sole visualization standard. Do not introduce Recharts, Chart.js, Victory, or highcharts.
