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
    label: string;
    value: string
}

export interface TreeNode {
    type: 'node';
    value: number;
    label: string;
    children: Tree[];
  };

export interface TreeLeaf {
    type: 'leaf';
    label: string;
    value: number;
  };
  
export type Tree = TreeNode | TreeLeaf;