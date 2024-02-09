import { ConfigProvider } from 'antd'
import theme from '@/theme/themeConfig'
import { getData } from './data/data'
import BarChart from './charts/BarChart'
import Card from './charts/Card'
import TreemapChart from './charts/TreemapChart'
import LineChart from './charts/LineChart'
import LollipopChart from './charts/LollipopChart'

const Home = async() => {
    const { kpis, fiiData, fiiDataGrouped, treemapData, dividends } = await getData()

    return (
        <ConfigProvider theme={theme}>
            <main className="flex min-h-screen flex-col items-center p-8 pb-0">
                <h1>Financial Dashboard</h1>
                {/* <div className="flex min-w-full flex-row items-stretch p-4">
                    <Card 
                        title='Total Invested'
                        value={kpis.totalInvested}
                        format='BRL'
                        image='totalInvested' />
                    <Card 
                        title='Profit Executed'
                        value={kpis.profitExecuted}
                        format='BRL'
                        image='profitExecuted' />
                    <Card 
                        title='Profit Executed Margin'
                        value={kpis.profitExecutedMargin}
                        format='Percentage'
                        image='profitExecutedMargin' />
                    <Card 
                        title='Profit to Execute'
                        value={kpis.profitToExecute}
                        format='BRL'
                        image='profitToExecute' />
                    <Card 
                        title='Profit to Execute Margin'
                        value={kpis.profitToExecuteMargin}
                        format='Percentage'
                        image='profitToExecuteMargin' />
                </div>
                <div className="flex min-w-full flex-row items-stretch p-4">
                    <TreemapChart
                        title='Investments Distribution'
                        data={treemapData}
                        svgDims={{ width: 650, height: 400 }} />
                    <BarChart 
                        title='FIIs Grouped' 
                        data={fiiDataGrouped}
                        legend={false}
                        svgDims={{ width: 400, height: 400 }} />
                    <LollipopChart 
                        title='FIIs Lollipop' 
                        data={fiiData} 
                        svgDims={{ width: 650, height: 400 }} />
                </div>
                <div className="flex min-w-full flex-row items-stretch p-4">
                    <LineChart
                        title='Dividends on the Last 2 Years' 
                        data={dividends} 
                        svgDims={{ width: 1400, height: 300 }} />
                </div> */}
            </main>
        </ConfigProvider>
    )
}

export default Home