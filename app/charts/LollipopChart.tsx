'use client'

import * as d3 from 'd3'
import { useState, useMemo } from 'react'
import { Lollipop, InteractionData, SvgDims } from '../aux/Interfaces'
import { colourSchemeCategorical, margin as defaultMargin, barPadding } from '../aux/Constants'
import { BRL, Percentage } from '../aux/Formats'
import { getDims } from '../aux/Utils'
import { useResponsiveDims } from '../aux/useResponsiveDims'
import BaseChart from './components/BaseChart'
import Axis from './components/Axis'

interface ChartProps {
    data: Array<Lollipop>
    svgDims?: Partial<SvgDims>
    title: string
    legend?: boolean
}

const LollipopChart = ({ data, svgDims: propSvgDims, title, legend = false }: ChartProps) => {
    const { containerRef, svgDims } = useResponsiveDims(propSvgDims, 400)
    const margin = {
        top: 16,
        right: 24,
        bottom: 32,
        left: 60
    }
    const { width, height } = getDims({ svgDims, margin })
    const [interactionData, setInteractiondata] = useState<InteractionData | null>(null) 

    const maxValue = useMemo(() => {
        const max = d3.max(data, d => Math.max(d.value, d.valueInit)) || 0
        return max * 1.05
    }, [data])

    const x = useMemo(() => {
        return d3
            .scaleLinear()
            .domain([0, maxValue])
            .range([0, width])
    }, [maxValue, width])

    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => b.value - a.value)
    }, [data])

    const labels = useMemo(() => {
        return sortedData.map(d => d.label)
    }, [sortedData])

    const y = useMemo(() => {
        return d3
            .scaleBand()
            .domain(labels)
            .range([0, height])
            .padding(barPadding)
    }, [labels, height])

    const categories = useMemo(() => {
        return [...new Set(data.map(d => d.category))]
    }, [data]) 

    const colour = useMemo(() => {
        return d3
            .scaleOrdinal()
            .domain(categories.sort())
            .range(colourSchemeCategorical)
    }, [categories])

    const lollipops = sortedData.map((d, i) => {
        const yPos = y(d.label)
        if (yPos === undefined) {
            return null
        }
        const isIncrease = d.value >= d.valueInit
        const yCenter = yPos + y.bandwidth() / 2
        const minX = Math.min(x(d.valueInit), x(d.value))

        return (
            <g 
                key={d.label || i}
                className='cursor-pointer'
                onMouseEnter={() =>
                    setInteractiondata({
                        xPos: x(d.value),
                        yPos: yCenter,
                        label: `${d.label} (${d.category})`,
                        value: `Atual: ${BRL.format(d.value)}<br/>Custo: ${BRL.format(d.valueInit)}<br/>Variação: ${Percentage.format((d.value - d.valueInit) / (d.valueInit || 1))}`
                    })
                }
                onMouseLeave={() => setInteractiondata(null)}
            >
                {/* Transparent hit area for row-level hover interaction */}
                <rect
                    x={-margin.left}
                    y={yPos}
                    width={width + margin.left}
                    height={y.bandwidth()}
                    fill='transparent'
                />

                {/* Subtle horizontal guide from Y-axis to dumbbell start */}
                <line 
                    x1={0}
                    x2={minX}
                    y1={yCenter}
                    y2={yCenter}
                    stroke='rgba(255, 255, 255, 0.12)'
                    strokeDasharray='2 2'
                    strokeWidth={1}
                />

                {/* Dumbbell connecting stem */}
                <line 
                    x1={x(d.valueInit)}
                    x2={x(d.value)}
                    y1={yCenter}
                    y2={yCenter}
                    opacity={0.9}
                    stroke={colour(d.category) as string}
                    strokeDasharray={!isIncrease ? '3 2' : undefined}
                    strokeWidth={3}
                />

                {/* Initial cost circle (hollow) */}
                <circle
                    cy={yCenter}
                    cx={x(d.valueInit)}
                    opacity={0.9}
                    stroke={colour(d.category) as string}
                    strokeWidth={2}
                    fill='#1e1e24'
                    r={4.5}
                />

                {/* Current market value circle (filled) */}
                <circle
                    cy={yCenter}
                    cx={x(d.value)}
                    opacity={0.9}
                    stroke={colour(d.category) as string}
                    fill={colour(d.category) as string}
                    strokeWidth={1}
                    r={4.5}
                />

                {/* Ticker symbol neatly aligned on the left Y-axis */}
                <text
                    x={-10}
                    y={yCenter}
                    className='axis-label lollipop'
                    dominantBaseline='central'
                    alignmentBaseline='central'
                >
                    {d.label}
                </text>
            </g>
        )
    })

    const legendGroup = (
        <g className='legend'>
            <rect 
                fill='#18181b'
                x={width - 145}
                y={height - (categories.length * 20 + 56)}
                width={140}
                height={categories.length * 20 + 50}
                fillOpacity={0.9}
                stroke='rgba(255, 255, 255, 0.15)'
                rx={4}
            />
            <g key='legend-increase'>
                <line 
                    x1={width - 137}
                    x2={width - 122}
                    y1={height - (categories.length * 20 + 42)}
                    y2={height - (categories.length * 20 + 42)}
                    className='opacity-90 stroke-stone-200 stroke-[3px]'
                />
                <text
                    x={width - 116}
                    y={height - (categories.length * 20 + 38)}
                >
                    Increase
                </text>
            </g>
            <g key='legend-decrease'>
                <line 
                    x1={width - 137}
                    x2={width - 122}
                    y1={height - (categories.length * 20 + 24)}
                    y2={height - (categories.length * 20 + 24)}
                    className='opacity-90 stroke-stone-200 stroke-[3px]'
                    strokeDasharray='3 2'
                />
                <text
                    x={width - 116}
                    y={height - (categories.length * 20 + 20)}
                >
                    Decrease
                </text>
            </g>
            <line 
                x1={width - 145}
                x2={width - 5}
                y1={height - (categories.length * 20 + 10)}
                y2={height - (categories.length * 20 + 10)}
                className='opacity-30 stroke-gray-400 stroke-1'
                strokeDasharray='3'
            />
            {categories.map((d, i) => (
                <g key={`legend-${i}`}>
                    <rect
                        x={width - 137}
                        y={height - categories.length * 20 + i * 20}
                        width={12}
                        height={12}
                        fill={colour(d) as string}
                        fillOpacity={0.9}
                        rx={3}
                    />
                    <text
                        x={width - 118}
                        y={height - categories.length * 20 + i * 20 + 10}
                    >
                        {d}
                    </text>
                </g>
            ))}
        </g>
    )

    return (
        <div ref={containerRef} className='w-full'>
            <BaseChart 
                title={title}
                svgDims={svgDims}
                width={width}
                height={height}
                margin={margin}
                interactionData={interactionData}
            >
                <line x1={0} x2={0} y1={0} y2={height} className='axis-line' />
                {lollipops}
                <Axis
                    width={width}
                    height={height}
                    margin={margin} 
                    x={x}
                    xTicks={svgDims.width < 360 ? 3 : 5}
                    xFormatter={(value: number) => BRL.format(value, true)} 
                />
                {legend && width >= 450 ? legendGroup : null}
            </BaseChart>
        </div>
    )
}

export default LollipopChart