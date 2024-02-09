// Based on: https://www.react-graph-gallery.com/treemap
'use client'

import * as d3 from 'd3'
import { useMemo, useState } from 'react'
import { margin, colourSchemeSequential } from '../aux/Constants'
import BaseChart from './components/BaseChart'
import { Tree, TreeNode, InteractionData, SvgDims } from '../aux/Interfaces'
import { BRL, Percentage } from '../aux/Formats'
import { getDims } from '../aux/Utils'

interface ChartProps {
    data: Array<Tree>
    svgDims: SvgDims
    title: string
}

const TreemapChart = ({ data, svgDims, title }: ChartProps) => {
    const { width, height } = getDims({ svgDims, margin })
    const [interactionData, setInteractiondata] = useState<InteractionData | null>(null)

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

    const totalInvested = useMemo(() => {
        return d3.sum(data, d => d.value)
    }, [data])

    const treemap = root.leaves().map((leaf, i) => {
        return (
            // <g key={`leaf-${leaf.data.label}`}
            <g key={i}
                onMouseEnter={() =>
                    setInteractiondata({
                        xPos: leaf.x0 + ((leaf.x1 - leaf.x0) / 2),
                        yPos: leaf.y0 + ((leaf.y1 - leaf.y0) / 2),
                        label: leaf.data.label,
                        value: `${Percentage.format(leaf.data.value / totalInvested)} 
                        </br> ${BRL.format(leaf.data.value)}`
                    })
                }
                onMouseLeave={() => setInteractiondata(null)}
            >
                <rect
                    x={leaf.x0}
                    y={leaf.y0}
                    width={leaf.x1 - leaf.x0}
                    height={leaf.y1 - leaf.y0}
                    stroke='transparent'
                    fill={colour(leaf.data.label) as string}
                    className={'opacity-80 hover:opacity-100'}
                />
                <text
                    x={leaf.x0 + 10}
                    y={leaf.y0 + 10}
                    fontSize={12}
                    textAnchor='start'
                    alignmentBaseline='hanging'
                    fill='white'
                    className='font-medium'
                >
                    {leaf.data.label}
                </text>
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
            {treemap}
        </BaseChart>
    )
}

export default TreemapChart