<template>
    <div>
        <div>
        <h1 @click="changeName" v-if="!componentData.isEdit">
            {{ componentData.nome }}
        </h1>
        <input v-else ref="editInput" v-model="editableName" @blur="cancelEdit">
        <h3> {{ componentData.descricao }}</h3>
        <button :onclick="addSubMeta">Adicionar SubMeta</button>
        <button :onclick="deleteMeta">Deletar Meta</button>
        </div>
        <div v-if="componentData.subMetas.length > 0">
            <ul>
                <div v-for="sm in subMetas" >
                    <li :key="sm.id" v-if="!sm.isDeleted">
                        <SubMetas :nome="sm.nome" :descricao="sm.descricao" :estado="sm.estado" :id="sm.id" @delete-sub-meta="deleteSubMeta" @update-sub-meta="updateSubMeta"></SubMetas>
                    </li>
                </div>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">

import {ref, reactive,nextTick, watch} from 'vue';
import SubMeta from '@/interfaces/SubMeta';
import Meta from '@/interfaces/Meta';
import SubMetas from './SubMetas.vue';

export enum EMetasEventsNames{
    onDeleteMeta = 'deleteMeta',
    onUpdateMeta = 'updateMeta',
}

interface IMetasEvents{
    (e: EMetasEventsNames.onDeleteMeta, MetaId : number) : void;
    (e: EMetasEventsNames.onUpdateMeta, newMeta : Meta) : void;
}

interface MetasComponentProperties {
    id: number,
    nome: string,
    descricao?: string,
    subMetas: SubMeta[],
    historico: string[],
    estado: string,

}

interface MetasComponentData {
    nome: string,
    descricao?: string,
    subMetas: SubMeta[],
    historico: string[],
    estado: string,
    isEdit: boolean,
}

</script>

<script setup lang="ts">

const emits = defineEmits<IMetasEvents>();

const componentProperties = withDefaults(defineProps<MetasComponentProperties>(),{});
const componentData  = reactive<MetasComponentData>({
    nome: componentProperties.nome,
    descricao: componentProperties.descricao,
    subMetas: componentProperties.subMetas,
    historico: componentProperties.historico,
    estado: componentProperties.estado,
    isEdit: false,
});

const editInput = ref(null);
const editableName = ref<string>();

const addSubMeta = () => {
    const numero = componentData.subMetas.length > 0 ? componentData.subMetas[componentData.subMetas.length-1].id + 1 : 1;
    componentData.subMetas.push({
    id: numero,
    nome:`SubMeta ${numero}`,
    estado: "Não Inciado",
    isDeleted: false
    });

    componentData.historico.push(`SubMeta ${numero} criada`);
    updateMeta();

};

const deleteSubMeta = (id:number) => {
    const index = componentData.subMetas.findIndex((sm : SubMeta) => sm.id === id);

    if (index !== -1) {
        componentData.subMetas[index].isDeleted = true;
    }

    componentData.historico.push(`SubMeta ${index} deletada`);
    updateMeta();

};

const deleteMeta = () => {

    componentData.historico.push(`Meta ${componentProperties.id} deletada`);
    updateMeta();
    emits(EMetasEventsNames.onDeleteMeta, componentProperties.id);

};

const changeName = () => {

    componentData.isEdit = true;
    
    editableName.value = componentData.nome;

    nextTick(() => {
        const inputElement = editInput.value;
        if (inputElement) {
          inputElement.focus(); 
        }
    });


};

const cancelEdit = () => {
    
    componentData.isEdit = false;
    if(editableName.value){

        editableName.value = editableName.value.trim();
        if(editableName.value != componentData.nome){
            componentData.historico.push(`Nome alterado de ${componentData.nome} para ${editableName.value}`);
            componentData.nome = editableName.value;
        }
    }
    
    updateMeta();
};

const updateMeta = () =>{

    const updatedMeta : Meta = {
        id: componentProperties.id,
        nome: componentData.nome,
        descricao: componentData.descricao,
        subMetas: componentData.subMetas,
        historico: componentData.historico,
        estado: componentData.estado,
        isDeleted: false,

    }
    emits(EMetasEventsNames.onUpdateMeta, updatedMeta);
}

const updateSubMeta = (subMeta : SubMeta) => {

    const index = componentData.subMetas.findIndex((sm : SubMeta) => sm.id === subMeta.id);
    
    if(index !== -1){

    componentData.subMetas[index] = subMeta;
    componentData.historico = [...componentData.historico, ...componentData.subMetas[index].historico!];
    componentData.subMetas[index].historico = undefined;

    }

    updateMeta();



}


</script>