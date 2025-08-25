<template>
  <div class="gk-submeta">
    <div class="gk-header">
      <h3
        v-if="!componentData.isEdit"
        class="gk-clickable-title"
        @click="changeName"
      >
        {{ componentData.nome }}
      </h3>

      <input
        v-else
        ref="editInput"
        v-model="editableName"
        class="input"
        @blur="cancelEdit"
        @keyup.enter="cancelEdit"
        placeholder="Digite o nome da submeta"
      />

      <Estado class="gk-estado" :estado="componentData.estado" @update-estado="updateEstado" />
    </div>

    <h5
      v-if="!componentData.isEditDescription"
      class="gk-clickable-subtle"
      @click="changeDescription"
    >
      {{ componentData.descricao ?? 'Descrição' }}
    </h5>
    <input
      v-else
      ref="editInputDescription"
      v-model="editableName"
      class="input"
      @blur="cancelEditDescription"
      @keyup.enter="cancelEditDescription"
      placeholder="Digite a descrição"
    />

    <div class="gk-actions">
      <v-btn
        class="btn"
        prepend-icon="mdi-delete"
        :style="{ background: 'var(--color-danger)' }"
        rounded
        @click="deleteSubMeta"
      >
        Deletar SubMeta
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, ref, nextTick, watch, readonly } from 'vue';
import { Estados } from "@/enums/Estados";
import Estado from './Estado.vue';
import type SubMeta from '@/interfaces/SubMeta';

export enum ESubMetasEventsNames{
  onDeleteSubMeta = 'deleteSubMeta',
  onUpdateSubMeta = 'updateSubMeta',
}

interface ISubMetasEvents{
  (e: ESubMetasEventsNames.onDeleteSubMeta, SubMetaId : number) : void;
  (e: ESubMetasEventsNames.onUpdateSubMeta, SM : SubMeta) : void;
}

interface SubMetasComponentProperties {
  subMeta: SubMeta
}

interface SubMetasComponentData {
  nome: string,
  descricao?: string,
  historico?: string[],
  estado: Estados,
  isEdit: boolean,
  isEditDescription: boolean,
}
</script>

<script lang="ts" setup>

const componentProperties = withDefaults(defineProps<SubMetasComponentProperties>(),{});
const componentData = reactive<SubMetasComponentData>({
  nome: componentProperties.subMeta.nome,
  descricao: componentProperties.subMeta.descricao,
  estado: componentProperties.subMeta.estado,
  isEdit: false,
  isEditDescription: false,
});

const emits = defineEmits<ISubMetasEvents>();

const editInput = ref<HTMLInputElement | null>(null);
const editInputDescription = ref<HTMLInputElement | null>(null);
const editableName = ref<string>();

const deleteSubMeta = () => {
  componentData.estado = Estados.Deletado;
  emits(ESubMetasEventsNames.onDeleteSubMeta, componentProperties.subMeta.id);
};

const changeName = () =>{
  if(componentData.isEditDescription){
    cancelEditDescription();
    updateSubMeta();
  }
  componentData.isEdit = true;
  editableName.value = componentData.nome;
  nextTick(() => editInput.value?.focus());
};

const cancelEdit = () => {
  componentData.isEdit = false;
  if(editableName.value){
    editableName.value = editableName.value.trim();
    if(editableName.value != componentData.nome){
      if(!componentData.historico) componentData.historico = [];
      componentData.historico.push(
        `[${new Date().toLocaleString()}] - Nome da Submeta ${componentProperties.subMeta.id} alterado de ${componentData.nome} para ${editableName.value}`
      );
      componentData.nome = editableName.value;
    }
  }
  updateSubMeta();
};

const updateSubMeta = () => {
  const updatedSubMeta : SubMeta = {
    id: componentProperties.subMeta.id,
    nome: componentData.nome,
    descricao: componentData.descricao,
    estado: componentData.estado,
    historico: componentData.historico,
    isDeleted: false,
  }
  emits(ESubMetasEventsNames.onUpdateSubMeta, updatedSubMeta);
  componentData.historico = undefined;
};

const changeDescription = () =>{
  if(componentData.isEdit){
    cancelEdit();
    updateSubMeta();
  }
  componentData.isEditDescription = true;
  editableName.value = componentData.descricao;
  nextTick(() => editInputDescription.value?.focus());
};

const cancelEditDescription = () => {
  componentData.isEditDescription = false;
  if(editableName.value){
    editableName.value = editableName.value.trim();
    if(editableName.value != componentData.descricao){
      if(!componentData.historico) componentData.historico = [];
      componentData.historico.push(
        `[${new Date().toLocaleString()}] - Descrição da Submeta ${componentProperties.subMeta.id}: ${componentData.nome} alterado de ${componentData.descricao} para ${editableName.value}`
      );
      componentData.descricao = editableName.value;
    }
  }
  updateSubMeta();
};

const updateEstado = (estado : Estados) => {
  if(!componentData.historico) componentData.historico = [];
  componentData.historico.push(
    `[${new Date().toLocaleString()}] - Estado da SubMeta ${componentProperties.subMeta.id}: ${componentData.nome} alterado de ${componentData.estado} para ${estado}`
  );
  componentData.estado = estado;
  updateSubMeta();
}

watch(() => (componentProperties.subMeta), (newSubMeta, oldSubMeta) =>{
  if(newSubMeta != oldSubMeta){
    componentData.nome = newSubMeta.nome;
    componentData.descricao = newSubMeta.descricao;
    componentData.historico = newSubMeta.historico;
    componentData.estado = newSubMeta.estado;
    editableName.value = newSubMeta.nome;
  }
});
</script>

<style scoped>
.gk-submeta {
  display: grid;
  gap: var(--space-3);
}

.gk-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.gk-clickable-title {
  margin: 0 0 var(--space-2);
  font-size: clamp(16px, 2.4vw, 18px);
  color: var(--color-text);
  cursor: pointer;
}
.gk-clickable-title:hover {
  text-decoration: underline;
}

.gk-clickable-subtle {
  margin: 0;
  color: var(--color-text-muted);
  cursor: pointer;
}
.gk-clickable-subtle:hover {
  text-decoration: underline;
}

:deep(.v-btn.btn) {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 600;
  border-radius: var(--radius-md);
}
</style>