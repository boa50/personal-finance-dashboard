// Based on: https://www.react-graph-gallery.com/line-chart
'use client'

import * as d3 from 'd3'
import { useMemo, useState } from 'react'
import { margin as defaultMargin } from '../aux/Constants'
import { LinePoint, InteractionData, SvgDims } from '../aux/Interfaces'
import { BRL } from '../aux/Formats'
import { getDims } from '../aux/Utils'
import BaseChart from './components/BaseChart'
import Axis from './components/Axis'

interface ChartProps {
    data: Array<LinePoint>
    svgDims: SvgDims
    title: string
}

const LineChart = ({ data, svgDims, title }: ChartProps) => {
    const margin = { ...defaultMargin }
    margin.left = 86
    const { width, height } = getDims({ svgDims, margin })
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
                y={y(meanValue) + 10}
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

    return (
        <BaseChart 
            title={title}
            svgDims={svgDims}
            width={width}
            height={height}
            margin={margin}
            interactionData={interactionData}
        >
            <path
                d={linePath}
                className='line primary' />
            {meanLine}
            {tooltips}
            <Axis 
                x={x}
                y={y}
                width={width}
                height={height}
                margin={margin}
                xFormatter={(value: Date) => value.toISOString().slice(0, 7)}
                yFormatter={(value: number) => BRL.format(value, true)}
                xTicksShow0={true} />
        </BaseChart>
    )
}

export default LineChart