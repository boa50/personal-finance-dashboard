export interface VariableIncome {
    ticker: string, 
    tipo: string,
    pais: string,
    fii_setor: string,
    compradas: number,
    bonificacoes: number,
    vendidas: number,
    qtd_atual: number,
    preco_compra: number,
    saldo_compra: number,
    preco_irpf: number,
    preco_medio: number,
    preco_atual: number,
    valorizacao: number,
    lucro: number,
    total_investido: string, 
}

export interface InteractionData {
    xPos: number;
    yPos: number;
    name: string;
}