<template>
    <v-expansion-panels>
        <v-expansion-panel>
            <v-expansion-panel-title>
                <div class="d-flex flex-column w-100">
                    <div class = "d-flex flex-row justify-space-between">
                        {{ editableName }}
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
            <v-expansion-panel-text>
                <div>
                    <div>
                    <div>
                        <h1 @click="changeName" v-if="!(componentData.isEdit) || (componentData.estado == Estados.Finalizado || componentData.estado == Estados.Aboratdo)">
                            {{ editableName }}
                        </h1>
                        <input v-else ref="editInput" v-model="editableName" @blur="cancelEdit">
                        <Estado :estado="componentData.estado" @update-estado="updateEstado"></Estado>
                    </div>

                    <div>
                        <div v-if="componentData.estado != Estados.Finalizado && componentData.estado != Estados.Aboratdo">
                            <h3 @click="changeDescription" v-if="!componentData.isEditDescription"> {{ componentData.descricao ?? 'Descrição'}} </h3>
                            <input v-else ref="editInputDescription" v-model="editableDescription" @blur="cancelEditDescription">
                            <v-btn prepend-icon="mdi-plus" color="white" @click="addSubMeta" elevated>
                                Adicionar SubMeta
                            </v-btn>
                            <v-btn prepend-icon="mdi-delete" color="white" @click="confirmDeletion" elevated>
                                Deletar Meta
                            </v-btn>
                        </div>
                        
                        <div v-else>
                            <v-btn prepend-icon="mdi-redo-variant" color="white" @click="confirmReopen" elevated>
                                Reabrir Meta
                            </v-btn>
                            <ConfirmDialog v-if="componentData.openReopenConfirmationDialog" :title="dialogTitle" :message="dialogMessage" :is-open="componentData.openReopenConfirmationDialog" @update-response="reopenMeta"></ConfirmDialog>
                        </div>
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
                <div>
                    <draggable v-if="componentData.subMetas.length > 0" v-model="componentData.subMetas" tag="ol" itemKey="id" @end="updateOrder">
                            <template #item="{element: sm}"> 
                                <li :key="sm.id" v-if="!sm.isDeleted">
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