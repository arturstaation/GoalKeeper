<template>
  <button :onclick="addMeta">Adicionar Meta</button>
  <div v-if="metasList.length > 0">
    <ul>
      <li v-for="m in metasList" :key="m.id">
        <Metas :id="m.id" :nome="m.nome" :sub-metas="m.subMetas" :estado="m.estado" :descricao="m.descricao" @delete-meta="deleteMeta"></Metas>
      </li>
    </ul>
    </div>
  
</template>


<script lang="ts">

import { onMounted, ref } from 'vue';
import Metas from './components/Metas.vue';
import Meta from './interfaces/Meta';

</script>

<script setup lang="ts">

const metasList = ref<Meta[]>([]);


onMounted(()=>{
  metasList.value = [];
})

const addMeta = () =>{
  
  const numero = metasList.value.length > 0 ? metasList.value[(metasList.value.length)-1].id + 1 : 1;
  metasList.value.push({
    id: numero,
    nome:`Meta ${numero}`,
    subMetas: [],
    historico: [],
    estado: "Não Inciado"
  })
};

const deleteMeta = (id: number) =>{

  const index = metasList.value.findIndex((m : Meta) => m.id === id);

  if (index !== -1) {
    metasList.value.splice(index, 1);
  }

}

</script>

<style scoped>
btn{
  color:red;
}
</style>
