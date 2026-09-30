---
name: dashboard-d3-charts
description: Use when creating, modifying, or styling D3.js SVG charts, axes, tooltips, scales, treemaps, bar charts, lollipop charts, line charts, or data visualizations in personal-finance-dashboard.
---

# Personal Finance Dashboard — D3.js Visualization Engine

## Goal

Provide responsive, visually refined, and mathematically accurate custom SVG charts using D3.js v7 and React Server/Client boundaries.

---

## 1. D3 + React Architecture Model

Personal Finance Dashboard pairs React with D3 following this strict paradigm:
- **React owns the DOM and SVG elements**: All `<svg>`, `<g>`, `<path>`, `<rect>`, `<circle>`, `<line>`, and `<text>` tags are declared directly in JSX.
- **D3 is used as a pure mathematical generator**: D3 generates scales (`scaleLinear`, `scaleBand`, `scaleTime`, `scaleOrdinal`), shapes (`line()`, `curveMonotoneX()`), hierarchies (`hierarchy()`, `treemap()`), and color interpolators.
- **Client Boundary**: Every chart component file under `app/charts/` begins with `'use client'`.

```text
Data Props from Server Component
              │
              ▼
Inner Dimensions (app/aux/Utils.tsx: getDims)
  - width = svgDims.width - margin.left - margin.right
  - height = svgDims.height - margin.top - margin.bottom
              │
              ▼
D3 Mathematical Scales & Layouts (useMemo)
  - x scale (scaleBand, scaleLinear, scaleTime)
  - y scale (scaleLinear: domain [0, max * 1.05], range [height, 0])
  - color scale (scaleOrdinal: domain categories, range Tableau10/Blues)
  - Layout generators (d3.treemap, d3.line().curve(d3.curveMonotoneX))
              │
              ▼
React JSX Rendering
  - <BaseChart>: Frame, Title, SVG Canvas (<svg width, height>), <g transform>
  - <Axis>: Reusable X and Y ticks, lines, and text
  - Visual Elements: <rect>, <path>, <circle>, <line>
  - <Tooltip>: HTML overlay positioned via interactionData (xPos, yPos)
```

---

## 2. Foundation Primitives (`app/charts/components/`, `app/aux/`)

### `BaseChart` (`app/charts/components/BaseChart.tsx`)
The standard scaffold for all charts:
```tsx
<BaseChart 
    title={title}
    interactionData={interactionData}
    svgDims={svgDims}
    width={width}
    height={height}
    margin={margin}>
    {/* SVG child elements render inside translated <g> */}
</BaseChart>
```
- Sets up relative positioning container.
- Renders `<h2>` chart title using `text-neutral-200`.
- Renders SVG canvas with `svgDims.width` and `svgDims.height`.
- Wraps chart content inside `<g transform="translate(margin.left, margin.top)">`.
- Injects `<Tooltip>` overlay aligned to inner dimensions.

### `Axis` (`app/charts/components/Axis.tsx`)
Configurable SVG axis generator:
- **Props**:
  - `x`: `ScaleTime` or `ScaleLinear`.
  - `y`: `ScaleLinear`.
  - `width`, `height`, `margin`.
  - `xFormatter`, `yFormatter`: Custom formatting functions.
  - `xTicks`, `yTicks`: Number of tick subdivisions (default: 8).
  - `xTicksShow0`, `yTicksShow0`: Whether to render the origin tick (default: `false`).
- Renders `.axis-line` paths and `.axis-text` labels with precise SVG text anchoring (`middle` for X, `end` for Y).

### `Tooltip` (`app/aux/Tooltip.tsx`)
Absolute-positioned HTML overlay:
- Driven by `interactionData: InteractionData | null` (`xPos`, `yPos`, `label`, `value`).
- Supports modifier classes via `chartType`:
  - `'default'`: `transform: translate(-50%, -50%)`.
  - `'bar'`: `transform: translate(-50%, -25%)`.
  - `'line'`: `transform: translate(10%, -50%)`.
- Uses `pointerEvents: 'none'` to avoid interfering with SVG cursor events.

---

## 3. Chart Implementations (`app/charts/`)

### 1. `TreemapChart` (`app/charts/TreemapChart.tsx`)
- **Visual Goal**: Proportional area representation of portfolio asset allocation by product.
- **Hierarchy Generation**:
  ```typescript
  const hierarchy = useMemo(() => {
      const tree: Tree = { type: 'node', label: 'all', value: 0, children: data }
      return d3.hierarchy(tree).sum(d => d.value)
  }, [data])
  ```
- **Treemap Generator**: `d3.treemap<TreeNode>().size([width, height]).padding(4)`.
- **Tile Styling**: Uses sequential blue gradient (`colourSchemeSequential`) based on position.
- **Label Inset**: Checks if tile width/height exceed minimum boundaries before rendering labels.

### 2. `BarChart` (`app/charts/BarChart.tsx`)
- **Visual Goal**: Grouped real estate sector distribution (FIIs by segment).
- **Scales**:
  - X: `d3.scaleBand().domain(labels).range([0, width]).padding(barPadding)`
  - Y: `d3.scaleLinear().domain([0, max * 1.05]).range([height, 0])`
  - Color: `d3.scaleOrdinal().domain(categories).range(colourSchemeCategorical)`
- **Hover Interaction**:
  On mouse enter, triggers `setInteractiondata` with:
  ```typescript
  setInteractiondata({
      xPos: xPos + x.bandwidth() / 2,
      yPos: y(d.value) - 10,
      label: d.label,
      value: `${BRL.format(d.value)} (${Percentage.format(d.value / totalValue)})`
  })
  ```
- **Legend & Axes**: Toggleable via `legend` and `axis` props.

### 3. `LollipopChart` (`app/charts/LollipopChart.tsx`)
- **Visual Goal**: Asset-by-asset comparison between initial purchase value and current market value.
- **Layout**:
  - Horizontal stems from `0` (or initial cost) to current total invested `x(d.value)`.
  - Stems rendered as `<line className="line primary">`.
  - Endpoints rendered as `<circle className="circle primary" r={4}>`.
  - Y-axis band scale for individual ticker symbols.

### 4. `LineChart` (`app/charts/LineChart.tsx`)
- **Visual Goal**: Trailing 24-month dividend payment timeline.
- **Curve Builder**:
  ```typescript
  const lineBuilder = d3.line<LinePoint>()
      .x(d => x(d.month))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX)
  ```
- **SVG Gradient Defs**: Renders smooth gradient fills for area fills and primary stroke lines.
- **Markers & Hitboxes**: Renders circles at each monthly data point with expanded transparent hitboxes for easy hover interaction.

---

## 4. Layout & Dimensions Computation

All charts compute inner SVG drawing boundaries via `getDims` (`app/aux/Utils.tsx`):
```typescript
const margin = { ...defaultMargin, left: 72, bottom: 64 }
const { width, height } = getDims({ svgDims, margin })
```
- In SVG coordinates, `(0, 0)` is the **top-left** of the transformed group.
- Linear Y-scales map minimum value `0` to `height` (bottom) and maximum value to `0` (top).

---

## 5. Visualization Rules & Best Practices

1. **Strict Memoization**: Always memoize D3 scales, hierarchy computations, and path builders with `useMemo`. Never recompute scales on every render frame.
2. **Prevent Layout Overflow**: Ensure SVG dimensions (`svgDims`) match the parent container width.
3. **No Direct DOM Mutation**: Never use `d3.select()`, `d3.append()`, or `d3.remove()` to mutate React DOM nodes. Use JSX elements for all SVG rendering.
4. **Clean Tooltip Dismissal**: Always attach `onMouseLeave={() => setInteractiondata(null)}` to SVG hover elements to prevent stuck tooltips.
5. **Chart Consistency**: Always wrap chart visualizations inside `<BaseChart>`.
