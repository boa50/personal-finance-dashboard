import { Fragment } from "react"
import { Margin } from "@/app/aux/Interfaces"

interface Props {
    x?: d3.ScaleTime<number, number, never> | d3.ScaleLinear<number, number, never>
    y?: d3.ScaleLinear<number, number, never>
    width: number
    height: number
    margin: Margin
    xFormatter?: (value: any) => string
    yFormatter?: (value: any) => string
    xTicks?: number
    xTicksShow0?: boolean
    yTicks?: number
    yTicksShow0?: boolean
}

const Axis = ({ x, y, width, height, margin, xFormatter, yFormatter, xTicks=8, xTicksShow0=false, yTicks=8, yTicksShow0=false }: Props) => {
    let xAxis = null
    if (x) {
        xAxis = [(
            <path
                className='axis-line'
                key={'x-axis-line'}
                d={`M 0 ${height} H ${width}`}/>
        ),(x
            .ticks(xTicks)
            .slice(xTicksShow0 ? 0 : 1)
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
                        {xFormatter ? xFormatter(value) : value.toString()}
                    </text>
                </g>
            )))]
    }

    let yAxis = null
    if (y) {
        yAxis = [(
            <path
                className='axis-line'
                key={'y-axis-line'}
                d={`M 0 0 V ${height}`}/>
        ),(y
            .ticks(yTicks)
            .slice(yTicksShow0 ? 0 : 1)
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
                        {yFormatter ? yFormatter(value): value}
                    </text>
                </g>
            )))]
    }

    return(
        <Fragment>
            {xAxis}
            {yAxis}
        </Fragment>
    )
}

export default Axis