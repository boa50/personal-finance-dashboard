interface FormatOptions {
    style: string
    currency: string
    notation?: "standard" | "scientific" | "engineering" | "compact"
}

export const BRL = {
    format: (num: number, compact?: boolean) => {
        const options: FormatOptions = {
            style: 'currency',
            currency: 'BRL'
        }

        if (compact) {
            options.notation = 'compact'
        }

        const formatter = new Intl.NumberFormat('pt-BR', options)

        return formatter.format(num).replace('mil', 'K')

    } 
}

export const Percentage = {
    format: (num: number) => `${(num * 100).toFixed(2)} %`
}