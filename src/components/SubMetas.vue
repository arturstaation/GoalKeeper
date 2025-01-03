<template>
    <div>
        <div>
            <h2 v-if="!componentData.isEdit" @click="changeName"> {{ componentData.nome }} </h2>
            <input v-else ref="editInput" v-model="editableName" @blur="cancelEdit">
            <h4> {{ componentData.descricao }} </h4>
            <button :onclick="deleteSubMeta">Deletar SubMeta</button>
        </div>
    </div>
    
</template>

<script lang="ts">

import {reactive, ref, nextTick} from 'vue';

export enum ESubMetasEventsNames{
    onDeleteSubMeta = 'deleteSubMeta',
    onUpdateSubMeta = 'updateSubMeta',
}

interface ISubMetasEvents{
    (e: ESubMetasEventsNames.onDeleteSubMeta, SubMetaId : number) : void;
    (e: ESubMetasEventsNames.onUpdateSubMeta, SubMeta : SubMeta) : void;
}

interface SubMetasComponentProperties {
    id: number,
    nome: string,
    descricao?: string,
    estado: string,

}

interface SubMetasComponentData {
    nome: string,
    descricao?: string,
    estado: string,
    isEdit: boolean,
}

</script>

<script lang="ts" setup>

const componentProperties = withDefaults(defineProps<SubMetasComponentProperties>(),{});
const componentData = reactive<SubMetasComponentData>({
    nome: componentProperties.nome,
    descricao: componentProperties.descricao,
    estado: componentProperties.estado,
    isEdit: false,
});

const emits = defineEmits<ISubMetasEvents>();

const deleteSubMeta = () => {
    
    emits(ESubMetasEventsNames.onDeleteSubMeta, componentProperties.id);
    
};

const changeName = () =>{

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
const editableName = ref<string>();

const cancelEdit = () => {
    
    componentData.isEdit = false;
    if(editableName.value){

        editableName.value = editableName.value.trim();
        if(editableName.value != componentData.nome){
            if(!componentData.historico)
                componentData.historico = [];
            componentData.historico.push(`Nome da Submeta ${componentProperties.id} alterado de ${componentData.nome} para ${editableName.value}`);
            componentData.nome = editableName.value;
        }
    }
    updateSubMeta();
};

const updateSubMeta = () => {
    const updatedSubMeta : SubMeta = {
        id: componentProperties.id,
        nome: componentData.nome,
        descricao: componentData.descricao,
        estado: componentData.estado,
        historico: componentData.historico

    }

    emits(ESubMetasEventsNames.onUpdateSubMeta, updatedSubMeta);
    componentData.historico = undefined;
}

</script>
