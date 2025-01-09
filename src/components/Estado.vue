<template>
    <div class="estado-container" @click="changeEstado">
      <div :class="`estado-bolinha ${estadoClasses[componentData.estado]}`"> </div>
      <p v-if="!componentData.isEdit || (componentData.estado == Estados.Finalizado || componentData.estado == Estados.Aboratdo)"> {{ componentData.estado }}</p>
      <select ref="editInput" v-else v-model="componentData.estado" @change="cancelEdit">
        <option v-for="(estado, index) in estadosDisponiveis" :key="index" :value="estado">
          {{ estado }}
        </option>
      </select>
    </div>
</template>


<script lang = "ts">
import {  reactive, ref, nextTick, watch } from "vue";
import { Estados } from "@/enums/Estados";

export enum EEstadoEventsNames{
  onUpdateEstado = 'updateEstado',
}

interface IEstadoEvents{
  (e: EEstadoEventsNames.onUpdateEstado, E : Estados) : void;
}

interface EstadoComponentProperties {
  estado: Estados,
}

interface EstadoComponentData {
  estado: Estados,
  isEdit: boolean,
}

</script>


<script lang = "ts" setup>

const emits = defineEmits<IEstadoEvents>();
const componentProperties = withDefaults(defineProps<EstadoComponentProperties>(),{});
const componentData  = reactive<EstadoComponentData>({
  estado: componentProperties.estado,
  isEdit: false,
});

const estadoClasses: Record<string, string> = {
  [Estados.NaoIniciado]: "nao-iniciado",
  [Estados.EmProgresso]: "em-progresso",
  [Estados.Pausado]: "pausado",
  [Estados.Deletado]: "deletado",
  [Estados.Finalizado]: "finalizado",
  [Estados.Aboratdo]: "abortado",
};

const estadosDisponiveis = Object.values(Estados).filter((estado) => estado !== Estados.Deletado);

const editInput = ref(null);


const changeEstado = () => {
  componentData.isEdit = true;
  nextTick(() => {
      const inputElement = editInput.value;
      if (inputElement) {
        inputElement.focus(); 
      }
  });

};
const cancelEdit = () =>{
  componentData.isEdit = false;
  emits(EEstadoEventsNames.onUpdateEstado, componentData.estado);
}

watch( () => (componentProperties.estado), (newEstado, oldEstado) =>{

  if(oldEstado != newEstado)
    componentData.estado = newEstado;

})

</script>
