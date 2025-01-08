import { Estados } from "@/enums/Estados";
import type SubMeta from "./SubMeta";

export default interface Meta {
    id: number,
    subMetasNumber: number,
    nome: string,
    descricao?: string,
    subMetas: SubMeta[],
    historico: string[],
    estado: Estados,
    isDeleted: boolean,
}

