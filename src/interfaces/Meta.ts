import SubMeta from "./SubMeta";

export default interface Meta {
    nome: string,
    descricao?: string,
    subMetas: SubMeta[],
    historico: string[],
    estado: string,
}

