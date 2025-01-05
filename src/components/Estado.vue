<template>
    <div class="estado-container" @click="changeEstado">
    <div :class="`estado-bolinha ${estadoClasses[componentData.estado]}`"> </div>
    <p v-if="!componentData.isEdit"> {{ componentData.estado }}</p>
    <select ref="editInput" v-else v-model="componentData.estado" @change="cancelEdit">
      <option v-for="(estado, index) in estadosDisponiveis" :key="index" :value="estado">
        {{ estado }}
      </option>
    </select>
    </div>
</template>


<script lang = "ts">
import {  reactive, ref, nextTick } from "vue";
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
</script>

<style scoped>

.estado-container{
    display: flex;
    flex-direction: row;
    align-items: center;
}

.estado-bolinha {
  width: 15px;
  height: 15px;
  border-radius: 50%;
}

.nao-iniciado {
  background-color: gray;
}

.em-progresso {
  background-color: blue;
}

.finalizado {
  background-color: green;
}

.abortado {
    background-color: red;
}


.pausado {
  background-color: orange;
}

.deletado {
  background-color: red;
}

.estado-edit {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>