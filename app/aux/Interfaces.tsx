export interface Investment {
  product: string
  sub_product: string
  country: string
  total_invested: number
  profit_executed: number
  profit_to_execute: number
  cost: number
}

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
    profit_selling: number
    profit: number
    total_invested: string 
}

export interface Exchange {
  from: string
  to: string
  rate: string
}

export interface ExchangeCost {
  cost_brl: number
  cost_int: number
  cost_int_avg: number
}

export interface Dividend {
  ticker: string
  month: {value: string}
  amount: number
  type: string
  country: string
}

export interface Crypto {
  coin: string
  cost: number
  quantity: number
}

export interface Margin {
  left: number
  right: number
  top: number
  bottom: number
}

export interface Kpis {
  totalInvested: number
  cost: number
  profitExecuted: number
  profitToExecute: number
  profit: number
  profitExecutedMargin: number
  profitToExecuteMargin: number
  profitMargin: number
}

export interface SvgDims {
  width: number
  height: number
}

// CHARTS
export interface InteractionData {
  xPos: number
  yPos: number
  label: string
  value: string
}

export interface Bar {
  label: string
  value: number 
  category: string
}

export interface Lollipop {
  label: string
  valueInit: number 
  value: number 
  category: string
}

export interface TreeNode {
    type: 'node'
    label: string
    country?: string
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

export interface LinePoint {
  month: Date 
  value: number
}