import { ConfigProvider } from 'antd'
import theme from '@/theme/themeConfig'
import { getData } from './data/data'
import BarChart from './charts/BarChart'
import Card from './charts/Card'
import TreemapChart from './charts/TreemapChart'
import LineChart from './charts/LineChart'
import LollipopChart from './charts/LollipopChart'
import { DashboardGrid, ChartCard } from './charts/components/DashboardGrid'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const maxDuration = 60

const Home = async() => {
    const { kpis, fiiData, fiiDataGrouped, treemapData, dividends } = await getData()

    const cards = [
        { 
            title: 'Total Invested', 
            value: kpis.totalInvested, 
            format: 'BRL' as const, 
            image: 'totalInvested' as const 
        },
        { 
            title: 'Profit Executed', 
            value: kpis.profitExecuted, 
            format: 'BRL' as const, 
            image: 'profitExecuted' as const 
        },
        { 
            title: 'Profit Executed Margin', 
            value: kpis.profitExecutedMargin, 
            format: 'Percentage' as const, 
            image: 'profitExecutedMargin' as const 
        },
        { 
            title: 'Profit to Execute', 
            value: kpis.profitToExecute, 
            format: 'BRL' as const, 
            image: 'profitToExecute' as const 
        },
        { 
            title: 'Profit to Execute Margin', 
            value: kpis.profitToExecuteMargin, 
            format: 'Percentage' as const, 
            image: 'profitToExecuteMargin' as const 
        },
    ]

    return (
        <ConfigProvider theme={theme}>
            <main className="flex min-h-screen flex-col items-center p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-8">
                <div className="w-full flex items-center justify-between mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Financial Dashboard</h1>
                </div>

                {/* Top KPI Cards - 2 by 2 on mobile (odd last card takes full width), 3 on md, 5 on lg */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 w-full mb-6">
                    {cards.map((card, index) => {
                        const isOddLast = (cards.length % 2 !== 0) && (index === cards.length - 1)
                        return (
                            <Card 
                                key={card.title}
                                title={card.title}
                                value={card.value}
                                format={card.format}
                                image={card.image}
                                className={isOddLast ? 'col-span-2 md:col-span-1' : 'col-span-1'}
                            />
                        )
                    })}
                </div>

                {/* Main Charts Grid: 12-column responsive layout
                    - Mobile (xs): each chart takes full width (12 cols, 1 per row)
                    - Tablet (md): Treemap takes 12 cols, Bar & Lollipop take 6 cols each
                    - Desktop (lg): 5 cols + 3 cols + 4 cols = 12 cols
                */}
                <DashboardGrid className="mb-6">
                    <ChartCard colSpan={{ xs: 12, md: 12, lg: 5 }}>
                        <TreemapChart
                            title='Investments Distribution'
                            data={treemapData}
                            svgDims={{ height: 400 }} />
                    </ChartCard>
                    <ChartCard colSpan={{ xs: 12, md: 6, lg: 3 }}>
                        <BarChart 
                            title='FIIs Grouped' 
                            data={fiiDataGrouped}
                            legend={false}
                            svgDims={{ height: 400 }} />
                    </ChartCard>
                    <ChartCard colSpan={{ xs: 12, md: 6, lg: 4 }}>
                        <LollipopChart 
                            title='FIIs Lollipop' 
                            data={fiiData} 
                            svgDims={{ height: 400 }} />
                    </ChartCard>
                </DashboardGrid>

                {/* Full-width Timeline Chart Grid */}
                <DashboardGrid>
                    <ChartCard colSpan={{ xs: 12, lg: 12 }}>
                        <LineChart
                            title='Dividends on the Last 2 Years' 
                            data={dividends} 
                            svgDims={{ height: 320 }} />
                    </ChartCard>
                </DashboardGrid>
            </main>
        </ConfigProvider>
    )
}

export default Home