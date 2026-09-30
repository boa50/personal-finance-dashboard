'use client'

import { useState, useEffect, useRef } from 'react'
import { SvgDims } from './Interfaces'

export const useResponsiveDims = (
    propSvgDims?: Partial<SvgDims>,
    defaultHeight = 400
) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const targetHeight = propSvgDims?.height || defaultHeight
    const [svgDims, setSvgDims] = useState<SvgDims>({
        width: propSvgDims?.width || 600,
        height: targetHeight
    })

    useEffect(() => {
        const element = containerRef.current
        if (!element) {
            return undefined
        }

        const updateWidth = () => {
            const clientWidth = Math.floor(element.clientWidth || element.getBoundingClientRect().width)
            if (clientWidth > 0) {
                setSvgDims(prev => {
                    if (prev.width === clientWidth && prev.height === targetHeight) return prev
                    return { width: clientWidth, height: targetHeight }
                })
            }
        }

        // Measure immediately on mount
        updateWidth()

        // Observe resize dynamically
        if (typeof ResizeObserver !== 'undefined') {
            const observer = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const width = Math.floor(entry.contentRect.width)
                    if (width > 0) {
                        setSvgDims(prev => {
                            if (prev.width === width && prev.height === targetHeight) return prev
                            return { width, height: targetHeight }
                        })
                    }
                }
            })
            observer.observe(element)
            return () => {
                observer.disconnect()
            }
        }

        window.addEventListener('resize', updateWidth)
        return () => {
            window.removeEventListener('resize', updateWidth)
        }
    }, [targetHeight])

    return { containerRef, svgDims }
}
