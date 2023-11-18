import Tooltip from "@/app/aux/Tooltip"
import { InteractionData, Margin, SvgDims } from "@/app/aux/Interfaces"

interface Props {
    title: string
    children: React.ReactNode
    interactionData: InteractionData | null,
    svgDims: SvgDims
    width: number
    height: number
    margin: Margin
}

const BaseChart = ({ title, interactionData, svgDims, width, height, margin, children }: Props) => {
    return (
        <div>
            <h2 className='font-semibold ml-4'>{title}</h2>
            <div style={{ position: 'relative' }}>
                <svg width={svgDims.width} height={svgDims.height} id={`barchart-${title}`}>
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