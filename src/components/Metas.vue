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
                <li v-for="subMeta in subMetas" :key="subMeta">
                <SubMetas :nome="subMeta.nome" :descricao="subMeta.descricao" :estado="subMeta.estado"></SubMetas>
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
    descricao: string,
    subMetas: SubMeta[],
    estado: string,

}

interface MetasComponentData {
    nome: string,
    descricao: string,
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
    nome:`SubMeta ${componentData.subMetas.length + 1}`,
    historico: [],
    estado: "Não Inciado"
    });

};


</script>