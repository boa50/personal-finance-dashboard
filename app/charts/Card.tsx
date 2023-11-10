import { useMemo } from "react"
import { BRL } from "../aux/Formats"
import { Card as BaseCard } from "antd"

interface CardProps {
    title: string,
    value: number,
    format: 'BRL' | 'USD'
}

const Card = ({ title, value, format }: CardProps) => {
    const formatedValue = useMemo(() => {
        if (format === 'BRL') return BRL.format(value)

        return value.toString()
    }, [value, format])

    return (
        <BaseCard 
            title={title} 
            size='small' 
            className='text-inherit bg-neutral-900 border-neutral-500 rounded'
            headStyle={{ color: 'inherit', borderBottomColor: 'rgb(115 115 115)' }}>
            <div>
                {formatedValue}
            </div>
        </BaseCard>
    )
}

export default Card