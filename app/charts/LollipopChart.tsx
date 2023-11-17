'use client'

import * as d3 from 'd3'
import { useState, useMemo } from 'react'
import { Lollipop, InteractionData } from '../aux/Interfaces'
import { colourSchemeCategorical, margin as defaultMargin, barPadding } from '../aux/Constants'
import { BRL, Percentage } from '../aux/Formats'
import BaseChart from './BaseChart'
import Tooltip from '../aux/Tooltip'

interface ChartProps {
    data: Array<Lollipop>,
    svgDims: {
        width: number,
        height: number
    },
    title: string
}

const LollipopChart = ({ data, svgDims, title }: ChartProps) => {
    const svgWidth = svgDims.width
    const svgHeight = svgDims.height
    const margin = { ...defaultMargin }
    margin.left = 54
    const width = svgWidth - margin.left - margin.right
    const height = svgHeight - margin.top - margin.bottom
    const [interactionData, setInteractiondata] = useState<InteractionData | null>(null) 

    const x = useMemo(() => {
        return d3
            .scaleLinear()
            .domain([0, d3.max(data, d => (d.value)) as number])
            .range([0, width])
    }, [data, width])

    const y = useMemo(() => {
        const labels = [...new Set(data.sort((a, b) => b.value - a.value).map(d => d.label))]

        return d3
            .scaleBand()
            .domain(labels)
            .range([0, height])
            .padding(barPadding)
    }, [data, height])

    const categories = useMemo(() => {return [...new Set(data.map(d => d.category))]}, [data]) 

    const colour = useMemo(() => {
        return d3
            .scaleOrdinal()
            .domain(categories.sort())
            .range(colourSchemeCategorical)
    }, [categories])

    const lollipops = data.map((d, i) => {
        const yPos = y(d.label)
        if (yPos === undefined) {
            return null
        }

        const isIncrease = d.value > d.valueInit
    
        return (
            <g key={i}
                onMouseEnter={() =>
                    setInteractiondata({
                        xPos: x(d.value),
                        yPos: y(d.label) as number,
                        label: `${d.label} (${d.category})`,
                        value: `${BRL.format(d.value)} </br> ${Percentage.format((d.value - d.valueInit) / d.valueInit)}`
                    })
                }
                onMouseLeave={() => setInteractiondata(null)}
            >
                <line 
                    x1={x(d.valueInit)}
                    x2={x(d.value)}
                    y1={y(d.label) as number + y.bandwidth() / 2}
                    y2={y(d.label) as number + y.bandwidth() / 2}
                    opacity={0.9}
                    stroke={colour(d.category) as string}
                    strokeDasharray={!isIncrease ? '3' : '0'}
                    strokeWidth={3} />
                <circle
                    cy={y(d.label) as number + y.bandwidth() / 2}
                    cx={x(d.valueInit)}
                    opacity={0.9}
                    stroke={colour(d.category) as string}
                    strokeWidth={1}
                    r={5} />
                <circle
                    cy={y(d.label) as number + y.bandwidth() / 2}
                    cx={x(d.value)}
                    opacity={0.9}
                    stroke={colour(d.category) as string}
                    fill={colour(d.category) as string}
                    strokeWidth={1}
                    r={5} />
                <text
                    x={x(isIncrease ? d.valueInit : d.value) - 12}
                    y={yPos + y.bandwidth() / 2}
                    className='axis-label lollipop'
                    alignmentBaseline='central'
                >
                    {d.label}
                </text>
            </g>
        )
    })

    const xAxis = [(
        <path
            className='axis-line'
            key={'x-axis-line'}
            d={`M 0 ${height} H ${width}`}/>
    ),(x
        .ticks(7)
        .slice(1)
        .map((value, i) => (
            <g key={i} >
                <line
                    className='axis-line'
                    x1={x(value)}
                    x2={x(value)}
                    y1={height}
                    y2={height + 5} />
                <text
                    className='axis-text x'
                    x={x(value)}
                    y={height + margin.bottom - 5}
                    alignmentBaseline='central'
                >
                    {BRL.format(value, true)}
                </text>
            </g>
        )))]

    const legend = <g className='legend'>
        <rect 
            fill='white' 
            x={width - 155}
            y={height - 150}
            width={Math.max(...(categories.map(d => d.length))) * 8 + 15}
            height={categories.length * 22}
            fillOpacity={0.15}
        />
        {categories.map((d, i) => (
            <g key={`legend-${i}`}>
                <rect
                    x={width - 147}
                    y={height - 140 + i * 20}
                    width={12}
                    height={12}
                    fill={colour(d) as string}
                    fillOpacity={0.9}
                    rx={3}
                />
                <text
                    x={width - 130}
                    y={height - 130 + i * 20}
                >
                    {d}
                </text>
            </g>
        ))}
    </g>

    return (
        <BaseChart title={title}>
            <div style={{ position: 'relative' }}>
                <svg width={svgWidth} height={svgHeight} id={`lollipopchart-${title}`}>
                    <g 
                        width={width}
                        height={height}
                        transform={`translate(${[margin.left, margin.top].join(',')})`}>
                        {lollipops}
                        {xAxis}
                        {legend}
                    </g>
                </svg>
                <Tooltip 
                    interactionData={interactionData} 
                    dims={{ 
                        width: width, 
                        height: height, 
                        margin:{ 
                            left: margin.left, 
                            top: margin.top 
                        } 
                    }}
                    chartType='line' />
            </div>
        </BaseChart>
    )
}

export default LollipopChart