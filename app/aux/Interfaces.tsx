export interface Stock {
    ticker: string
    type: string
    country: string
    fii_sector: string
    bought: number
    bonus: number
    sold: number
    qty_actual: number
    cost_buying: number
    balance: number
    balance_irpf: number
    average_price: number
    value_actual: number
    profit_margin: number
    profit: number
    total_invested: string 
}

export interface Exchange {
  from: string
  to: string
  rate: string
}

// CHARTS
export interface Bar {
  label: string
  value: number 
  category: string
}

export interface InteractionData {
    xPos: number
    yPos: number
    label: string
    value: string
}

export interface TreeNode {
    type: 'node'
    label: string
    country: string
    value: number
    children: Tree[]
}

export interface TreeLeaf {
    type: 'leaf'
    label: string
    country: string
    value: number
}
  
export type Tree = TreeNode | TreeLeaf

