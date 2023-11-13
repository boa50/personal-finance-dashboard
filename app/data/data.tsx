import { BigQuery } from '@google-cloud/bigquery'
import { Stock } from "../aux/Interfaces"

export const getStocks: (() => Promise<Array<Stock>>) = async ()  => {
    const query = 'SELECT * FROM `boa-dashboards.dbt_semantic_layer_personal_finance.stocks`'
    
    const options = {
        keyFilename: 'bigquery-key.json',
        projectId: 'boa-dashboards',
        scopes: [
            'https://www.googleapis.com/auth/drive.readonly'
        ]
    }
    
    const bigQuery = new BigQuery(options)

    const [job] = await bigQuery.createQueryJob({ query: query })
    const [rows] = await job.getQueryResults()

    return rows as Array<Stock>
}