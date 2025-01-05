<template>
  <button :onclick="addMeta">Adicionar Meta</button>
  <div v-if="metasList.length > 0">
    <ul>
      <div v-for="m in metasList">
        <li  :key="m.id" v-if="!m.isDeleted">
        <Metas :id="m.id" :nome="m.nome" :sub-metas="m.subMetas" :estado="m.estado" :descricao="m.descricao" :historico="m.historico" @delete-meta="deleteMeta" @update-meta="updateMeta"></Metas>
        </li>
      </div>
    </ul>
    </div>
  
</template>


<script lang="ts">

import { onMounted, ref } from 'vue';
import { Estados } from "@/enums/Estados";
import Metas from './components/Metas.vue';
import Meta from './interfaces/Meta';

</script>

<script setup lang="ts">

const metasList = ref<Meta[]>([]);


onMounted(() => {
  const metasSalvas = localStorage.getItem('metas');

  if (metasSalvas) {
    metasList.value = JSON.parse(metasSalvas); 
  } else {
    metasList.value = []; 
  }
  
  localStorage.setItem('metas', JSON.stringify(metasList.value));
});

const addMeta = () =>{
  
  const numero = metasList.value.length > 0 ? metasList.value[(metasList.value.length)-1].id + 1 : 1;
  metasList.value.push({
    id: numero,
    nome:`Meta ${numero}`,
    subMetas: [],
    historico: [],
    estado: Estados.NaoIniciado,
    isDeleted: false,
  })

  localStorage.setItem('metas', JSON.stringify(metasList.value));
};

const deleteMeta = (id: number) =>{

  const index = metasList.value.findIndex((m : Meta) => m.id === id);

  if (index !== -1) {
    metasList.value[index].isDeleted = true;
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


</script>

<style scoped>
</style>
