'use client'

import React, { useRef, useState, useLayoutEffect, useEffect } from 'react'
import { InteractionData } from "./Interfaces"

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

interface TooltipProps {
    interactionData: InteractionData | null
    dims: {
        width: number
        height: number
        margin: {
            left: number
            top: number
        }
    }
    chartType?: 'bar' | 'line' | 'default'
    mousePos?: { x: number; y: number } | null
    containerRef?: React.RefObject<HTMLDivElement>
}

const Tooltip = ({ interactionData, dims, mousePos, containerRef, chartType = 'default' }: TooltipProps) => {
    const tooltipRef = useRef<HTMLDivElement>(null)
    const [tooltipSize, setTooltipSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 })

    useIsomorphicLayoutEffect(() => {
        if (tooltipRef.current) {
            const rect = tooltipRef.current.getBoundingClientRect()
            if (rect.width > 0 && rect.height > 0) {
                if (Math.abs(rect.width - tooltipSize.width) > 1 || Math.abs(rect.height - tooltipSize.height) > 1) {
                    setTooltipSize({ width: rect.width, height: rect.height })
                }
            }
        }
    }, [interactionData?.label, interactionData?.value])

    if (!interactionData) {
        return null
    }

    const PADDING = 10

    // Coordinates of the mouse pointer or element anchor point
    const pointerX = mousePos ? mousePos.x : interactionData.xPos
    const pointerY = mousePos ? mousePos.y : interactionData.yPos

    const tooltipWidth = tooltipSize.width || 130
    const tooltipHeight = tooltipSize.height || 48

    // Screen positioning relative to browser viewport
    let screenLeft = 0
    let screenTop = 0
    let hasScreenCoords = false

    if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect()
        screenLeft = rect.left + dims.margin.left
        screenTop = rect.top + dims.margin.top
        hasScreenCoords = true
    }

    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : dims.width

    // 1. Horizontal: Default is right side of mouse pointer
    const targetRightX = pointerX + PADDING
    const rightEdgeInChart = targetRightX + tooltipWidth
    const rightEdgeInScreen = hasScreenCoords ? screenLeft + rightEdgeInChart : rightEdgeInChart

    const fitsRight = rightEdgeInChart <= dims.width && (!hasScreenCoords || rightEdgeInScreen <= windowWidth - 8)

    let posX: number
    if (fitsRight) {
        posX = targetRightX
    } else {
        // Impossible to show on the right side: place on the other side of mouse pointer (left)
        posX = pointerX - tooltipWidth - PADDING
    }

    // Clamp horizontally to stay inside chart and visible on screen
    if (posX < 0) {
        posX = Math.max(0, posX)
    }
    if (posX + tooltipWidth > dims.width) {
        posX = Math.max(0, dims.width - tooltipWidth)
    }

    // 2. Vertical: Default is on top of mouse pointer
    const targetTopY = pointerY - tooltipHeight - PADDING
    const topEdgeInChart = targetTopY
    const topEdgeInScreen = hasScreenCoords ? screenTop + topEdgeInChart : topEdgeInChart

    const fitsTop = topEdgeInChart >= 0 && (!hasScreenCoords || topEdgeInScreen >= 8)

    let posY: number
    if (fitsTop) {
        posY = targetTopY
    } else {
        // Impossible to show on top: place on the other side of mouse pointer (below)
        posY = pointerY + PADDING
    }

    // Clamp vertically to stay inside chart and visible on screen
    if (posY < 0) {
        posY = Math.max(0, posY)
    }
    if (posY + tooltipHeight > dims.height) {
        posY = Math.max(0, dims.height - tooltipHeight)
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
                ref={tooltipRef}
                className={`tooltip ${chartType}`}
                style={{
                    left: `${posX}px`,
                    top: `${posY}px`,
                    transform: 'none',
                    margin: 0,
                }}
            >
                <div className='label'>
                    {interactionData.label}
                </div>
                <div dangerouslySetInnerHTML={{ __html: interactionData.value }} />
            </div>
        </div>
    )
}

export default Tooltip