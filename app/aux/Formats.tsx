export const BRL = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
})

export const Percentage = {
    format: (num: number) => `${(num * 100).toFixed(2)} %`
}