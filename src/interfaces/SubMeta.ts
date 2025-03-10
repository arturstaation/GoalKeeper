import { Estados } from "@/enums/Estados";

export default interface SubMeta {
    id: number,
    nome: string,
    descricao?: string,
    historico?: string[],
    estado: Estados,
    isDeleted: boolean,
}