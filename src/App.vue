<template>
  <v-btn prepend-icon="mdi-plus" color="white" @click="addMeta" elevated>
  Adicionar Meta
  </v-btn>

  <v-dialog max-width="800">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn
            prepend-icon="mdi-cancel"
          v-bind="activatorProps"
          text="Metas Removidas"
        ></v-btn>
      </template>

      <template v-slot:default="{ isActive }">
        <v-card title="Metas Removidas">
          <template v-slot:text>
            <div v-for="(m, index) in metasList" :key="index">
              <div v-if="m.estado == Estados.Deletado">
                <p>{{ m.nome }}</p>
                <v-btn prepend-icon="mdi-plus" color="white" @click="recoverMeta(m)" elevated>
                Recuperar Meta
                </v-btn>
              </div>
            </div>

          </template>
        </v-card>
      </template>
    </v-dialog>

    <v-btn prepend-icon="mdi-restart" color="white" @click="resetData" elevated>
      Resetar Metas
    </v-btn>
  
  <div v-if="metasList.length > 0">
    <h1>Metas em Aberto</h1>
    <draggable v-model="metasList" tag="ol" itemKey="indice" @end="updateOrder">
      <template #item="{element: m}"> 
        <li :key="m.id" v-if="!m.isDeleted && (m.estado != Estados.Finalizado && m.estado != Estados.Aboratdo)">
        <Metas :meta="m" @delete-meta="deleteMeta" @update-meta="updateMeta"></Metas>
        </li>
      </template>
    </draggable>
    </div>

  
    <div v-if="hasSomeFinishedValue">
    <h1>Metas Finalizadas</h1>
    <draggable v-model="metasList" tag="ol" itemKey="indice" @end="updateOrder">
      <template #item="{element: m}"> 
        <li :key="m.id" v-if="!m.isDeleted && (m.estado == Estados.Finalizado || m.estado == Estados.Aboratdo)">
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

const hasSomeFinished = () : boolean =>{
  if(metasList.value.some(m => (m.estado == Estados.Finalizado || m.estado == Estados.Aboratdo) && m.isDeleted == false))
    return true;
  return false;
}

const metasList = ref<Meta[]>([]);
const metasQnt = ref<number>(0);
const hasSomeFinishedValue = ref<boolean>(false);


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
  hasSomeFinishedValue.value = hasSomeFinished();
};

const updateMeta = (meta: Meta) =>{

const index = metasList.value.findIndex((m : Meta) => m.id === meta.id);

if (index !== -1) {
  metasList.value[index] = meta;
}

localStorage.setItem('metas', JSON.stringify(metasList.value));
hasSomeFinishedValue.value = hasSomeFinished();
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
  hasSomeFinishedValue.value = hasSomeFinished();
  }
  }
}

const recoverMeta = (m : Meta) => {

  const ultimoIndice = Math.max(...metasList.value.map(m => m.indice));
  
  const lastItemIndex = metasList.value.findIndex((meta : Meta) => meta.indice == ultimoIndice);
  const currentItemIndex = metasList.value.findIndex((meta : Meta) => meta.id == m.id);
  m.estado = Estados.NaoIniciado;
  m.isDeleted = false;
  m.indice = ultimoIndice+1;
  m.historico.push(`[${new Date().toLocaleString()}] - A Meta ${m.id}: ${m.nome} foi recuperada após ser removida`);
  
  const [recortado] = metasList.value.splice(currentItemIndex, 1);

  metasList.value.splice(lastItemIndex + 1, 0, recortado);
  
  localStorage.setItem('metas', JSON.stringify(metasList.value));
  
}

const resetData = () => {

  metasList.value = [];
  metasQnt.value = 0;
  
  localStorage.setItem('metas', JSON.stringify(metasList.value));
  localStorage.setItem('metasQnt', JSON.stringify(metasQnt.value));
  hasSomeFinishedValue.value = hasSomeFinished();
}


</script>

<style scoped>
</style>
