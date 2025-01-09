<template>

  <div class = "d-flex flex-column align-center">
    <h1>GoalKepper</h1>
    <p>Seu Gerenciador de Metas</p>
    <div class = "d-flex flex-row botoes">
      <v-btn prepend-icon="mdi-plus" color="white" @click="addMeta" elevated>
      Adicionar Meta
      </v-btn>
      <RecuperarMetas :metas="metasList" @recuperar-meta="recoverMeta"></RecuperarMetas>
    </div>
  </div>

  
  <div v-if="hasSomeUnFinishedValue" class="metas">
      <h1>Metas em Aberto</h1>
      <draggable v-model="metasList" tag="ol" itemKey="id" @end="updateOrder">
        <template #item="{element: m}"> 
          <li :key="m.id" v-if="!m.isDeleted && (m.estado != Estados.Finalizado && m.estado != Estados.Aboratdo)" class="meta-item">
            <Metas :meta="m" @delete-meta="deleteMeta" @update-meta="updateMeta"></Metas>
          </li>
        </template>
      </draggable>
    </div>

  
    <div v-if="hasSomeFinishedValue" class="metas">
      <h1>Metas Finalizadas</h1>
      <draggable v-model="metasList" tag="ol" itemKey="id" @end="updateOrder">
        <template #item="{element: m}"> 
          <li :key="m.id" v-if="!m.isDeleted && (m.estado == Estados.Finalizado || m.estado == Estados.Aboratdo)" class="meta-item">
            <Metas :meta="m" @delete-meta="deleteMeta" @update-meta="updateMeta" @reopen-meta="reopenMeta"></Metas>
          </li>
        </template>
      </draggable>
    </div>
  
</template>


<script lang="ts">
import draggable from "vuedraggable";
import { onMounted, ref } from 'vue';
import { Estados } from "@/enums/Estados";
import Metas from './components/Metas.vue';
import type { SortableEvent } from "sortablejs"
import type Meta from './interfaces/Meta';
import RecuperarMetas from "./components/RecuperarMetas.vue";

</script>

<script setup lang="ts">

const hasSomeFinished = () : boolean =>{
  if(metasList.value.some(m => (m.estado == Estados.Finalizado || m.estado == Estados.Aboratdo) && m.isDeleted == false))
    return true;
  return false;
}
const hasSomeUnFinished = () : boolean =>{
  if(metasList.value.some(m => (m.estado != Estados.Finalizado && m.estado != Estados.Aboratdo) && m.isDeleted == false))
    return true;
  return false;
}

const metasList = ref<Meta[]>([]);
const metasQnt = ref<number>(0);
const hasSomeFinishedValue = ref<boolean>(false);
const hasSomeUnFinishedValue = ref<boolean>(false);

onMounted(() => {
  const metasSalvas = localStorage.getItem('metas');
  const qntMetas = localStorage.getItem('metasQnt');

  if (metasSalvas) {
    metasList.value = JSON.parse(metasSalvas); 
  } else {
    metasList.value = []; 
  }

  if (qntMetas) {
    metasQnt.value = JSON.parse(qntMetas); 
  } else {
    metasQnt.value = 0; 
  }
  
  localStorage.setItem('metas', JSON.stringify(metasList.value));
  localStorage.setItem('metasQnt', JSON.stringify(metasQnt.value));
  hasSomeFinishedValue.value = hasSomeFinished();
  hasSomeUnFinishedValue.value = hasSomeUnFinished();
});

const addMeta = () =>{
  
  const numero = metasQnt.value;
  const newMeta = {
    id: numero+1,
    nome:`Meta ${numero+1}`,
    subMetas: [],
    subMetasNumber: 0,
    historico: [] as string[],
    estado: Estados.NaoIniciado,
    isDeleted: false,
  };
  newMeta.historico.push(`[${new Date().toLocaleString()}] - Meta ${numero+1} criada`);
  metasList.value.push(newMeta);

  
  metasQnt.value = metasQnt.value+1;

  localStorage.setItem('metas', JSON.stringify(metasList.value));
  localStorage.setItem('metasQnt', JSON.stringify(metasQnt.value));
  hasSomeUnFinishedValue.value = hasSomeUnFinished();
};

const deleteMeta = (id: number) =>{

  const index = metasList.value.findIndex((m : Meta) => m.id === id);

  if (index !== -1) {
    metasList.value[index].isDeleted = true;
  }

  localStorage.setItem('metas', JSON.stringify(metasList.value));
  hasSomeFinishedValue.value = hasSomeFinished();
  hasSomeUnFinishedValue.value = hasSomeUnFinished();
};

const updateMeta = (meta: Meta) =>{

  const index = metasList.value.findIndex((m : Meta) => m.id === meta.id);

  if (index !== -1) {
    metasList.value[index] = meta;
  }

  localStorage.setItem('metas', JSON.stringify(metasList.value));
  hasSomeFinishedValue.value = hasSomeFinished();
  hasSomeUnFinishedValue.value = hasSomeUnFinished();
  };

  const updateOrder = (event : SortableEvent) =>{
    const { oldIndex, newIndex } = event;

    if(oldIndex != newIndex){
    const movedItem = metasList.value[oldIndex]
    if(movedItem){
    if(!movedItem.historico)
      movedItem.historico = [];
    movedItem.historico.push(`[${new Date().toLocaleString()}] - A Meta ${movedItem!.id}: ${movedItem!.nome} foi movida da posição ${oldIndex} para ${newIndex}`);

    

    localStorage.setItem('metas', JSON.stringify(metasList.value));
    hasSomeFinishedValue.value = hasSomeFinished();
    hasSomeUnFinishedValue.value = hasSomeUnFinished();
    }
    }
}

const recoverMeta = (m : Meta) => {

  
  const currentItemIndex = metasList.value.findIndex((meta : Meta) => meta.id == m.id);

  m.estado = Estados.NaoIniciado;
  m.isDeleted = false;
  m.historico.push(`[${new Date().toLocaleString()}] - A Meta ${m.id}: ${m.nome} foi recuperada após ser removida`);
  
  if (currentItemIndex !== -1) {

    const [recortado] = metasList.value.splice(currentItemIndex, 1);

    metasList.value.push(recortado);

    localStorage.setItem('metas', JSON.stringify(metasList.value));
  }
  
}

const resetData = () => {

  metasList.value = [];
  metasQnt.value = 0;
  
  localStorage.setItem('metas', JSON.stringify(metasList.value));
  localStorage.setItem('metasQnt', JSON.stringify(metasQnt.value));
  hasSomeFinishedValue.value = hasSomeFinished();
  hasSomeUnFinishedValue.value = hasSomeUnFinished();
}

const reopenMeta = (id: number) =>{


  const currentItemIndex = metasList.value.findIndex((meta : Meta) => meta.id == id);
  
  if (currentItemIndex !== -1) {

    const [recortado] = metasList.value.splice(currentItemIndex, 1);

    metasList.value.push(recortado);

    localStorage.setItem('metas', JSON.stringify(metasList.value));

  }
}

</script>

<style scoped>
</style>
