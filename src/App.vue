<template>
  <btn :onclick="addMeta">Adicionar Meta</btn>
  <div v-if="metasList.length > 0">
    <ul>
      <li v-for="m in metasList" :key="m.id">
        <Metas :nome="m.nome" :sub-metas="m.subMetas" :estado="m.estado" :descricao="m.descricao"></Metas>
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
  metasList.value.push({
    id: metasList.value.length + 1,
    nome:`Meta ${metasList.value.length + 1}`,
    subMetas: [],
    historico: [],
    estado: "Não Inciado"
  })
}

</script>

<style scoped>
btn{
  color:red;
}
</style>
