---
name: dashboard-quality
description: Use when reviewing, testing, debugging, type-checking, linting, or validating personal-finance-dashboard changes before they are considered complete.
---

# Personal Finance Dashboard — Quality & Validation

## Goal

Ensure zero regressions, strict adherence to TypeScript and Next.js standards, mathematical precision across financial metrics, and flawless SVG chart rendering.

---

## 1. Quality Standards Overview

Before any modification to Personal Finance Dashboard is marked as complete, it must satisfy four core pillars:
1. **Compilation & Type Safety**: Zero TypeScript compilation errors (`npx tsc --noEmit`).
2. **Code Hygiene**: Zero ESLint errors or warnings (`npm run lint`).
3. **Build Feasibility**: Successful Next.js production build (`npm run build`).
4. **Mathematical & Visual Integrity**: Verified KPI formulas, non-NaN SVG attributes, and smooth tooltip interactivity.

---

## 2. Standard Validation Workflow

Follow this step-by-step verification pipeline after implementing any change:

### Step 1 — Inspect the Git Diff
```bash
git diff
```
Verify that:
- Only intended files were modified.
- No temporary debug `console.log()` statements or test buttons remain.
- No secrets (`bigquery-key.json`, `.env.local`, or base64 keys) are staged.

### Step 2 — TypeScript Compilation Check
```bash
npx tsc --noEmit
```
Confirm zero TypeScript compilation errors across all `.ts` and `.tsx` files.

### Step 3 — Code Linting
```bash
npm run lint
```
Confirm zero ESLint errors or warnings under `eslint-config-next`.

### Step 4 — Next.js Production Build
```bash
npm run build
```
Verify that:
- Server Components compile cleanly.
- Client Components bundle without missing imports or dynamic SSR violations.
- Static generation and route types succeed.

### Step 5 — Local Development Verification
```bash
npm run dev
```
Test modified workflows on http://localhost:3000:
- Cards display formatted BRL currency (`R$ ...`) and percentages.
- Charts render SVG paths without clipping.
- Hovering over bars, lines, or treemap tiles displays the correct tooltips.

---

## 3. Financial & Mathematical Integrity Checklist

- [ ] **Division by Zero Protection**: Margin calculations (`profitExecutedMargin`, `profitToExecuteMargin`, `profitMargin`) handle zero or negative costs gracefully.
- [ ] **Realized Crypto Profit**: Cryptocurrencies (where `country === 'Bitcoin'`) correctly map to `'BR'` in `convertToBrl()` to prevent double conversion.
- [ ] **Unrealized Profit Fallback**: `profitToExecute` properly calculates `convertToBrl(total_invested) - cost` when `profit_to_execute` is not explicitly provided.
- [ ] **Date Sorting**: Dividend time-series data is sorted chronologically (`a.month - b.month`) to avoid erratic zig-zag paths in `LineChart`.
- [ ] **Treemap Leaf Filter**: Non-positive investments (`value <= 0`) are filtered out of `treemapData` to prevent D3 hierarchy layout failures.

---

## 4. SVG & D3 Rendering Quality Checklist

- [ ] **No `NaN` in SVG Attributes**: Attributes such as `x`, `y`, `width`, `height`, and `d` must never contain `NaN`, `undefined`, or negative dimensions.
- [ ] **Inner Dimensions Calculation**: All inner bounds are derived via `getDims({ svgDims, margin })`.
- [ ] **Memoized Scales**: All D3 scales (`x`, `y`, `colour`, `hierarchy`, `root`, `lineBuilder`) are wrapped in `useMemo`.
- [ ] **Tooltip Cleanup**: All interactive SVG elements trigger `onMouseLeave={() => setInteractiondata(null)}`.
- [ ] **Inverted Y Axis**: Linear SVG Y-scales correctly map domain `[0, max]` to range `[height, 0]`.

---

## 5. Security & Secrets Hygiene Checklist

- [ ] `bigquery-key.json` is ignored by `.gitignore` and never committed.
- [ ] `.env*.local` is ignored by `.gitignore` and never committed.
- [ ] `GCP_KEY_ENCODED` is stored solely in local environment variables or deployment secret managers.
- [ ] No database schema names or project IDs are hardcoded in application logic.
