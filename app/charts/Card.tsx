import { useMemo } from "react"
import { BRL, Percentage } from "../aux/Formats"

interface CardProps {
    title: string,
    value: number,
    format: 'BRL' | 'Percentage'
}

const Card = ({ title, value, format }: CardProps) => {
    const formatedValue = useMemo(() => {
        if (format === 'BRL') return BRL.format(value, true)
        if (format === 'Percentage') return Percentage.format(value)

        return value.toString()
    }, [value, format])

    return (
        <div className='text-inherit first:ml-4 first:mr-8 mx-8'>
            <div className='text-base text-neutral-200'>{title}</div>
            <div className='text-2xl'>{formatedValue}</div>
        </div>
    )
}

export default Card