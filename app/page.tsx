import { ConfigProvider } from 'antd'
import theme from '@/theme/themeConfig'
import BarChart from './charts/BarChart'
import { getVariableIncome } from './data/data'

const Home = async() => {
    const data = await getVariableIncome()
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