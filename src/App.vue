<template>
  <btn :onclick="addMeta">Adicionar Meta</btn>
  <div v-if="metas.length > 0">
    <ul>
      <li v-for="meta in metas" :key="meta">
        <Metas :nome="meta.nome" :sub-metas="meta.subMetas" :estado="meta.estado" :descricao="meta.descricao"></Metas>
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

const metas = ref<Meta[]>([]);


onMounted(()=>{
  metas.value = [];
})

const addMeta = () =>{
  metas.value.push({
    nome:`Meta ${metas.value.length + 1}`,
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
