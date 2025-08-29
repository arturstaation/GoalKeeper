<template>
  <div class="gk-submeta">
    <div class="gk-header">
      <span class="edit-inline gk-title-line">
        <h3
          v-if="!componentData.isEdit"
          class="gk-clickable-title gk-title-wrap"
          :class="(componentProperties.parentState == Estados.Finalizado || componentProperties.parentState == Estados.Abortado) ? 'is-readonly' : ''"
          @click="(componentProperties.parentState == Estados.Finalizado || componentProperties.parentState == Estados.Abortado) ? null : changeName()"
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

        <v-icon
          v-if="!componentData.isEdit && !(componentProperties.parentState == Estados.Finalizado || componentProperties.parentState == Estados.Abortado)"
          icon="mdi-pencil"
          size="18"
          class="edit-icon-inline"
          title="Editar nome"
          @click.stop="changeName"
        />
      </span>

      <Estado class="gk-estado" :estado="componentData.estado" @update-estado="updateEstado" />
    </div>

    <span class="edit-inline">
      <h5
        v-if="!componentData.isEditDescription"
        class="gk-clickable-subtle gk-desc-wrap"
        :class="(componentProperties.parentState == Estados.Finalizado || componentProperties.parentState == Estados.Abortado) ? 'is-readonly' : ''"
        @click="(componentProperties.parentState == Estados.Finalizado || componentProperties.parentState == Estados.Abortado) ? null : changeDescription()"
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

      <v-icon
        v-if="!componentData.isEditDescription && !(componentProperties.parentState == Estados.Finalizado || componentProperties.parentState == Estados.Abortado)"
        icon="mdi-pencil"
        size="18"
        class="edit-icon-inline"
        title="Editar descrição"
        @click.stop="changeDescription"
      />
    </span>
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
  subMeta: SubMeta,
  parentState: Estados
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
  if(componentProperties.parentState == Estados.Finalizado || componentProperties.parentState == Estados.Abortado)
    return
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

  const subMetaId = componentProperties.subMeta.id;
  const fallback = `SubMeta ${subMetaId}`;

  const raw = editableName?.value as string | undefined;
  const original = (componentData.nome ?? '').trim() || fallback;

  const normalize = (v: string | undefined | null): string => {
    if (v == null) return fallback;
    const t = v.trim();
    return t === '' ? fallback : t;
    };
  const incoming = normalize(raw);

  if (incoming === original) {
    editableName.value = original;
    return;
  }

  componentData.historico ??= [];
  componentData.historico.push(
    `[${new Date().toLocaleString()}] - Nome da Submeta ${subMetaId} alterado de ${original} para ${incoming}`
  );

  componentData.nome = incoming;
  editableName.value = incoming;
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
  if(componentProperties.parentState == Estados.Finalizado || componentProperties.parentState == Estados.Abortado)
    return
  if(componentData.isEdit){
    cancelEdit();
    updateSubMeta();
  }
  componentData.isEditDescription = true;
  editableName.value = componentData.descricao;
  nextTick(() => editInputDescription.value?.focus());
};

let savingDesc = false;

const cancelEditDescription = () => {
  if (savingDesc) return;
  savingDesc = true;

  try {
    componentData.isEditDescription = false;

    const normalize = (v: string | undefined | null): string | undefined => {
      if (v == null) return undefined;
      const t = v.trim();
      return t === '' ? undefined : t;
    };

    const before = normalize(componentData.descricao);
    const raw = (editableName?.value ?? '') as string;
    const incoming = normalize(raw);

    if (incoming === before) {
      updateSubMeta();
      return;
    }

    componentData.descricao = incoming;

    componentData.historico ??= [];
    const fmt = (v: string | undefined) => (v == null ? '(vazio)' : v);
    componentData.historico.push(
      `[${new Date().toLocaleString()}] - Descrição da Submeta ${componentProperties.subMeta.id}: ` +
      `${componentData.nome} alterado de ${fmt(before)} para ${fmt(incoming)}`
    );

    updateSubMeta();
  } finally {
    setTimeout(() => { savingDesc = false; }, 0);
  }
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
box-sizing: border-box;
width: 100%;
max-width: 100%;
min-width: 0; 
display: grid; 
grid-auto-rows: auto;
gap: var(--space-3);
}

.gk-header {
display: flex; 
align-items: center;
justify-content: space-between;
gap: var(--space-4);
flex-wrap: nowrap; 
min-width: 0;
color: var(--color-text)
}

.gk-header > * { min-width: 0; }
.gk-clickable-title {
margin: 0;
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap; 
}
.gk-clickable-title:hover {
  text-decoration: underline;
}
.gk-estado { white-space: nowrap; }

.gk-actions { justify-self: start; } 
.gk-clickable-subtle {
  margin: 0;
  color: var(--color-text-muted);
  cursor: pointer;
}
.gk-clickable-subtle:hover {
  text-decoration: underline;
}

.gk-title-wrap {
  white-space: normal;          
  word-break: break-word;       
  overflow-wrap: anywhere;      
  flex: 1 1 auto;               
  min-width: 0;                 
  margin: 0;                  
}

:deep(.v-btn.btn) {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 600;
  border-radius: var(--radius-md);
}

.edit-inline {
  display: inline;
}

.gk-title-line {
  flex: 1 1 auto;
  min-width: 0;
}

.gk-clickable-title,
.gk-clickable-subtle {
  display: inline;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
  margin: 0;
}

.edit-icon-inline {
  display: inline-block;
  vertical-align: baseline;
  margin-left: 6px;
  color: var(--color-text-muted);  
  cursor: pointer;
  line-height: 1;
}
.edit-icon-inline:hover {
  color: var(--color-text);        
}

.is-readonly {
  cursor: default;
}

.gk-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: nowrap;
  min-width: 0;
  color: var(--color-text);
}
</style>