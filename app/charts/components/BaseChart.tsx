import Tooltip from "@/app/aux/Tooltip"
import { InteractionData } from "@/app/aux/Interfaces"

interface Props {
    title: string
    children: React.ReactNode
    interactionData: InteractionData | null,
    svgWidth: number
    svgHeight: number
    width: number
    height: number
    margin: {
        left: number
        top: number
    }
}

const BaseChart = ({ title, interactionData, svgWidth, svgHeight, width, height, margin, children }: Props) => {
    return (
        <div>
            <h2 className='font-semibold ml-4'>{title}</h2>
            <div style={{ position: 'relative' }}>
                <svg width={svgWidth} height={svgHeight} id={`barchart-${title}`}>
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