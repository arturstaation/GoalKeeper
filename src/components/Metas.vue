<template>
    <v-expansion-panels>
        <v-expansion-panel>
            <v-expansion-panel-title>
                <div class="d-flex flex-column w-100">
                    <div class = "d-flex flex-row justify-space-between">
                        <h1>{{ editableName }}</h1>
                        <Estado :estado="componentData.estado" readonly></Estado>
                    </div>
                    <div class="d-flex flex-row align-center">
                        <div class="progress-container">
                            <div class="progress-bar" :style="{ width: `${getPorcentagem()}%` }"></div>
                        </div>
                        <div class="progress-text">{{ `${getPorcentagem()}%` }}</div>
                    </div>
                </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text class = "painel-texto">
                <div>
                    <div>
                        <div>
                            <h2 @click="changeName" v-if="!(componentData.isEdit) || (componentData.estado == Estados.Finalizado || componentData.estado == Estados.Aboratdo)">
                                {{ editableName }}
                            </h2>
                            <input v-else ref="editInput" v-model="editableName" @blur="cancelEdit">
                            <Estado :estado="componentData.estado" @update-estado="updateEstado"></Estado>
                        </div>

                        <h4 @click="changeDescription" v-if="!componentData.isEditDescription  || (componentData.estado == Estados.Finalizado || componentData.estado == Estados.Aboratdo)"> {{ componentData.descricao ?? 'Descrição'}} </h4>
                        <input v-else ref="editInputDescription" v-model="editableDescription" @blur="cancelEditDescription">
                        <div class = "d-flex flex-row align-center botoes">
                            <div>
                                <div v-if="componentData.estado != Estados.Finalizado && componentData.estado != Estados.Aboratdo" class="botoes">
                                    <v-btn prepend-icon="mdi-plus" color="white" @click="addSubMeta" elevated>
                                        Adicionar SubMeta
                                    </v-btn>
                                    <v-btn prepend-icon="mdi-delete" color="white" @click="confirmDeletion" elevated style="background-color: #e74c3c; color: white;" >
                                        Deletar Meta
                                    </v-btn>
                                </div>
                                
                                <div v-else>
                                    <v-btn prepend-icon="mdi-redo-variant" color="white" @click="confirmReopen" elevated>
                                        Reabrir Meta
                                    </v-btn>
                                    <ConfirmDialog v-if="componentData.openReopenConfirmationDialog" :title="dialogTitle" :message="dialogMessage" :is-open="componentData.openReopenConfirmationDialog" @update-response="reopenMeta"></ConfirmDialog>
                                </div>
                            </div>
                            <div>
                                <v-dialog max-width="800">
                                    <template v-slot:activator="{ props: activatorProps }">
                                        <v-btn
                                            prepend-icon="mdi-history"
                                            v-bind="activatorProps"
                                            text="Ver Historico"
                                        ></v-btn>
                                    </template>

                                    <template v-slot:default="{ isActive }">
                                        <v-card :title="`Histórico da Meta ${componentProperties.meta.id}: ${componentData.nome}`">
                                            <template v-slot:text>
                                                <div v-for="(h, index) in componentData.historico" :key="index">
                                                    <p>{{ h }}</p>
                                                </div>
                                            </template>
                                        </v-card>
                                    </template>
                                </v-dialog>
                            </div>
                        </div>
                    </div>
                    <div>
                        <draggable v-if="componentData.subMetas.length > 0" v-model="componentData.subMetas" tag="ol" itemKey="id" @end="updateOrder">
                                <template #item="{element: sm}"> 
                                    <li :key="sm.id" v-if="!sm.isDeleted" class="submeta-item">
                                        <SubMetas :sub-meta="sm" @delete-sub-meta="deleteSubMeta" @update-sub-meta="updateSubMeta"></SubMetas>
                                    </li>
                                </template>
                            </draggable>
                    </div>
                        
                </div>

                <ConfirmDialog v-if="componentData.openConfirmationDialog" :title="dialogTitle" :message="dialogMessage" :is-open="componentData.openConfirmationDialog" @update-response="deleteMeta"></ConfirmDialog>
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
import ConfirmDialog from "./ConfirmDialog.vue";

export enum EMetasEventsNames{
    onDeleteMeta = 'deleteMeta',
    onUpdateMeta = 'updateMeta',
    onReopenMeta = 'reopenMeta',
}

interface IMetasEvents{
    (e: EMetasEventsNames.onDeleteMeta, MetaId : number) : void;
    (e: EMetasEventsNames.onUpdateMeta, newMeta : Meta) : void;
    (e: EMetasEventsNames.onReopenMeta, MetaId : number) : void;
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
    qntSubMetas: number,
    openConfirmationDialog: boolean,
    openReopenConfirmationDialog: boolean,
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
    qntSubMetas: componentProperties.meta.subMetasNumber,
    openConfirmationDialog: false,
    openReopenConfirmationDialog: false,
});

const editInput = ref(null);
const editInputDescription = ref(null);
const editableName = ref<string>(componentData.nome);
const editableDescription = ref<string>(componentData.nome);
const dialogTitle = ref<string>();
const dialogMessage = ref<string>();

const addSubMeta = () => {
    const numero = componentData.qntSubMetas;
        componentData.subMetas.push({
        id: numero+1,
        nome:`SubMeta ${numero+1}`,
        estado: Estados.NaoIniciado,
        isDeleted: false
    });
    componentData.qntSubMetas = componentData.qntSubMetas+1;
    componentData.historico.push(`[${new Date().toLocaleString()}] - SubMeta ${numero+1} criada`);
    updateMeta();

};

const deleteSubMeta = (id:number) => {
    const index = componentData.subMetas.findIndex((sm : SubMeta) => sm.id === id);

    if (index !== -1) {
        componentData.subMetas[index].isDeleted = true;
        componentData.historico.push(`[${new Date().toLocaleString()}] - SubMeta ${id}: ${componentData.subMetas[index].nome}  deletada`);
    }

    updateMeta();

};

const confirmDeletion = () => {
    componentData.openConfirmationDialog = true;
    
    dialogMessage.value = `Tem certeza que deseja deletar a Meta : ${componentData.nome}?`
    dialogTitle.value = `Deletar Meta ${componentData.nome}`
}

const deleteMeta = (answer : boolean) => {

    if(answer){
        componentData.historico.push(`[${new Date().toLocaleString()}] - Meta ${componentProperties.meta.id}: ${componentData.nome} deletada`);
        componentData.estado = Estados.Deletado;
        updateMeta();
        emits(EMetasEventsNames.onDeleteMeta, componentProperties.meta.id);
    }
    
    componentData.openConfirmationDialog = false;

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
            componentData.historico.push(`[${new Date().toLocaleString()}] - Nome da meta ${componentProperties.meta.id} alterado de ${componentData.nome} para ${editableName.value}`);
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
            componentData.historico.push(`[${new Date().toLocaleString()}] - Descrição da Meta ${componentProperties.meta.id}: ${componentData.nome} alterado de ${componentData.descricao} para ${editableDescription.value}`);
            componentData.descricao = editableDescription.value;
        }
    }
    updateMeta();
};

const updateEstado = (estado : Estados) => {
  componentData.historico.push(`[${new Date().toLocaleString()}] - Estado da Meta ${componentProperties.meta.id}: ${componentData.nome} alterado de ${componentData.estado} para ${estado}`);
  componentData.estado = estado;
  updateMeta();
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
    const movedItem = componentData.subMetas[oldIndex];
    if(movedItem){
        if(!movedItem.historico)
            movedItem.historico = [];
        movedItem.historico.push(`[${new Date().toLocaleString()}] - A SubMeta ${movedItem!.id}: ${movedItem!.nome} foi movida da posição ${oldIndex} para ${newIndex}`);

        
        updateMeta();
    }
  }
}

const confirmReopen = () =>{

    componentData.openReopenConfirmationDialog = true;
    dialogMessage.value = `Tem certeza que deseja reabrir a Meta : ${componentData.nome}?`
    dialogTitle.value = `Reabrir Meta ${componentData.nome}`
}

const reopenMeta = (answer: boolean) =>{

    if(answer){
        updateEstado(Estados.NaoIniciado);
        emits(EMetasEventsNames.onReopenMeta, componentProperties.meta.id);
    }
    
    componentData.openReopenConfirmationDialog = false;

}

const getPorcentagem = () : number =>{


    let qntSubMetas = 0;
    let qntSubMetasFinalizadas = 0;
    componentData.subMetas.forEach((sm : SubMeta) => {
        if(!sm.isDeleted){
            qntSubMetas++;
            if(sm.estado == Estados.Finalizado || sm.estado == Estados.Aboratdo){
                qntSubMetasFinalizadas++;
            }
        }

    });

    if(qntSubMetas == 0)
        return 0
    return Math.trunc((qntSubMetasFinalizadas / qntSubMetas) * 100 * 100) / 100;;

}
 

</script>

<style scoped>
.d-flex {
  display: flex;
}

.flex-column {
  flex-direction: column;
}

.flex-row {
  flex-direction: row;
}

.align-center {
  align-items: center;
}

.justify-space-between {
  justify-content: space-between;
}

h1 {
  font-size: 1.8rem;
  color: #2c3e50;
}

h2, h4 {
  margin: 0;
  color: #34495e;
}

h2 {
  cursor: pointer;
}

h4 {
  font-size: 1rem;
  color: #7f8c8d;
  cursor: pointer;
}

h2:hover,
h4:hover {
  text-decoration: underline;
}

.progress-container {
  width: 100%;
  height: 8px;
  background-color: #ecf0f1;
  border-radius: 5px;
  margin: 0 10px;
  position: relative;
}

.progress-bar {
  height: 100%;
  background-color: #27ae60;
  border-radius: 5px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.9rem;
  color: #34495e;
}

.botoes {
  gap: 1rem;
  margin-top: 1rem;
}

v-btn {
  font-size: 0.9rem;
  background-color: #3498db;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

v-btn:hover {
  background-color: #2980b9;
}

v-btn[prepend-icon="mdi-redo-variant"] {
  background-color: #f39c12;
}

v-btn[prepend-icon="mdi-redo-variant"]:hover {
  background-color: #e67e22;
}

.submeta-item {
  padding: 1rem;
  margin-bottom: 0.5rem;
  border: 1px solid #bdc3c7;
  border-radius: 8px;
  background-color: #f9f9f9;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.submeta-item:hover {
  transform: translateY(-3px);
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.painel-texto {
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  margin-top: 1rem;
}

input {
  font-size: 1rem;
  padding: 0.5rem;
  border: 1px solid #bdc3c7;
  border-radius: 5px;
  width: 100%;
}

input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
}
</style>
