<template>
    <div>
        <div>
        <h1>
            {{ componentData.nome }}
        </h1>
        <h3> {{ componentData.descricao }}</h3>
        <button :onclick="addSubMeta">Adicionar SubMeta</button>
        <button :onclick="deleteMeta">Deletar Meta</button>
        </div>
        <div v-if="componentData.subMetas.length > 0">
            <ul>
                <li v-for="sm in subMetas" :key="sm.id">
                <SubMetas :nome="sm.nome" :descricao="sm.descricao" :estado="sm.estado" :id="sm.id" @delete-sub-meta="deleteSubMeta"></SubMetas>
            </li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">

import SubMeta from '@/interfaces/SubMeta';
import SubMetas from './SubMetas.vue';

export enum EMetasEventsNames{
    onDeleteMeta = 'deleteMeta',
}

interface IMetasEvents{
    (e: EMetasEventsNames.onDeleteMeta, MetaId : number) : void;
}

interface MetasComponentProperties {
    id: number,
    nome: string,
    descricao?: string,
    subMetas: SubMeta[],
    estado: string,

}

interface MetasComponentData {
    nome: string,
    descricao?: string,
    subMetas: SubMeta[],
    estado: string,
}

</script>

<script setup lang="ts">

const emits = defineEmits<IMetasEvents>();

const componentProperties = withDefaults(defineProps<MetasComponentProperties>(),{});
const componentData : MetasComponentData = {
    nome: componentProperties.nome,
    descricao: componentProperties.descricao,
    subMetas: componentProperties.subMetas,
    estado: componentProperties.estado
}

const addSubMeta = () => {
    const numero = componentData.subMetas.length > 0 ? componentData.subMetas[componentData.subMetas.length-1].id + 1 : 1;
    componentData.subMetas.push({
    id: numero,
    nome:`SubMeta ${numero}`,
    historico: [],
    estado: "Não Inciado"
    });

};

const deleteSubMeta = (id:number) => {
    const index = componentData.subMetas.findIndex((sm : SubMeta) => sm.id === id);

    if (index !== -1) {
        componentData.subMetas.splice(index, 1);
    }

};

const deleteMeta = () => {
    emits(EMetasEventsNames.onDeleteMeta, componentProperties.id);
};


</script>