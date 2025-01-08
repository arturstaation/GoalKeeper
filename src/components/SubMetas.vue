<template>
    <div>
        <div>
            <div>
                <h2 v-if="!componentData.isEdit" @click="changeName"> {{ componentData.nome }} </h2>
                <input v-else ref="editInput" v-model="editableName" @blur="cancelEdit">
                <Estado :estado="componentData.estado" @update-estado="updateEstado"></Estado>
            </div>
            <h4 @click="changeDescription" v-if="!componentData.isEditDescription"> {{ componentData.descricao ?? 'Descrição'}} </h4>
            <input v-else ref="editInputDescription" v-model="editableName" @blur="cancelEditDescription">
            <v-btn prepend-icon="mdi-delete" color="white" @click="deleteSubMeta" elevated>
                Deletar SubMeta
            </v-btn>
        </div>
    </div>
    
</template>

<script lang="ts">

import {reactive, ref, nextTick, watch} from 'vue';
import { Estados } from "@/enums/Estados";
import Estado from './Estado.vue';

import type SubMeta from '@/interfaces/SubMeta';

export enum ESubMetasEventsNames{
    onDeleteSubMeta = 'deleteSubMeta',
    onUpdateSubMeta = 'updateSubMeta',
}

interface ISubMetasEvents{
    (e: ESubMetasEventsNames.onDeleteSubMeta, SubMetaId : number) : void;
    (e: ESubMetasEventsNames.onUpdateSubMeta, SM : SubMeta) : void;
}

interface SubMetasComponentProperties {
    subMeta: SubMeta

}

interface SubMetasComponentData {
    nome: string,
    descricao?: string,
    historico?: string[],
    estado: Estados,
    isEdit: boolean,
    isEditDescription: boolean,
}

</script>

<script lang="ts" setup>

const componentProperties = withDefaults(defineProps<SubMetasComponentProperties>(),{});
const componentData = reactive<SubMetasComponentData>({
    nome: componentProperties.subMeta.nome,
    descricao: componentProperties.subMeta.descricao,
    estado: componentProperties.subMeta.estado,
    isEdit: false,
    isEditDescription: false,
});

const emits = defineEmits<ISubMetasEvents>();

const deleteSubMeta = () => {
    
    componentData.estado = Estados.Deletado;
    emits(ESubMetasEventsNames.onDeleteSubMeta, componentProperties.subMeta.id);
    
};

const changeName = () =>{

    if(componentData.isEditDescription){
        cancelEditDescription();
        updateSubMeta();
    }

    componentData.isEdit = true;

    editableName.value = componentData.nome;

    nextTick(() => {
        const inputElement = editInput.value;
        if (inputElement) {
        inputElement.focus(); 
        }
    });

};

const editInput = ref(null);
const editInputDescription = ref(null);
const editableName = ref<string>();

const cancelEdit = () => {
    
    componentData.isEdit = false;
    if(editableName.value){

        editableName.value = editableName.value.trim();
        if(editableName.value != componentData.nome){
            if(!componentData.historico)
                componentData.historico = [];
            componentData.historico.push(`[${new Date().toLocaleString()}] - Nome da Submeta ${componentProperties.subMeta.id} alterado de ${componentData.nome} para ${editableName.value}`);
            componentData.nome = editableName.value;
        }
    }
    updateSubMeta();
};

const updateSubMeta = () => {
    const updatedSubMeta : SubMeta = {
        id: componentProperties.subMeta.id,
        nome: componentData.nome,
        descricao: componentData.descricao,
        estado: componentData.estado,
        historico: componentData.historico,
        isDeleted: false,
    }

    emits(ESubMetasEventsNames.onUpdateSubMeta, updatedSubMeta);
    componentData.historico = undefined;
};

const changeDescription = () =>{

    if(componentData.isEdit){
        cancelEdit();
        updateSubMeta();
    }
    componentData.isEditDescription = true;

    editableName.value = componentData.descricao;

    nextTick(() => {
        const inputElement = editInputDescription.value;
        if (inputElement) {
        inputElement.focus(); 
        }
    });

};

const cancelEditDescription = () => {
    
    componentData.isEditDescription = false;
    if(editableName.value){

        editableName.value = editableName.value.trim();
        if(editableName.value != componentData.descricao){
            if(!componentData.historico)
                componentData.historico = [];
            componentData.historico.push(`[${new Date().toLocaleString()}] - Descrição da Submeta ${componentProperties.subMeta.id}: ${componentData.nome} alterado de ${componentData.descricao} para ${editableName.value}`);
            componentData.descricao = editableName.value;
        }
    }
    updateSubMeta();
};

const updateEstado = (estado : Estados) => {
    if(!componentData.historico)
        componentData.historico = [];
    componentData.historico.push(`[${new Date().toLocaleString()}] - Estado da SubMeta ${componentProperties.subMeta.id}: ${componentData.nome} alterado de ${componentData.estado} para ${estado}`);
    componentData.estado = estado;
    updateSubMeta();
}

watch(() => (componentProperties.subMeta), (newSubMeta, oldSubMeta) =>{


    if(newSubMeta != oldSubMeta){

        componentData.nome = newSubMeta.nome;
        componentData.descricao = newSubMeta.descricao;
        componentData.historico = newSubMeta.historico;
        componentData.estado = newSubMeta.estado;
        editableName.value = newSubMeta.nome;
        
    }
});


</script>
