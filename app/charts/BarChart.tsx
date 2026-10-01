// Base code got from: https://www.react-graph-gallery.com/barplot
'use client'

import * as d3 from 'd3'
import { useMemo, useState } from 'react'
import { Bar, InteractionData, SvgDims } from '../aux/Interfaces'
import { BRL } from '../aux/Formats'
import { colourSchemeCategorical, margin as defaultMargin, barPadding } from '../aux/Constants'
import { getDims } from '../aux/Utils'
import { useResponsiveDims } from '../aux/useResponsiveDims'
import BaseChart from './components/BaseChart'
import Axis from './components/Axis'

interface ChartProps {
    data: Array<Bar>
    svgDims?: Partial<SvgDims>
    title: string
    legend?: boolean
    axis?: boolean
}

const BarChart = ({ data, svgDims: propSvgDims, title, legend = false, axis = true }: ChartProps) => {
    const { containerRef, svgDims } = useResponsiveDims(propSvgDims, 400)
    const margin = {
        top: 16,
        right: 24,
        bottom: 32,
        left: svgDims.width < 360 ? 100 : 115
    }
    const { width, height } = getDims({ svgDims, margin })
    const [interactionData, setInteractiondata] = useState<InteractionData | null>(null) 

    const labels = useMemo(() => {
        return [...new Set(data.sort((a, b) => b.value - a.value).map(d => d.label))]
    }, [data])

    const y = useMemo(() => {
        return d3
            .scaleBand()
            .domain(labels)
            .range([0, height])
            .padding(barPadding)
    }, [labels, height])

    const x = useMemo(() => {
        return d3
            .scaleLinear()
            .domain([0, (d3.max(data, d => d.value) as number) * 1.05])
            .range([0, width])
    }, [data, width])

    const categories = useMemo(() => {return [...new Set(data.map(d => d.category))]}, [data]) 

    const colour = useMemo(() => {
        return d3
            .scaleOrdinal()
            .domain(categories.sort())
            .range(colourSchemeCategorical)
    }, [categories])

    const bars = data.map((d, i) => {
        const yPos = y(d.label)
        if (yPos === undefined) {
            return null
        }
        const barWidth = x(d.value)
    
        return (
            <g key={i}
                onMouseEnter={() =>
                    setInteractiondata({
                        xPos: barWidth,
                        yPos: yPos + y.bandwidth() / 2,
                        label: d.label,
                        value: BRL.format(d.value)
                    })
                }
                onMouseLeave={() => setInteractiondata(null)}
            >
                <rect
                    x={0}
                    y={yPos}
                    width={barWidth}
                    height={y.bandwidth()}
                    fill={colour(d.category) as string}
                    fillOpacity={0.9}
                    rx={3}
                    className='opacity-90 hover:opacity-100 transition-opacity'
                />
                <text
                    x={-10}
                    y={yPos + y.bandwidth() / 2}
                    className='axis-label bar'
                    dominantBaseline='central'
                    alignmentBaseline='central'
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
                {bars}
                {axis ? 
                    <Axis
                        width={width}
                        height={height}
                        margin={margin}
                        x={x}
                        xTicks={svgDims.width < 360 ? 3 : 5}
                        xFormatter={(value: number) => BRL.format(value, true)} /> 
                    : null}
                {legend ? legendGroup : null}
            </BaseChart>
        </div>
    )
}

export default BarChart