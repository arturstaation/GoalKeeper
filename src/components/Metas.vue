<template>
    <v-expansion-panels>
        <v-expansion-panel>
            <v-expansion-panel-title @change="updatePanelState">
                <div class="d-flex align-center justify-space-between w-100">
                        {{ editableName }}
                        <Estado :estado="componentData.estado" readonly></Estado>
                    <v-icon>{{ componentData.isOpen ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                </div>
            </v-expansion-panel-title>
    <v-expansion-panel-text>
    <div>
        <div>
            <div>
                <h1 @click="changeName" v-if="!componentData.isEdit">
                    {{ editableName }}
                </h1>
                <input v-else ref="editInput" v-model="editableName" @blur="cancelEdit">
                <Estado :estado="componentData.estado" @update-estado="updateEstado"></Estado>
            </div>
            <h3 @click="changeDescription" v-if="!componentData.isEditDescription"> {{ componentData.descricao ?? 'Descrição'}} </h3>
            <input v-else ref="editInputDescription" v-model="editableDescription" @blur="cancelEditDescription">
            <button :onclick="addSubMeta">Adicionar SubMeta</button>
            <button :onclick="deleteMeta">Deletar Meta</button>
        </div>
        <div>

            <draggable v-if="componentData.subMetas.length > 0" v-model="componentData.subMetas" tag="ol" itemKey="indice" @end="updateOrder">
      <template #item="{element: sm}"> 
        <li :key="sm.id" v-if="!sm.isDeleted">
            <SubMetas :sub-meta="sm" @delete-sub-meta="deleteSubMeta" @update-sub-meta="updateSubMeta"></SubMetas>
        </li>
      </template>
    </draggable>
    </div>
             
    </div>
</v-expansion-panel-text>
</v-expansion-panel>
</v-expansion-panels>
</template>

<script lang="ts">

import draggable from "vuedraggable";
import {ref, reactive,nextTick, watch } from 'vue';
import type SubMeta from '@/interfaces/SubMeta';
import type Meta from '@/interfaces/Meta';
import SubMetas from './SubMetas.vue';
import Estado from './Estado.vue';
import { Estados } from "@/enums/Estados";
import type { SortableEvent } from "sortablejs"

export enum EMetasEventsNames{
    onDeleteMeta = 'deleteMeta',
    onUpdateMeta = 'updateMeta',
}

interface IMetasEvents{
    (e: EMetasEventsNames.onDeleteMeta, MetaId : number) : void;
    (e: EMetasEventsNames.onUpdateMeta, newMeta : Meta) : void;
}

interface MetasComponentProperties {
    meta: Meta

}

interface MetasComponentData {
    nome: string,
    descricao?: string,
    subMetas: SubMeta[],
    historico: string[],
    estado: Estados,
    isEdit: boolean,
    isEditDescription: boolean,
    isOpen: boolean,
    qntSubMetas: number,
}

</script>

<script setup lang="ts">

const emits = defineEmits<IMetasEvents>();

const componentProperties = withDefaults(defineProps<MetasComponentProperties>(),{});
const componentData  = reactive<MetasComponentData>({
    nome: componentProperties.meta.nome,
    descricao: componentProperties.meta.descricao,
    subMetas: componentProperties.meta.subMetas,
    historico: componentProperties.meta.historico,
    estado: componentProperties.meta.estado,
    isEdit: false,
    isEditDescription: false,
    isOpen: false,
    qntSubMetas: componentProperties.meta.subMetasNumber,
});

const editInput = ref(null);
const editInputDescription = ref(null);
const editableName = ref<string>(componentData.nome);
const editableDescription = ref<string>(componentData.nome);

const addSubMeta = () => {
    const numero = componentData.qntSubMetas;
    componentData.subMetas.push({
    id: numero,
    nome:`SubMeta ${numero+1}`,
    indice: componentData.subMetas.length,
    estado: Estados.NaoIniciado,
    isDeleted: false
    });
    componentData.qntSubMetas = componentData.qntSubMetas+1;
    componentData.historico.push(`SubMeta ${numero+1} criada`);
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

    componentData.historico.push(`Meta ${componentProperties.meta.id} deletada`);
    componentData.estado = Estados.Deletado;
    updateMeta();
    emits(EMetasEventsNames.onDeleteMeta, componentProperties.meta.id);

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
        if(editableName.value != componentData.nome && editableName.value != ""){
            componentData.historico.push(`Nome da meta ${componentProperties.meta.id} alterado de ${componentData.nome} para ${editableName.value}`);
            componentData.nome = editableName.value;
            updateMeta();
            return
        }
    }
    editableName.value = componentData.nome;
    
};

const updateMeta = () =>{

    const updatedMeta : Meta = {
        id: componentProperties.meta.id,
        nome: componentData.nome,
        descricao: componentData.descricao,
        subMetas: componentData.subMetas,
        historico: componentData.historico,
        estado: componentData.estado,
        isDeleted: false,
        subMetasNumber: componentData.qntSubMetas,
        indice: componentProperties.meta.indice
    }

    emits(EMetasEventsNames.onUpdateMeta, updatedMeta);
}

const updateSubMeta = (subMeta : SubMeta) => {

    const index = componentData.subMetas.findIndex((sm : SubMeta) => sm.id === subMeta.id);
    
    if(index !== -1){

    componentData.subMetas[index] = subMeta;
    componentData.historico = [...componentData.historico, ...componentData.subMetas[index].historico!];
    componentData.subMetas[index].historico = undefined;
    updateMeta();

    }


}

const changeDescription = () =>{

if(componentData.isEdit){
    cancelEdit();
    updateMeta();
}
componentData.isEditDescription = true;

editableDescription.value = componentData.descricao ?? '';

nextTick(() => {
    const inputElement = editInputDescription.value;
    if (inputElement) {
    inputElement.focus(); 
    }
});

};

const cancelEditDescription = () => {

componentData.isEditDescription = false;
if(editableDescription.value){

    editableDescription.value = editableDescription.value.trim();
    if(editableDescription.value != componentData.descricao){
        if(!componentData.historico)
            componentData.historico = [];
        componentData.historico.push(`Descrição da Submeta ${componentProperties.meta.id} alterado de ${componentData.descricao} para ${editableDescription.value}`);
        componentData.descricao = editableDescription.value;
    }
}
updateMeta();
};

const updateEstado = (estado : Estados) => {
  componentData.historico.push(`Estado da Meta ${componentProperties.meta.id}: ${componentData.nome} alterado de ${componentData.estado} para ${estado}`);
  componentData.estado = estado;
  updateMeta();
}

const updatePanelState = () => {
    componentData.isOpen = !componentData.isOpen;
}

watch( () => (componentProperties.meta), (newMeta, oldMeta) =>{

    if(oldMeta != newMeta){

        componentData.nome = newMeta.nome;
        componentData.descricao = newMeta.descricao;
        componentData.subMetas = newMeta.subMetas;
        componentData.historico = newMeta.historico;
        componentData.estado = newMeta.estado;
        componentData.qntSubMetas = newMeta.subMetasNumber;
        editableName.value = newMeta.nome;
    }
});

const updateOrder = (event : SortableEvent) =>{
  const { oldIndex, newIndex } = event;

  if(oldIndex != newIndex){
  const movedItem = componentData.subMetas.find(sm => sm.indice == oldIndex);
  if(movedItem){
  if(!movedItem.historico)
    movedItem.historico = [];
  movedItem.historico.push(`A SubMeta ${movedItem!.id}: ${movedItem!.nome} foi movida da posição ${oldIndex} para ${newIndex}`);

  componentData.subMetas.forEach((subMeta) => {
    if (subMeta.indice === oldIndex) {
        subMeta.indice = newIndex;
    } else if (subMeta.indice >= newIndex && subMeta.indice < oldIndex) {
        subMeta.indice++;
    } else if (subMeta.indice <= newIndex && subMeta.indice > oldIndex) {
        subMeta.indice--;
    }
    
  });
  
  updateMeta();
  }
  }
}

</script>