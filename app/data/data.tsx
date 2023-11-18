import * as d3 from 'd3'
import * as fs from 'fs'
import { BigQuery } from '@google-cloud/bigquery'
import { Bar, Dividend, Exchange, ExchangeCost, LinePoint, Lollipop, Stock, Tree, Crypto } from "../aux/Interfaces"

const tables = {
    stocks: '`' + process.env.DB_SCHEMA + '.stocks`',
    exchange: '`' + process.env.DB_SCHEMA + '.exchange`',
    exchangeCost: '`' + process.env.DB_SCHEMA + '.exchange_cost`',
    dividends: '`' + process.env.DB_SCHEMA + '.dividends`',
    crypto: '`' + process.env.DB_SCHEMA + '.crypto`'
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
        //     `SELECT 
        //     'leaf' AS type, 
        //     CASE
        //         WHEN type = 'FII' THEN 'FII'
        //         WHEN country = 'BR' THEN 'Stocks BR'
        //     ELSE 'Stocks Int'
        //     END AS label,
        //     country,
        //     SUM(total_invested) AS value
        // FROM ${tables.stocks}
        // GROUP BY label, country`
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
            GROUP BY label, country
            UNION ALL
            SELECT 
                'leaf' AS type,
                coin AS label,
                coin AS country,
                quantity AS value 
            FROM ${tables.crypto}`
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

const getCrypto: (() => Promise<Array<Crypto>>) = async () =>
    isDb ?    
        getResults(`SELECT * FROM ${tables.crypto}`) :
        getMockData('crypto')

interface GetData {
    totalInvested: number
    profit: number
    profitMargin: number
    fiiData: Array<Lollipop>
    fiiDataGrouped: Array<Bar>
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

    const stocks = await getStocks()
    const crypto = await getCrypto()
    const fiiData = await getFiis()
    const treemapData = (await getTreemapData())
        .map(d => {
            return {
                ...d,
                value: convertToBrl(+d.value, d.country as string)
            }
        })
        .sort((a, b) => b.value - a.value)

    const dividends = [...d3.group(await getDividends(), d => d.month.value)]
        .map(d => {
            return {
                month: new Date(d[0]),
                value: d3.sum(d[1], d => convertToBrl(+d.amount, d.country))
            }
        })
        .sort((a, b) => a.month.getTime() - b.month.getTime())

    const fiiDataGrouped = [...d3.group(fiiData, d => d.category)]
        .map(d => { 
            return { 
                label: d[0], 
                value: d3.sum(d[1], d => d.value),
                category: d[0]
            }
        })
        .sort((a, b) => b.value - a.value)

    const totalInvested = 
        stocks.reduce((total, d) => total + convertToBrl(+d.total_invested, d.country), 0)
        +
        crypto.reduce((total, d) => total + convertToBrl(+d.quantity, d.coin), 0)
    const totalBought = 
        stocks
            .filter(d => d.country == 'BR')
            .reduce((total, d) => total + +d.balance, 0)
        +
        +exchangeCost[0].cost_brl
        +
        crypto.reduce((total, d) => total + +d.cost, 0)
    const profit = 
        stocks
            .filter(d => d.country == 'BR')
            .reduce((total, d) => total + +d.profit, 0)
        +
        stocks
            .filter(d => d.country == 'US')
            .reduce((total, d) => total + convertToBrl(+d.total_invested, d.country), 0)
        -
        +exchangeCost[0].cost_brl
        +
        d3.sum(dividends, d => d.value)
    const profitMargin = profit / totalBought

    return { totalInvested, profit, profitMargin, fiiData, fiiDataGrouped, treemapData, dividends }
}

    
