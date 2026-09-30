---
name: dashboard-design-system
description: Use when modifying UI components, dark theme tokens, Ant Design theme configuration, Tailwind styling, SVG chart styling, color palettes, formatters, or KPI cards in personal-finance-dashboard.
---

# Personal Finance Dashboard — Design System & Tokens

## Goal

Provide a consistent, accessible, and high-contrast dark theme financial design system uniting Ant Design v5, Tailwind CSS, and custom D3 SVG visualizations.

---

## 1. Design Token Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Global CSS Variables                            │
│                     (app/globals.css: :root)                           │
│  - --foreground-hex: #FFFFFF           (Primary text)                  │
│  - --background-start-hex: #28282B     (Dark slate gradient start)     │
│  - --background-end-hex: #000000       (Onyx gradient end)             │
│  - --axis-hex: #E5E4E2                 (Platinum chart axes & labels)  │
│  - --chart-primary: #4e79a7            (Classic Tableau steel blue)    │
│  - --chart-divergent: #f28e2c          (Tableau vibrant orange)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
┌─────────────────────────────────┐   ┌──────────────────────────────────┐
│        Ant Design Tokens        │   │        D3 Color Palettes         │
│     (theme/themeConfig.ts)      │   │      (app/aux/Constants.tsx)     │
│  - colorPrimary: #1E88E5        │   │  - colourSchemeCategorical       │
│  - fontSize: 16                 │   │    (d3.schemeTableau10)          │
│                                 │   │  - colourSchemeSequential        │
│                                 │   │    (d3.schemeBlues[9])           │
└─────────────────────────────────┘   └──────────────────────────────────┘
```

---

## 2. Formatting Utilities (`app/aux/Formats.tsx`)

Financial metrics must always be formatted via the centralized helpers:

### Brazilian Real Currency (`BRL.format`)
```typescript
BRL.format(value: number, compact?: boolean)
```
- **Standard**: Formats as Brazilian Real currency (`R$ 1.234,56`) using `Intl.NumberFormat('pt-BR')`.
- **Compact (`compact = true`)**: Replaces standard metric abbreviations with standard financial notation:
  - Replaces `'mil'` with `'K'`.
  - Replaces `'mi'` with `'M'`.
  - Example: `R$ 125,4K` or `R$ 1,2M`.
- Used across all KPI cards, chart tooltips, and axis tick labels.

### Percentage Formatter (`Percentage.format`)
```typescript
Percentage.format(num: number): string => `${(num * 100).toFixed(2)} %`
```
- Multiplies decimal ratio by 100 and formats to 2 decimal places.
- Example: `0.1425` -> `'14.25 %'`.

---

## 3. Metric KPI Cards (`app/charts/Card.tsx`)

The headline portfolio summary is presented through five specialized metric cards:

| Card Title | Value Prop | Format | Vector Icon (`public/*.svg`) |
| :--- | :--- | :--- | :--- |
| **Total Invested** | `kpis.totalInvested` | `'BRL'` (compact) | `total_invested.svg` |
| **Profit Executed** | `kpis.profitExecuted` | `'BRL'` (compact) | `profit_executed.svg` |
| **Profit Executed Margin** | `kpis.profitExecutedMargin` | `'Percentage'` | `profit_executed_margin.svg` |
| **Profit to Execute** | `kpis.profitToExecute` | `'BRL'` (compact) | `profit_to_execute.svg` |
| **Profit to Execute Margin**| `kpis.profitToExecuteMargin` | `'Percentage'` | `profit_to_execute_margin.svg` |

### Card Component Structure
- Built with Tailwind utility classes: flex column, padding, border radius, background elevation.
- Includes title heading, large bold formatted value, and vector image icon positioned on the right.

---

## 4. SVG & Chart CSS Classes (`app/globals.css`)

D3 chart elements inherit styling via dedicated CSS class hooks:

| Class Name | Target Element | Visual Appearance & Behavior |
| :--- | :--- | :--- |
| **`.axis-line`** | `<path>`, `<line>` | `stroke: var(--axis-hex)`. Subdued 1px axis stroke. |
| **`.axis-text`** | `<text>` | `fill: var(--axis-hex); font-size: 10px;`. Axis tick values. |
| **`.axis-text.x`** | `<text>` | `text-anchor: middle;` (centered horizontally below ticks). |
| **`.axis-text.y`** | `<text>` | `text-anchor: end;` (right-aligned preceding ticks). |
| **`.axis-label`** | `<text>` | `fill: var(--axis-hex); font-size: 12px; font-weight: 600;`. |
| **`.legend`** | `<text>` | `fill: var(--axis-hex); text-anchor: start; font-size: 12px;`. |
| **`.tooltip`** | `<div>` | `background-color: rgba(0, 0, 0, 0.8); border-radius: 4px; color: white;`. |
| **`.tooltip.bar`** | `<div>` | `transform: translate(-50%, -25%);` |
| **`.tooltip.line`** | `<div>` | `transform: translate(10%, -50%);` |
| **`.line`** | `<path>` | `fill: none; stroke-width: 3;` |
| **`.line.primary`** | `<path>` | `stroke: var(--chart-primary);` |
| **`.line.divergent`**| `<path>` | `stroke: var(--chart-divergent);` |
| **`.circle.primary`**| `<circle>` | `fill: var(--chart-primary);` |
| **`.circle.divergent`**| `<circle>`| `fill: var(--chart-divergent);` |

---

## 5. Design System Standards & Anti-Patterns

| Requirement | Mandatory Pattern | Forbidden Anti-Pattern |
| :--- | :--- | :--- |
| **Monetary Values** | `BRL.format(value, true)` | `value.toFixed(2)` or raw unformatted float |
| **Percentage Metrics**| `Percentage.format(margin)` | `${margin * 100}%` without precision control |
| **Axis Styling** | CSS class `.axis-line`, `.axis-text` | Inline `stroke="#FFF"` hardcoded in JSX |
| **Color Schemes** | `colourSchemeCategorical` / `Sequential` | Ad-hoc random hex array in chart component |
| **Card Layout** | `<Card title="..." value="..." format="..." image="..." />` | Ad-hoc unstyled `<div>` container |
| **SVG Dimensions** | `getDims({ svgDims, margin })` | Manual subtraction `svgDims.width - 50` |
| **Theme Injection** | `<ConfigProvider theme={theme}>` | Bypassing Ant Design theme context |
