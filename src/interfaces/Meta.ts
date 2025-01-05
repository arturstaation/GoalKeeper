import { Estados } from "@/enums/Estados";
import SubMeta from "./SubMeta";

export default interface Meta {
    id: number,
    nome: string,
    descricao?: string,
    subMetas: SubMeta[],
    historico: string[],
    estado: Estados,
    isDeleted: boolean,
}

