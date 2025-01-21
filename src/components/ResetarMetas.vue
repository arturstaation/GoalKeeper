<template>
    <div>
      <v-hover v-slot:default="{ isHovering, props: hoverProps }">
        <v-btn
          prepend-icon="mdi-refresh"
          v-bind="hoverProps"
          :color="isHovering ? '#ecf0f1' : 'white'"
          rounded
          @click="teste"
        >
          Resetar Dados
        </v-btn>
      </v-hover>
  
      <ConfirmDialog
        v-if="componentData.isOpen"
        title="Resetar Metas"
        message="Tem certeza que deseja resetar suas metas? Essa ação é irreversivel e deletará todos seus dados do site"
        :is-open="componentData.isOpen"
        @update-response="resetData"
      ></ConfirmDialog>
    </div>
  </template>
  
  

<script lang = "ts">

import { onMounted, reactive } from 'vue';
import ConfirmDialog from './ConfirmDialog.vue';

export enum EResetarMetasEventsNames{
    onResetarMetas = 'resetMetas',
}

interface IRecuperarMetasEvents{
    (e: EResetarMetasEventsNames.onResetarMetas, a : boolean) : void;
}

interface RecuperarMetasComponentProperties {
    

}

interface RecuperarMetasComponentData {
    
    isOpen: boolean,

}

</script>
<script lang = "ts" setup>


const emits = defineEmits<IRecuperarMetasEvents>();

const componentProperties = withDefaults(defineProps<RecuperarMetasComponentProperties>(),{});
const componentData  = reactive<RecuperarMetasComponentData>({

    isOpen: false,
});

const resetData = (answer : boolean) =>{

    emits(EResetarMetasEventsNames.onResetarMetas, answer);
    componentData.isOpen = false;
}

const teste = () =>{
    componentData.isOpen = true;
}



</script>

<style scoped>

div {
  padding: 1rem;
}

.v-dialog {
  display: flex;
  justify-content: center;
  align-items: center;
}

.v-card {
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
}

.v-card-title {
  font-size: 1.5rem;
  color: #2c3e50;
  font-weight: bold;
}

.metas-deletadas {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #bdc3c7;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  background-color: #f9f9f9;
  transition: box-shadow 0.3s ease, transform 0.2s ease;
}

.metas-deletadas:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}


p {
  font-size: 1rem;
  color: #2c3e50;
  margin: 0;
}
</style>
