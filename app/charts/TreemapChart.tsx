// Based on: https://www.react-graph-gallery.com/treemap

import * as d3 from 'd3'
import { useMemo } from 'react'
import { margin, colourSchemeSequential } from '../aux/Constants'
import BaseChart from './BaseChart'
import { Tree, TreeNode } from '../aux/Interfaces'
import { BRL } from '../aux/Formats'

interface ChartProps {
    data: Array<Tree>,
    svgDims: {
        width: number,
        height: number
    },
    title: string
}

const TreemapChart = ({ data, svgDims, title }: ChartProps) => {
    const svgWidth = svgDims.width
    const svgHeight = svgDims.height
    const width = svgWidth - margin.left - margin.right
    const height = svgHeight - margin.top - margin.bottom

    const hierarchy = useMemo(() => {
        const tree: Tree = {
            type: 'node',
            label: 'all',
            value: 0,
            children: data
        }

        return d3.hierarchy(tree).sum((d) => d.value)
    }, [data])

    const root = useMemo(() => {
        const treeGenerator = d3.treemap<TreeNode>().size([width, height]).padding(4)
        return treeGenerator(hierarchy)
    }, [hierarchy, width, height])

     

    const colour = useMemo(() => {
        const categories = [...new Set(hierarchy.data.children.map(d => d.label))]

        return d3
            .scaleOrdinal()
            .domain(categories)
            .range(colourSchemeSequential.toReversed())
    }, [hierarchy])

    const treemap = root.leaves().map(leaf => {
        return (
            <g key={`leaf-${leaf.data.label}`}>
                <rect
                    x={leaf.x0}
                    y={leaf.y0}
                    width={leaf.x1 - leaf.x0}
                    height={leaf.y1 - leaf.y0}
                    stroke="transparent"
                    fill={colour(leaf.data.label) as string}
                    className={"opacity-80 hover:opacity-100"}
                />
                <text
                    x={leaf.x0 + 3}
                    y={leaf.y0 + 3}
                    fontSize={12}
                    textAnchor="start"
                    alignmentBaseline="hanging"
                    fill="white"
                    className="font-bold"
                >
                    {leaf.data.label}
                </text>
                <text
                    x={leaf.x0 + 3}
                    y={leaf.y0 + 18}
                    fontSize={12}
                    textAnchor="start"
                    alignmentBaseline="hanging"
                    fill="white"
                    className="font-light"
                >
                    {BRL.format(leaf.data.value)}
                </text>
            </g>
        )
    })
    

    return (
        <BaseChart title={title}>
            <div style={{ position: 'relative' }}>
                <svg width={svgWidth} height={svgHeight} id={`treemap-${title}`}>
                    <g 
                        width={width}
                        height={height}
                        transform={`translate(${[margin.left, margin.top].join(',')})`}>
                        {treemap}
                    </g>
                </svg>
            </div>
        </BaseChart>
    )
}

export default TreemapChart