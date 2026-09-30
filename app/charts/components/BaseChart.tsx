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
    return (
        <div className={`w-full ${className}`}>
            <h2 className='text-sm sm:text-base font-semibold text-neutral-200 mb-2 sm:mb-3 tracking-wide'>{title}</h2>
            <div style={{ position: 'relative' }} className='w-full overflow-hidden'>
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
        </div>
    )
}

export default BaseChart