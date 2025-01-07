<template>
  <button :onclick="addMeta">Adicionar Meta</button>
  <div v-if="metasList.length > 0">
    <draggable v-model="metasList" tag="ol" itemKey="indice" @end="updateOrder">
      <template #item="{element: m}"> 
        <li :key="m.id" v-if="!m.isDeleted">
        <Metas :meta="m" @delete-meta="deleteMeta" @update-meta="updateMeta"></Metas>
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

</script>

<script setup lang="ts">

const metasList = ref<Meta[]>([]);
const metasQnt = ref<number>(0);


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
    indice: metasList.value.length
  };
  newMeta.historico.push(`[${new Date().toLocaleString()}] - Meta ${numero+1} criada`);
  metasList.value.push(newMeta);

  
  metasQnt.value = metasQnt.value+1;

  localStorage.setItem('metas', JSON.stringify(metasList.value));
  localStorage.setItem('metasQnt', JSON.stringify(metasQnt.value));
};

const deleteMeta = (id: number) =>{

  const index = metasList.value.findIndex((m : Meta) => m.id === id);

  if (index !== -1) {
    metasList.value[index].isDeleted = true;
    const indice = metasList.value[index].indice;
    metasList.value.forEach(m =>{
      if(m.indice > indice)
      m.indice = m.indice-1;
  })
  metasList.value[index].indice = -1;
  }

  localStorage.setItem('metas', JSON.stringify(metasList.value));
};

const updateMeta = (meta: Meta) =>{

const index = metasList.value.findIndex((m : Meta) => m.id === meta.id);

if (index !== -1) {
  metasList.value[index] = meta;
}

localStorage.setItem('metas', JSON.stringify(metasList.value));
};

const updateOrder = (event : SortableEvent) =>{
  const { oldIndex, newIndex } = event;

  if(oldIndex != newIndex){
  const movedItem = metasList.value.find(m => m.indice == oldIndex);
  if(movedItem){
  if(!movedItem.historico)
    movedItem.historico = [];
  movedItem.historico.push(`[${new Date().toLocaleString()}] - A Meta ${movedItem!.id}: ${movedItem!.nome} foi movida da posição ${oldIndex} para ${newIndex}`);

  metasList.value.forEach((meta) => {
    if (meta.indice === oldIndex) {
      meta.indice = newIndex;
    } else if (meta.indice >= newIndex && meta.indice < oldIndex) {
      meta.indice++;
    } else if (meta.indice <= newIndex && meta.indice > oldIndex) {
      meta.indice--;
    }
    
  });
  
  localStorage.setItem('metas', JSON.stringify(metasList.value));
  }
  }
}

</script>

<style scoped>
</style>
