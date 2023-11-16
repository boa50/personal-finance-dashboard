// Based on: https://www.react-graph-gallery.com/line-chart
'use client'

import * as d3 from 'd3'
import { useMemo, useState } from 'react'
import { margin as defaultMargin } from '../aux/Constants'
import { LinePoint, InteractionData } from '../aux/Interfaces'
import { BRL } from '../aux/Formats'
import BaseChart from './BaseChart'
import { Tooltip } from '../aux/Tooltip'

interface ChartProps {
    data: Array<LinePoint>,
    svgDims: {
        width: number,
        height: number
    },
    title: string
}

const LineChart = ({ data, svgDims, title }: ChartProps) => {
    const svgWidth = svgDims.width
    const svgHeight = svgDims.height
    const margin = { ...defaultMargin }
    margin.left = 86
    const width = svgWidth - margin.left - margin.right
    const height = svgHeight - margin.top - margin.bottom
    const [interactionData, setInteractiondata] = useState<InteractionData | null>(null)

    const x = useMemo(() => {
        return d3
            .scaleTime()
            .domain(d3.extent(data, d => d.month) as [Date, Date])
            .range([0, width])
    }, [data, width])

    const y = useMemo(() => {
        return d3
            .scaleLinear()
            .domain([0, (d3.max(data, d => d.value) as number) * 1.05])
            .range([height, 0])
    }, [data, height])

    const linePath = useMemo(() => {
        const lineBuilder = d3
            .line<LinePoint>()
            .x(d => x(d.month))
            .y(d => y(d.value))

        return lineBuilder(data)
    }, [data, x, y]) as string

    const meanValue = useMemo(() => {
        return d3.mean(data, d => d.value)
    }, [data]) as number

    const meanLine = (
        <g key={'mean-line'}>
            <path
                className='axis-line'
                strokeDasharray='4 1'
                d={`M 0 ${y(meanValue)} H ${width}`}/>
            <text
                className='axis-text y'
                x={width}
                y={y(meanValue) - 10}
                alignmentBaseline='central'
            >
                {`Average: ${BRL.format(meanValue)}`}
            </text>
        </g>
    )

    const tooltips = data.map((d, i) => {
        return (
            <g key={i}
                onMouseEnter={() =>
                    setInteractiondata({
                        xPos: x(d.month),
                        yPos: y(d.value) as number,
                        label: d.month.toISOString().slice(0, 7),
                        value: BRL.format(d.value)
                    })
                }
                onMouseLeave={() => setInteractiondata(null)}
            >
                <circle
                    cx={x(d.month)}
                    cy={y(d.value)}
                    r={5}
                    className={'circle primary opacity-0 hover:opacity-100'} />
            </g>
        )
    })

    const xAxis = [(
        <path
            className='axis-line'
            key={'x-axis-line'}
            d={`M 0 ${height} H ${width}`}/>
    ),(x
        .ticks(8)
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
                    {value.toISOString().slice(0, 7)}
                </text>
            </g>
        )))]

    const yAxis = [(
        <path
            className='axis-line'
            key={'y-axis-line'}
            d={`M 0 0 V ${height}`}/>
    ),(y
        .ticks(8)
        .slice(1)
        .map((value, i) => (
            <g key={i} >
                <line
                    className='axis-line'
                    x1={-5}
                    x2={0}
                    y1={y(value)}
                    y2={y(value)} />
                <text
                    className='axis-text y'
                    x={-10}
                    y={y(value)}
                    alignmentBaseline='central'
                >
                    {BRL.format(value)}
                </text>
            </g>
        )))]

    return (
        <BaseChart title={title}>
            <div style={{ position: 'relative' }}>
                <svg width={svgWidth} height={svgHeight} id={`barchart-${title}`}>
                    <g 
                        width={width}
                        height={height}
                        transform={`translate(${[margin.left, margin.top].join(',')})`}>
                        <path
                            d={linePath}
                            className='line primary' />
                        {meanLine}
                        {tooltips}
                        {xAxis}
                        {yAxis}
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

export default LineChart