import { InteractionData } from "./Interfaces"

interface TooltipProps {
    interactionData: InteractionData | null;
    dims: {
        width: number,
        height: number,
        margin: {
            left: number,
            top: number,
        }
    }
}

export const Tooltip = ({ interactionData, dims }: TooltipProps) => {
    if (!interactionData) {
        return null
    }
  
    return (
        <div
            style={{
                width: dims.width,
                height: dims.height,
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                marginLeft: dims.margin.left,
                marginTop: dims.margin.top,
            }}
        >
            <div
                className={'tooltip'}
                style={{
                    left: interactionData.xPos,
                    top: interactionData.yPos
                }}
            >
                <div className='label'>
                    {interactionData.label}
                </div>
                {interactionData.value}
            </div>
        </div>
    )
}