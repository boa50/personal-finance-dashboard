import { BigQuery } from '@google-cloud/bigquery'
import { Bar, Exchange, ExchangeCost, Stock, Tree } from "../aux/Interfaces"

const tables = {
    stocks: '`boa-dashboards.dbt_semantic_layer_personal_finance.stocks`',
    exchange: '`boa-dashboards.dbt_semantic_layer_personal_finance.exchange`',
    exchangeCost: '`boa-dashboards.dbt_semantic_layer_personal_finance.exchange_cost`'
}

const options = {
    keyFilename: 'bigquery-key.json',
    projectId: 'boa-dashboards',
    scopes: [
        'https://www.googleapis.com/auth/drive.readonly'
    ]
}

const getResults: ((query: string) => Promise<Array<any>>) = async (query: string) => {
    const bigQuery = new BigQuery(options)

    const [job] = await bigQuery.createQueryJob({ query: query })
    const [rows] = await job.getQueryResults()

    return rows
}

const getStocks: (() => Promise<Array<Stock>>) = async () => 
    getResults(`SELECT * FROM ${tables.stocks}`)

const getFiis: (() => Promise<Array<Bar>>) = async () => {
    const rows = await getResults(
        `SELECT 
            ticker, 
            total_invested, 
            fii_sector
        FROM ${tables.stocks} 
        WHERE type = 'FII'`
    )

    return rows.map(d => {
        return {
            label: d.ticker, 
            value: +d.total_invested, 
            category: d.fii_sector
        }
    })
}

const getTreemapData: (() => Promise<Array<Tree>>) = async () => 
    getResults(
        `SELECT 
            'leaf' AS type, 
            CASE
                WHEN type = 'FII' THEN 'FII'
                WHEN country = 'BR' THEN 'Stocks BR'
            ELSE 'Stocks Int'
            END AS label,
            country,
            SUM(total_invested) AS value
        FROM ${tables.stocks}
        GROUP BY label, country`
    )

const getExchangeData: (() => Promise<Array<Exchange>>) = async () =>
    getResults(`SELECT * FROM ${tables.exchange}`)

const getExchangeCostData: (() => Promise<Array<ExchangeCost>>) = async () =>
    getResults(`SELECT * FROM ${tables.exchangeCost}`)

interface GetData {
    totalInvested: number, 
    profit: number, 
    profitMargin: number, 
    fiiData: Array<Bar>,
    treemapData: Array<Tree>
}

export const getData: (() => Promise<GetData>) = async () => {
    const exchange = await getExchangeData()
    const convertToBrl = (value: number, country: string) => {
        const filteredExch = exchange.filter(f => f.from == country)

        return country !== 'BR' ? value * +filteredExch[0].rate : value
    }
    const exchangeCost = await getExchangeCostData()

    const data = await getStocks()
    const totalInvested = data.reduce((total, d) => total + convertToBrl(+d.total_invested, d.country), 0)
    const totalBought = 
        data
            .filter(d => d.country == 'BR')
            .reduce((total, d) => total + +d.balance, 0)
        +
        +exchangeCost[0].cost_brl
    const profit = 
        data
            .filter(d => d.country == 'BR')
            .reduce((total, d) => total + +d.profit, 0)
        +
        data
            .filter(d => d.country == 'US')
            .reduce((total, d) => total + convertToBrl(+d.total_invested, d.country), 0)
        -
        +exchangeCost[0].cost_brl
    const profitMargin = profit / totalBought
    const fiiData = await getFiis()
    let treemapData = await getTreemapData()

    treemapData = treemapData
        .map(d => {
            return {
                ...d,
                value: convertToBrl(+d.value, d.country)
            }
        })
        .sort((a, b) => b.value - a.value)

    return { totalInvested, profit, profitMargin, fiiData, treemapData }
}

    
