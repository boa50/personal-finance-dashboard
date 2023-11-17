import * as d3 from 'd3'
import * as fs from 'fs'
import { BigQuery } from '@google-cloud/bigquery'
import { Bar, Dividend, Exchange, ExchangeCost, LinePoint, Lollipop, Stock, Tree } from "../aux/Interfaces"

const tables = {
    stocks: '`' + process.env.DB_SCHEMA + '.stocks`',
    exchange: '`' + process.env.DB_SCHEMA + '.exchange`',
    exchangeCost: '`' + process.env.DB_SCHEMA + '.exchange_cost`',
    dividends: '`' + process.env.DB_SCHEMA + '.dividends`'
}

const options = {
    keyFilename: process.env.KEY_FILENAME,
    projectId: process.env.PROJECT_ID,
    scopes: [
        'https://www.googleapis.com/auth/drive.readonly'
    ]
}

const isDb = process.env.DATASOURCE == 'db'

const getMockData = (filename: string) =>
    d3.csvParse(fs.readFileSync(`./app/data/mock/${filename}.csv`, 'utf8')) as unknown as Array<any>

const getResults: ((query: string) => Promise<Array<any>>) = async (query: string) => {
    const bigQuery = new BigQuery(options)

    const [job] = await bigQuery.createQueryJob({ query: query })
    const [rows] = await job.getQueryResults()

    return rows
}

const getStocks: (() => Promise<Array<Stock>>) = async () => 
    isDb ?
        getResults(`SELECT * FROM ${tables.stocks}`) :
        getMockData('stocks')

const getFiis: (() => Promise<Array<Lollipop>>) = async () => {
    if (isDb) {
        const rows = await getResults(
            `SELECT 
                ticker,
                balance, 
                total_invested, 
                fii_sector
            FROM ${tables.stocks} 
            WHERE type = 'FII'`
        )
    
        return rows.map(d => {
            return {
                label: d.ticker,
                valueInit: +d.balance,
                value: +d.total_invested, 
                category: d.fii_sector
            }
        })
    } 

    return getMockData('fiis').map(d => {
        return {
            label: d.ticker, 
            valueInit: +d.balance,
            value: +d.total_invested, 
            category: d.fii_sector
        }
    })
}

const getTreemapData: (() => Promise<Array<Tree>>) = async () => 
    isDb ?    
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
        ) :
        getMockData('treemap')

const getExchangeData: (() => Promise<Array<Exchange>>) = async () =>
    isDb ?    
        getResults(`SELECT * FROM ${tables.exchange}`) :
        getMockData('exchange')

const getExchangeCostData: (() => Promise<Array<ExchangeCost>>) = async () =>
    isDb ?    
        getResults(`SELECT * FROM ${tables.exchangeCost}`) :
        getMockData('exchange_cost')

const getDividends: (() => Promise<Array<Dividend>>) = async () =>
    isDb ?
        getResults(`SELECT * FROM ${tables.dividends} d
            WHERE DATE_DIFF(DATE_TRUNC(CURRENT_DATE(), MONTH), d.month, MONTH) <= 24`) :
        getMockData('dividends').map(d => {return { ...d, month: { value: d.month } }})

interface GetData {
    totalInvested: number
    profit: number
    profitMargin: number
    fiiData: Array<Lollipop>
    treemapData: Array<Tree>
    dividends: Array<LinePoint>
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
    const treemapData = (await getTreemapData())
        .map(d => {
            return {
                ...d,
                value: convertToBrl(+d.value, d.country as string)
            }
        })
        .sort((a, b) => b.value - a.value)

    const dividends: Array<LinePoint> = [];
    (await getDividends())
        .reduce((res: any, d: Dividend) => {
            const month = d.month.value
            if(!res[month]) {
                res[month] = { month: new Date(month), value: 0 }
                dividends.push(res[month])
            }

            res[month].value += convertToBrl(+d.amount, d.country)
            return res
        }, {})
    dividends.sort((a, b) => a.month.getTime() - b.month.getTime())


    return { totalInvested, profit, profitMargin, fiiData, treemapData, dividends }
}

    
