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

<style scoped>
.estado-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.estado-bolinha {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.estado-bolinha.nao-iniciado {
  background-color: #bdc3c7;
}

.estado-bolinha.em-progresso {
  background-color: #3498db;
}

.estado-bolinha.pausado {
  background-color: #f1c40f;
}

.estado-bolinha.deletado {
  background-color: #e74c3c;
}

.estado-bolinha.finalizado {
  background-color: #27ae60;
}

.estado-bolinha.abortado {
  background-color: #7f8c8d;
}

.estado-container:hover .estado-bolinha {
  transform: scale(1.2);
}

.estado-container p {
  font-size: 1rem;
  color: #2c3e50;
  margin: 0;
}

select {
  font-size: 1rem;
  padding: 0.3rem 0.5rem;
  border: 1px solid #bdc3c7;
  border-radius: 5px;
  background-color: #ffffff;
  color: #2c3e50;
  cursor: pointer;
  outline: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

select:focus {
  border-color: #3498db;
  box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
}

option {
  font-size: 1rem;
  color: #2c3e50;
}
</style>
