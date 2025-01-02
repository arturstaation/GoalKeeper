<template>
    <div>
        <div>
        <h1>
            {{ componentData.nome }}
        </h1>
        <h3> {{ componentData.descricao }}</h3>
        <btn :onclick="addSubMeta">Adicionar SubMeta</btn>
        <btn :onclick="addSubMeta">Deletar Meta</btn>
        </div>
        <div v-if="componentData.subMetas.length > 0">
            <ul>
                <li v-for="sm in subMetas" :key="sm.id">
                <SubMetas :nome="sm.nome" :descricao="sm.descricao" :estado="sm.estado"></SubMetas>
            </li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">

import SubMeta from '@/interfaces/SubMeta';
import SubMetas from './SubMetas.vue';

interface MetasComponentProperties {
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



const componentProperties = withDefaults(defineProps<MetasComponentProperties>(),{});
const componentData : MetasComponentData = {
    nome: componentProperties.nome,
    descricao: componentProperties.descricao,
    subMetas: componentProperties.subMetas,
    estado: componentProperties.estado
}

const addSubMeta = () => {

    componentData.subMetas.push({
    id: componentData.subMetas.length + 1,
    nome:`SubMeta ${componentData.subMetas.length + 1}`,
    historico: [],
    estado: "Não Inciado"
    });

};


</script>