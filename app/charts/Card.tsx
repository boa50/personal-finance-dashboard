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

const Card = ({ title, value, format, image }: CardProps) => {
    const formatedValue = useMemo(() => {
        if (format === 'BRL') return BRL.format(value, true)
        if (format === 'Percentage') return Percentage.format(value)

        return value.toString()
    }, [value, format])

    return (
        <div className='flex flex-auto text-inherit first:ml-4 first:mr-8 mx-8'>
            {image ? <Image
                src={getIcon(image)}
                width={50}
                className='mr-3'
                alt='Logo of the Card' /> : null}
            <div>
                <div className='text-base text-neutral-200'>{title}</div>
                <div className='text-2xl'>{formatedValue}</div>
            </div>
        </div>
    )
}

export default Card