import { ConfigProvider } from 'antd'
import theme from '@/theme/themeConfig'
import { getData } from './data/data'
import BarChart from './charts/BarChart'
import Card from './charts/Card'
import TreemapChart from './charts/TreemapChart'

const Home = async() => {
    const { totalInvested, profit, profitMargin, fiiData, treemapData } = await getData()

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
                        value={profitMargin}
                        format='Percentage'/>
                </div>
                <div className="flex min-w-full flex-row items-stretch p-4">
                    <TreemapChart
                        title='Test'
                        data={treemapData}
                        svgDims={{ width: 700, height: 500 }} />
                    <BarChart 
                        title='FIIs' 
                        data={fiiData} 
                        svgDims={{ width: 700, height: 500 }} />
                </div>
            </main>
        </ConfigProvider>
    )
}

export default Home