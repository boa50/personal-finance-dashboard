import { useMemo } from "react"
import { BRL, Percentage } from "../aux/Formats"
import Image from "next/image"
import totalInvested from "@/public/total_invested.svg"
import profitExecuted from "@/public/profit_executed.svg"
import profitExecutedMargin from "@/public/profit_executed_margin.svg"
import profitToExecute from "@/public/profit_to_execute.svg"
import profitToExecuteMargin from "@/public/profit_to_execute_margin.svg"

interface CardProps {
    title: string
    value: number
    format: 'BRL' | 'Percentage'
    image?: 'totalInvested' | 'profitExecuted' | 'profitExecutedMargin' | 'profitToExecute' | 'profitToExecuteMargin' | undefined
    className?: string
}

const getIcon = (image: string) => {
    switch (image) {
    case 'totalInvested':
        return totalInvested
    case 'profitExecuted':
        return profitExecuted
    case 'profitExecutedMargin':
        return profitExecutedMargin
    case 'profitToExecute':
        return profitToExecute
    case 'profitToExecuteMargin':
        return profitToExecuteMargin
    default:
        return null
    }
}

const Card = ({ title, value, format, image, className = '' }: CardProps) => {
    const formatedValue = useMemo(() => {
        if (format === 'BRL') return BRL.format(value, true)
        if (format === 'Percentage') return Percentage.format(value)

        return value.toString()
    }, [value, format])

    const iconSrc = image ? getIcon(image) : null

    return (
        <div className={`bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-3 sm:p-4 lg:p-5 shadow-md flex items-center justify-between transition-all hover:border-neutral-700/80 w-full min-w-0 ${className}`}>
            <div className='flex flex-col min-w-0 pr-2 sm:pr-3'>
                <span className='text-xs sm:text-sm font-medium text-neutral-400 truncate tracking-wide' title={title}>{title}</span>
                <span className='text-lg sm:text-xl lg:text-2xl font-bold text-white mt-0.5 sm:mt-1 tracking-tight truncate' title={formatedValue}>{formatedValue}</span>
            </div>
            {iconSrc ? (
                <div className='flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-xl bg-neutral-800/80 border border-neutral-700/50 flex items-center justify-center p-2 sm:p-2.5'>
                    <Image
                        src={iconSrc}
                        width={28}
                        height={28}
                        alt={`${title} icon`}
                        className='w-full h-full object-contain'
                    />
                </div>
            ) : null}
        </div>
    )
}

export default Card