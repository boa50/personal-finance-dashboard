import * as d3 from 'd3'
import * as fs from 'fs'
import { BigQuery } from '@google-cloud/bigquery'
import { Bar, Dividend, Exchange, ExchangeCost, LinePoint, Lollipop, Stock, Tree, Crypto, Investment, Kpis } from "../aux/Interfaces"
import { getGCPCredentials } from './connection'

const tables = {
    stocks: '`' + process.env.DB_SCHEMA + '.stocks`',
    exchange: '`' + process.env.DB_SCHEMA + '.exchange`',
    exchangeCost: '`' + process.env.DB_SCHEMA + '.exchange_cost`',
    dividends: '`' + process.env.DB_SCHEMA + '.dividends`',
    crypto: '`' + process.env.DB_SCHEMA + '.crypto`',
    investments: '`' + process.env.DB_SCHEMA + '.investments`'
}

const isDb = process.env.DATASOURCE == 'db'

const getMockData = (filename: string) =>
    d3.csvParse(fs.readFileSync(`./app/data/mock/${filename}.csv`, 'utf8')) as unknown as Array<any>

const getResults: ((query: string) => Promise<Array<any>>) = async (query: string) => {
    const bigQuery = new BigQuery(getGCPCredentials())

    const [job] = await bigQuery.createQueryJob({ query: query })
    const [rows] = await job.getQueryResults()

    return rows
}

const getInvestments: (() => Promise<Array<Investment>>) = async () => 
    isDb ?
        getResults(`SELECT * FROM ${tables.investments}`) :
        getMockData('investments')

const getFiis: (() => Promise<Array<Lollipop>>) = async () => {
    if (isDb) {
        const rows = await getResults(
            `SELECT 
                ticker,
                balance, 
                total_invested, 
                fii_sector
            FROM ${tables.stocks} 
            WHERE type = 'FII'
            AND total_invested > 0`
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
    kpis: Kpis
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

    const investments = await getInvestments()
    const kpis = {
        totalInvested: investments.reduce((total, d) => total + convertToBrl(+d.total_invested, d.country), 0),
        cost: investments.reduce((total, d) => total + (d.cost ? +d.cost : 0), 0) + +exchangeCost[0].cost_brl,
        profitExecuted: investments.reduce((total, d) => total + convertToBrl(+d.profit_executed, d.country === 'Bitcoin' ? 'BR' : d.country), 0),
        profitToExecute: investments.reduce((total, d) => 
            total + 
            (d.profit_to_execute ? 
                convertToBrl(+d.profit_to_execute, d.country) : 
                (convertToBrl(+d.total_invested, d.country) - +d.cost))
        , 0),
        profit: -1,
        profitExecutedMargin: -1,
        profitToExecuteMargin: -1,
        profitMargin: -1
    }
    kpis.profit = kpis.profitExecuted + kpis.profitToExecute
    kpis.profitExecutedMargin = kpis.profitExecuted / kpis.cost
    kpis.profitToExecuteMargin = kpis.profitToExecute / kpis.cost
    kpis.profitMargin = kpis.profit / kpis.cost

    const treemapData = [...d3.group(investments, d => d.product)]
        .map(d => {
            return {
                type: 'leaf',
                label: d[0],
                country: d[1][0].country,
                value: d3.sum(d[1], d => convertToBrl(+d.total_invested, d.country))
            }
        })
        .filter(d => d.value > 0)
        .sort((a, b) => b.value - a.value) as Array<Tree>

    const fiiData = await getFiis()

    const fiiDataGrouped = [...d3.group(fiiData, d => d.category)]
        .map(d => { 
            return { 
                label: d[0], 
                value: d3.sum(d[1], d => d.value),
                category: d[0]
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

    return { kpis, fiiData, fiiDataGrouped, treemapData, dividends }
}