// Base code got from: https://www.react-graph-gallery.com/barplot
'use client'

import * as d3 from 'd3'
import { useMemo, useState } from 'react'
import { Bar, InteractionData } from '../aux/Interfaces'
import { Tooltip } from '../aux/Tooltip'
import { BRL } from '../aux/Formats'
import { colourSchemeCategorical, margin, barPadding } from '../aux/Constants'
import BaseChart from './BaseChart'

interface ChartProps {
    data: Array<Bar>,
    svgDims: {
        width: number,
        height: number
    },
    title: string
}

const BarChart = ({ data, svgDims, title }: ChartProps) => {
    const svgWidth = svgDims.width
    const svgHeight = svgDims.height
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
            .domain(categories)
            .range(colourSchemeCategorical)
    }, [categories])

    const bars = data.map((d, i) => {
        const yPos = y(d.label)
        if (yPos === undefined) {
            return null
        }
    
        return (
            <g key={i}
                onMouseEnter={() =>
                    setInteractiondata({
                        xPos: x(d.value),
                        yPos: y(d.label) as number,
                        label: `${d.label} (${d.category})`,
                        value: BRL.format(d.value)
                    })
                }
                onMouseLeave={() => setInteractiondata(null)}
            >
                <rect
                    x={x(0)}
                    y={y(d.label)}
                    width={x(d.value)}
                    height={y.bandwidth()}
                    fill={colour(d.category) as string}
                    fillOpacity={0.9}
                    rx={3} />
                <text
                    x={x(0) + 7}
                    y={yPos + y.bandwidth() / 2}
                    className='axis-label'
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
                    {value}
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
                <svg width={svgWidth} height={svgHeight} id={`barchart-${title}`}>
                    <g 
                        width={width}
                        height={height}
                        transform={`translate(${[margin.left, margin.top].join(',')})`}>
                        {bars}
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
                    chartType='bar' />
            </div>
        </BaseChart>
    )
}

export default BarChart