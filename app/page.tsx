import { ConfigProvider } from 'antd'
import theme from '@/theme/themeConfig'
import { getVariableIncome } from './data/data'
import BarChart from './charts/BarChart'
import Card from './charts/Card'
import TreemapChart from './charts/TreemapChart'

const Home = async() => {
    const data = await getVariableIncome()
    const totalInvested = data.reduce((total, d) => total + +d.total_investido, 0)
    const totalBought = data.reduce((total, d) => total + +d.saldo_compra, 0)
    const profit = totalInvested - totalBought
    const profitMargiin = profit / totalBought
    const dtFiltered = data
        .filter(d => d.tipo === 'FII')
        .map(
            d => {
                return {
                    label: d.ticker, 
                    value: +d.total_investido, 
                    category: d.fii_setor
                }})

    return (
        <ConfigProvider theme={theme}>
            <main className="flex min-h-screen flex-col items-center p-8">
                <h1>Financial Dashboard</h1>
                <div className="flex min-w-full flex-row items-stretch p-4">
                    <Card 
                        title='Total Invested'
                        value={totalInvested}
                        format='BRL'/>
                    <Card 
                        title='Profit'
                        value={profit}
                        format='BRL'/>
                    <Card 
                        title='Profit Margin'
                        value={profitMargiin}
                        format='Percentage'/>
                </div>
                <div className="flex min-w-full flex-row items-stretch p-4">
                    <TreemapChart
                        title='Test'
                        data={dtFiltered}
                        svgDims={{ width: 700, height: 500 }} />
                    <BarChart 
                        title='FIIs' 
                        data={dtFiltered} 
                        svgDims={{ width: 700, height: 500 }} />
                </div>
            </main>
        </ConfigProvider>
    )
}

export default Home