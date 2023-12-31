// Base code got from: https://www.react-graph-gallery.com/barplot
'use client'

import * as d3 from 'd3'
import { useMemo, useState } from 'react'
import { Bar, InteractionData, SvgDims } from '../aux/Interfaces'
import { BRL } from '../aux/Formats'
import { colourSchemeCategorical, margin as defaultMargin, barPadding } from '../aux/Constants'
import { getDims } from '../aux/Utils'
import BaseChart from './components/BaseChart'
import Axis from './components/Axis'

interface ChartProps {
    data: Array<Bar>
    svgDims: SvgDims
    title: string
    legend?: boolean
    axis?: boolean
}

const BarChart = ({ data, svgDims, title, legend = true, axis = true }: ChartProps) => {
    const margin = { ...defaultMargin }
    margin.bottom = 64
    margin.left = 72
    const { width, height } = getDims({ svgDims, margin })
    const [interactionData, setInteractiondata] = useState<InteractionData | null>(null) 

    const y = useMemo(() => {
        return d3
            .scaleLinear()
            .domain([0, (d3.max(data, d => (d.value)) as number) * 1.05])
            .range([height, 0])
    }, [data, height])

    const x = useMemo(() => {
        const labels = [...new Set(data.sort((a, b) => b.value - a.value).map(d => d.label))]

        return d3
            .scaleBand()
            .domain(labels)
            .range([0, width])
            .padding(barPadding)
    }, [data, width])

    const categories = useMemo(() => {return [...new Set(data.map(d => d.category))]}, [data]) 

    const colour = useMemo(() => {
        return d3
            .scaleOrdinal()
            .domain(categories.sort())
            .range(colourSchemeCategorical)
    }, [categories])

    const bars = data.map((d, i) => {
        const xPos = x(d.label)
        if (xPos === undefined) {
            return null
        }
    
        return (
            <g key={i}
                onMouseEnter={() =>
                    setInteractiondata({
                        xPos: x(d.label) as number,
                        yPos: y(d.value),
                        label: d.label,
                        value: BRL.format(d.value)
                    })
                }
                onMouseLeave={() => setInteractiondata(null)}
            >
                <rect
                    x={x(d.label)}
                    y={y(d.value)}
                    width={x.bandwidth()}
                    height={y(0) - y(d.value)}
                    fill={colour(d.category) as string}
                    fillOpacity={0.9}
                    rx={3} />
                <text
                    x={xPos}
                    y={y(0) + 7}
                    className='axis-label bar'
                    alignmentBaseline='central'
                    transform={`rotate(-20 ${xPos + 7} ${y(0) - x.bandwidth() * 1.25})`}
                >
                    {d.label}
                </text>
            </g>
        )
    })

    const legendGroup = <g className='legend'>
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
        <BaseChart 
            title={title}
            svgDims={svgDims}
            width={width}
            height={height}
            margin={margin}
            interactionData={interactionData}
        >
            {bars}
            {axis ? 
                <Axis
                    width={width}
                    height={height}
                    margin={margin}
                    y={y}
                    yFormatter={(value: number) => BRL.format(value, true)} /> 
                : null}
            {legend ? legendGroup : null}
        </BaseChart>
    )
}

export default BarChart