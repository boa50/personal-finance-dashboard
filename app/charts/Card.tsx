import { useMemo } from "react"
import { BRL, Percentage } from "../aux/Formats"
import { Card as BaseCard } from "antd"

interface CardProps {
    title: string,
    value: number,
    format: 'BRL' | 'Percentage'
}

const Card = ({ title, value, format }: CardProps) => {
    const formatedValue = useMemo(() => {
        if (format === 'BRL') return BRL.format(value)
        if (format === 'Percentage') return Percentage.format(value)

        return value.toString()
    }, [value, format])

    return (
        <BaseCard 
            title={title} 
            size='small' 
            className='text-inherit bg-neutral-900 border-neutral-500 rounded first:ml-4 first:mr-8 mx-8'
            headStyle={{ color: 'inherit', borderBottomColor: 'rgb(115 115 115)' }}>
            <div>
                {formatedValue}
            </div>
        </BaseCard>
    )
}

export default Card