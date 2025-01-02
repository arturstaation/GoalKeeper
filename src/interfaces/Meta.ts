import SubMeta from "./SubMeta";

export default interface Meta {
    id: number,
    nome: string,
    descricao?: string,
    subMetas: SubMeta[],
    historico: string[],
    estado: string,
}

