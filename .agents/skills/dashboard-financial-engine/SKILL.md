---
name: dashboard-financial-engine
description: Use when modifying financial calculations, KPI formulas, profit/loss calculations, profit margins, currency conversions, FII groupings, or dividend aggregations in personal-finance-dashboard.
---

# Personal Finance Dashboard — Financial Engine & Calculations

## Goal

Ensure computational precision, accurate multi-currency normalization, and consistent portfolio performance analytics across all financial metrics and data aggregations.

---

## 1. Financial Pipeline Architecture

```text
Raw Database / Mock Entities (investments, stocks, exchange, exchange_cost, dividends)
                                       │
                                       ▼
                     Currency Conversion Engine (convertToBrl)
                      - Identity match (country === 'BR')
                      - Exchange rate lookup (exchange.from === country)
                                       │
                                       ▼
                   Core Mathematical Formulations (Kpis Object)
                      - totalInvested: Sum of converted investments
                      - cost: Base cost + exchange spread cost
                      - profitExecuted: Realized gains (Crypto in BRL)
                      - profitToExecute: Unrealized market gains
                      - profit = profitExecuted + profitToExecute
                      - margins = profit / cost
                                       │
                                       ▼
                    Portfolio & Time-Series Aggregations
                      - Treemap: Grouped by product, filtered > 0
                      - FIIs Grouped: Grouped by sector, sorted descending
                      - FIIs Detail: Initial balance vs total invested
                      - Dividends: Rolling 24 months, sorted chronologically
```

---

## 2. Currency Conversion Model (`convertToBrl`)

All assets and foreign positions are converted to Brazilian Real (BRL) as the unified base currency:

```typescript
const convertToBrl = (value: number, country: string) => {
    const filteredExch = exchange.filter(f => f.from == country)

    return country !== 'BR' ? value * +filteredExch[0].rate : value
}
```

### Conversion Precedence
1. **Domestic Positions (`country === 'BR'`)**: Returned directly with 1:1 identity without conversion.
2. **Foreign Positions (`country !== 'BR'`)**: Look up `exchange` row where `from === country` and multiply `value * rate`.

---

## 3. Core KPIs & Mathematical Formulations (`Kpis`)

The master `kpis` object in `app/data/data.tsx` defines the headline financial indicators:

### 1. Total Invested (`totalInvested`)
Sum of current total invested amounts across all asset positions converted to BRL:
$$\text{totalInvested} = \sum \text{convertToBrl}(\text{total\_invested}_i, \text{country}_i)$$

### 2. Total Cost (`cost`)
Combined initial capital outlay plus international exchange and transfer costs in BRL:
$$\text{cost} = \left(\sum \text{cost}_i\right) + \text{cost\_brl}_{\text{exchange}}$$

### 3. Profit Executed (`profitExecuted` — Realized Profit)
Realized profit resulting from sold positions or closed trades converted to BRL:
$$\text{profitExecuted} = \sum \text{convertToBrl}(\text{profit\_executed}_i, \text{normalizedCountry}_i)$$

> [!IMPORTANT]
> **Cryptocurrency Exception**: Cryptocurrencies (where `country === 'Bitcoin'`) report realized profit already in BRL from local exchange transactions. Therefore, the country code is normalized:
> ```typescript
> d.country === 'Bitcoin' ? 'BR' : d.country
> ```

### 4. Profit to Execute (`profitToExecute` — Unrealized Profit)
Unrealized paper profit of open portfolio positions:
```typescript
profitToExecute = investments.reduce((total, d) => 
    total + 
    (d.profit_to_execute ? 
        convertToBrl(+d.profit_to_execute, d.country) : 
        (convertToBrl(+d.total_invested, d.country) - +d.cost))
, 0)
```
- If explicit `profit_to_execute` is recorded in the table, it is converted to BRL.
- Otherwise, unrealized profit is derived as `convertToBrl(total_invested) - cost`.

### 5. Total Profit (`profit`)
$$\text{profit} = \text{profitExecuted} + \text{profitToExecute}$$

### 6. Profit Margins
Performance percentages relative to total acquisition cost:
- **Executed Margin**: `profitExecutedMargin = profitExecuted / cost`
- **To Execute Margin**: `profitToExecuteMargin = profitToExecute / cost`
- **Total Profit Margin**: `profitMargin = profit / cost`

---

## 4. Aggregations & Visual Datasets

### 1. Investments Distribution (`treemapData`)
- Aggregated by `product` (e.g. Equities, FIIs, International, Crypto, Treasury):
  ```typescript
  const treemapData = [...d3.group(investments, d => d.product)]
      .map(d => ({
          type: 'leaf',
          label: d[0],
          country: d[1][0].country,
          value: d3.sum(d[1], d => convertToBrl(+d.total_invested, d.country))
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value) as Array<Tree>
  ```
- Strips non-positive allocations and sorts largest positions first.

### 2. FII Detail Holdings (`fiiData`)
- Maps individual real estate investment trusts to `Lollipop` points:
  - `label`: Ticker symbol (e.g. `HGLG11`, `KNIP11`).
  - `valueInit`: Initial balance / purchase cost (`+d.balance`).
  - `value`: Current market value / total invested (`+d.total_invested`).
  - `category`: FII segment sector (e.g. Logistics, Shopping, Paper, Corporate).

### 3. FIIs Grouped by Sector (`fiiDataGrouped`)
- Sums invested capital per `fii_sector`:
  ```typescript
  const fiiDataGrouped = [...d3.group(fiiData, d => d.category)]
      .map(d => ({ 
          label: d[0], 
          value: d3.sum(d[1], d => d.value),
          category: d[0]
      }))
      .sort((a, b) => b.value - a.value)
  ```

### 4. Dividends Time Series (`dividends`)
- Aggregates income payments received by calendar month over the trailing 24-month window:
  ```typescript
  const dividends = [...d3.group(await getDividends(), d => d.month.value)]
      .map(d => ({
          month: new Date(d[0]),
          value: d3.sum(d[1], d => convertToBrl(+d.amount, d.country))
      }))
      .sort((a, b) => a.month.getTime() - b.month.getTime())
  ```
- Always sorted chronologically (`a.month - b.month`) for smooth line chart rendering.

---

## 5. Calculation Rules & Edge-Case Safeguards

1. **Avoid Double Conversion**: Once a position is converted via `convertToBrl()`, downstream aggregations must treat it as native BRL.
2. **Division by Zero Protection**: Margin calculations (`profit / cost`) must safeguard against zero or negative costs by defaulting to `0` or preserving `-1` error flags.
3. **Array Null Checks**: When filtering foreign exchange rates (`exchange.filter(f => f.from == country)`), guarantee that `filteredExch[0]` exists before accessing `.rate` to avoid runtime crashes.
4. **Number Coercion**: Always parse strings to numbers with `+value` before invoking arithmetic operations or `d3.sum()`.
