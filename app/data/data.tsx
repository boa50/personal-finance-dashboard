import { BigQuery } from '@google-cloud/bigquery'
import { Bar, Stock, Tree } from "../aux/Interfaces"

const tables = {
    stocks: '`boa-dashboards.dbt_semantic_layer_personal_finance.stocks`'
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
            fii_sector AS label, 
            SUM(total_invested) AS value
        FROM ${tables.stocks} 
        WHERE type = 'FII'
        GROUP BY fii_sector
        ORDER BY value desc`
    )

interface GetData {
    totalInvested: number, 
    profit: number, 
    profitMargin: number, 
    fiiData: Array<Bar>,
    treemapData: Array<Tree>
}

export const getData: (() => Promise<GetData>) = async () => {
    const data = await getStocks()
    const totalInvested = data.reduce((total, d) => total + +d.total_invested, 0)
    const totalBought = data.reduce((total, d) => total + +d.balance, 0)
    const profit = totalInvested - totalBought
    const profitMargin = profit / totalBought
    const fiiData = await getFiis()
    const treemapData = await getTreemapData()

    return { totalInvested, profit, profitMargin, fiiData, treemapData }
}

    
