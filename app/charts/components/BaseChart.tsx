import { useState, useRef } from "react"
import Tooltip from "@/app/aux/Tooltip"
import { InteractionData, Margin, SvgDims } from "@/app/aux/Interfaces"

interface Props {
    title: string
    children: React.ReactNode
    interactionData: InteractionData | null
    svgDims: SvgDims
    width: number
    height: number
    margin: Margin
    className?: string
}

const BaseChart = ({ title, interactionData, svgDims, width, height, margin, className = '', children }: Props) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const scaleX = svgDims.width / (rect.width || 1)
        const scaleY = svgDims.height / (rect.height || 1)
        const innerX = (e.clientX - rect.left) * scaleX - margin.left
        const innerY = (e.clientY - rect.top) * scaleY - margin.top

        setMousePos({
            x: innerX,
            y: innerY
        })
    }

    const handleMouseLeave = () => {
        setMousePos(null)
    }

    return (
        <div className={`w-full ${className}`}>
            <h2 className='text-sm sm:text-base font-semibold text-neutral-200 mb-2 sm:mb-3 tracking-wide'>{title}</h2>
            <div 
                ref={containerRef}
                style={{ position: 'relative' }} 
                className='w-full'
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <svg
                    width='100%'
                    height={svgDims.height}
                    viewBox={`0 0 ${svgDims.width} ${svgDims.height}`}
                    id={`chart-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    className='overflow-visible'
                >
                    <g 
                        width={width}
                        height={height}
                        transform={`translate(${[margin.left, margin.top].join(',')})`}>
                        {children}
                    </g>
                </svg>
                <Tooltip 
                    interactionData={interactionData} 
                    mousePos={mousePos}
                    containerRef={containerRef}
                    dims={{ 
                        width: width, 
                        height: height, 
                        margin:{ 
                            left: margin.left, 
                            top: margin.top 
                        } 
                    }}
                    chartType='default' />
            </div>
        </div>
    )
}

export default BaseChart