// Based on: https://www.react-graph-gallery.com/treemap
'use client'

import * as d3 from 'd3'
import { useMemo, useState } from 'react'
import { margin, colourSchemeSequential } from '../aux/Constants'
import BaseChart from './components/BaseChart'
import { Tree, TreeNode, InteractionData, SvgDims } from '../aux/Interfaces'
import { BRL, Percentage } from '../aux/Formats'
import { getDims } from '../aux/Utils'
import { useResponsiveDims } from '../aux/useResponsiveDims'

interface ChartProps {
    data: Array<Tree>
    svgDims?: Partial<SvgDims>
    title: string
}

const TreemapChart = ({ data, svgDims: propSvgDims, title }: ChartProps) => {
    const { containerRef, svgDims } = useResponsiveDims(propSvgDims, 400)
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
            .range(Array.prototype.reverse.call([...colourSchemeSequential]))
    }, [hierarchy])

    const totalInvested = useMemo(() => {
        return d3.sum(data, d => d.value)
    }, [data])

    const treemap = root.leaves().map(leaf => {
        const tileWidth = leaf.x1 - leaf.x0
        const tileHeight = leaf.y1 - leaf.y0
        const showLabel = tileWidth > 45 && tileHeight > 24

        // Responsive font size and padding according to tile dimensions
        const fontSize = tileWidth >= 160 && tileHeight >= 100 ? 15 : tileWidth >= 90 && tileHeight >= 50 ? 14 : 12
        const paddingTop = tileHeight >= 100 ? 16 : 12
        const paddingX = tileWidth < 70 ? 8 : (tileWidth >= 180 ? 16 : 12)

        const words = leaf.data.label.split(' ')
        const shouldWrap = words.length > 1 && tileWidth < 80

        return (
            <g key={`leaf-${leaf.data.label}`}
                onMouseEnter={() =>
                    setInteractiondata({
                        xPos: leaf.x0 + (tileWidth / 2),
                        yPos: leaf.y0 + (tileHeight / 2),
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
                    width={tileWidth}
                    height={tileHeight}
                    stroke='transparent'
                    fill={colour(leaf.data.label) as string}
                    className={'opacity-80 hover:opacity-100'}
                />
                {showLabel ? (
                    <text
                        x={leaf.x0 + paddingX}
                        y={leaf.y0 + paddingTop}
                        fontSize={fontSize}
                        textAnchor='start'
                        dominantBaseline='hanging'
                        alignmentBaseline='hanging'
                        fill='white'
                        className='font-semibold select-none pointer-events-none'
                    >
                        {shouldWrap ? (
                            words.map((word, idx) => (
                                <tspan
                                    key={idx}
                                    x={leaf.x0 + paddingX}
                                    dy={idx === 0 ? 0 : `${fontSize * 1.25}px`}
                                >
                                    {word}
                                </tspan>
                            ))
                        ) : (
                            leaf.data.label
                        )}
                    </text>
                ) : null}
            </g>
        )
    })

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
                {treemap}
            </BaseChart>
        </div>
    )
}

export default TreemapChart