// Base code got from: https://www.react-graph-gallery.com/barplot

import * as d3 from 'd3'
import { useMemo } from 'react'

interface ChartProps {
    data: {label: string, value: number, category: string}[],
    svgDims: {
        width: number,
        height: number
    }
}

const BarChart = (props: ChartProps) => {
    const svgWidth = props.svgDims.width
    const svgHeight = props.svgDims.height
    const margin = {
        left: 16,
        right: 16,
        top: 16,
        bottom: 16
    }
    const width = svgWidth - margin.left - margin.right
    const height = svgHeight - margin.top - margin.bottom
    const barPadding = 0.2

    const data = props.data

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
    }, [data, height, barPadding])

    const colour = useMemo(() => {
        const categories = [...new Set(data.map(d => d.category))]

        return d3
            .scaleOrdinal()
            .domain(categories)
            .range(d3.schemeTableau10)
    }, [data])

    const bars = data.map((d, i) => {
        const yPos = y(d.label)
        if (yPos === undefined) {
            return null
        }
    
        return (
            <g key={i}>
                <rect
                    x={x(0)}
                    y={y(d.label)}
                    width={x(d.value)}
                    height={y.bandwidth()}
                    fill={colour(d.category) as string}
                    fillOpacity={0.7}
                    rx={1}
                />
                <text
                    x={x(0) + 7}
                    y={yPos + y.bandwidth() / 2}
                    textAnchor="start"
                    fill='yellow'
                    alignmentBaseline="central"
                    fontSize={12}
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
                    className='axis-text'
                    x={x(value)}
                    y={height + margin.bottom - 5}
                    alignmentBaseline="central"
                >
                    {value}
                </text>
            </g>
        )))]

    return (
        <svg width={svgWidth} height={svgHeight} id="barchart">
            <g 
                width={width}
                height={height}
                transform={`translate(${[margin.left, margin.top].join(',')})`}>
                {bars}
                {xAxis}
            </g>
        </svg>
    )
}

export default BarChart