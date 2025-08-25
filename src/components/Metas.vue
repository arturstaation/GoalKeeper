<template>
  <v-expansion-panels class="gk-expansion">
    <v-expansion-panel elevation="0" class="gk-panel card">
      <v-expansion-panel-title class="gk-panel-title">
        <div class="w-100" style="display:flex;flex-direction:column;gap:8px;">
          <div class="gk-title-row">
            <h1 class="h1" style="font-size: clamp(18px, 2.6vw, 24px); margin: 0;">{{ editableName }}</h1>
            <Estado :estado="componentData.estado" readonly />
          </div>

          <div class="gk-progress-row">
            <div class="progress" style="flex:1;">
              <div class="progress__bar" :style="`--progress:${getPorcentagem()}%`"></div>
            </div>
            <div class="progress-text subtle">{{ `${getPorcentagem()}%` }}</div>
          </div>
        </div>
      </v-expansion-panel-title>

      <v-expansion-panel-text class="gk-panel-text">
        <div class="card" style="padding: var(--space-4);">

          <div class="gk-header-edit">
            <div class="gk-name-edit">
              <h2
                v-if="!(componentData.isEdit) || (componentData.estado == Estados.Finalizado || componentData.estado == Estados.Abortado)"
                class="gk-clickable-title"
                @click="changeName"
              >
                {{ editableName }}
              </h2>
              <input
                v-else
                ref="editInput"
                v-model="editableName"
                class="input"
                @blur="cancelEdit"
                @keyup.enter="cancelEdit"
                placeholder="Digite o nome da meta"
              />

              <Estado :estado="componentData.estado" @update-estado="updateEstado" />
            </div>

            <div class="gk-description">
              <h4
                v-if="!componentData.isEditDescription || (componentData.estado == Estados.Finalizado || componentData.estado == Estados.Abortado)"
                class="gk-clickable-subtle"
                @click="changeDescription"
              >
                {{ componentData.descricao ?? 'Descrição' }}
              </h4>
              <input
                v-else
                ref="editInputDescription"
                v-model="editableDescription"
                class="input"
                @blur="cancelEditDescription"
                @keyup.enter="cancelEditDescription"
                placeholder="Digite a descrição"
              />
            </div>
          </div>

          <div class="botoes" style="display:flex;align-items:center;gap:12px;margin-top:var(--space-4);flex-wrap:wrap;">
            <template v-if="componentData.estado != Estados.Finalizado && componentData.estado != Estados.Abortado">
              <div class="subbotoes" style="display:flex;flex-direction:row;gap:12px;flex-wrap:wrap;">
                <v-btn class="btn" prepend-icon="mdi-plus" color="primary" rounded @click="addSubMeta">
                  Adicionar SubMeta
                </v-btn>

                <v-btn class="btn" prepend-icon="mdi-delete" rounded :style="{ background: 'var(--color-danger)' }" @click="confirmDeletion">
                  Deletar Meta
                </v-btn>
              </div>
            </template>

            <template v-else>
              <v-btn class="btn" prepend-icon="mdi-redo-variant" rounded :style="{ background: 'var(--color-warning)' }" @click="confirmReopen">
                Reabrir Meta
              </v-btn>

              <ConfirmDialog
                v-if="componentData.openReopenConfirmationDialog"
                :title="dialogTitle"
                :message="dialogMessage"
                :is-open="componentData.openReopenConfirmationDialog"
                @update-response="reopenMeta"
              />
            </template>

            <v-dialog max-width="640">
              <template #activator="{ props }">
                <v-btn class="btn ghost" prepend-icon="mdi-history" v-bind="props">
                  Ver Histórico
                </v-btn>
              </template>

              <v-card class="card" elevation="0" style="padding: var(--space-4);">
                <template #title>
                  <div class="h1" style="font-size: clamp(18px, 2.6vw, 22px);">Histórico da Meta {{ componentProperties.meta.id }}: {{ componentData.nome }}</div>
                </template>
                <template #text>
                  <div class="list" style="margin-top: var(--space-3);">
                    <div v-for="(h, index) in componentData.historico" :key="index" class="list-item" style="padding: var(--space-3);">
                      <p class="subtle" style="margin:0;">{{ h }}</p>
                    </div>
                  </div>
                </template>
              </v-card>
            </v-dialog>
          </div>
        </div>

        <div style="margin-top: var(--space-4);">
          <template v-if="componentData.subMetas.length > 0">
            <draggable
              v-model="componentData.subMetas"
              tag="ol"
              itemKey="id"
              class="list"
              :animation="180"
              :ghost-class="'drag-ghost'"
              :chosen-class="'drag-chosen'"
              :drag-class="'drag-dragging'"
              :handle="'.drag-handle'"
              :delay="isTouchDevice ? 120 : 0"
              :delay-on-touch-only="true"
              :fallback-tolerance="5"
              :group="{ name: `submetas-${componentProperties.meta.id}`, put: false, pull: false }"
              @start="onDragStart"
              @end="updateOrder"
            >
              <template #item="{ element: sm }">
                <div class="submeta-row">
                  <div class="item-header">
                      <button class="drag-handle" aria-label="Reordenar" title="Arraste para reordenar">↕</button>
                  </div>
                  <li
                    :key="sm.id"
                    v-if="!sm.isDeleted"
                    class="list-item submeta-item"
                    tabindex="0"
                    :data-id="sm.id"
                  >
                      <SubMetas
                        :sub-meta="sm"
                        @delete-sub-meta="deleteSubMeta"
                        @update-sub-meta="updateSubMeta"
                      />
                  </li>
                </div>
              </template>
            </draggable>
          </template>
          <div v-else class="empty-drop">Sem SubMetas. Adicione uma para começar.</div>
        </div>

        <ConfirmDialog
          v-if="componentData.openConfirmationDialog"
          :title="dialogTitle"
          :message="dialogMessage"
          :is-open="componentData.openConfirmationDialog"
          @update-response="deleteMeta"
        />
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
  
  <div class="sr-only" aria-live="polite">{{ dragStatus }}</div>
</template>

<script lang="ts">
import draggable from "vuedraggable";
import { ref, reactive, nextTick, watch } from 'vue';
import type SubMeta from '@/interfaces/SubMeta';
import type Meta from '@/interfaces/Meta';
import SubMetas from './SubMetas.vue';
import Estado from './Estado.vue';
import { Estados } from "@/enums/Estados";
import type { SortableEvent } from "sortablejs"
import ConfirmDialog from "./ConfirmDialog.vue";

export enum EMetasEventsNames{
  onDeleteMeta = 'deleteMeta',
  onUpdateMeta = 'updateMeta',
  onReopenMeta = 'reopenMeta',
}

interface IMetasEvents{
  (e: EMetasEventsNames.onDeleteMeta, MetaId : number) : void;
  (e: EMetasEventsNames.onUpdateMeta, newMeta : Meta) : void;
  (e: EMetasEventsNames.onReopenMeta, MetaId : number) : void;
}

interface MetasComponentProperties {
  meta: Meta
}

interface MetasComponentData {
  nome: string,
  descricao?: string,
  subMetas: SubMeta[],
  historico: string[],
  estado: Estados,
  isEdit: boolean,
  isEditDescription: boolean,
  qntSubMetas: number,
  openConfirmationDialog: boolean,
  openReopenConfirmationDialog: boolean,
}
</script>

<script setup lang="ts">

const dragStatus = ref('');
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const emits = defineEmits<IMetasEvents>();
const componentProperties = withDefaults(defineProps<MetasComponentProperties>(),{});

const componentData  = reactive<MetasComponentData>({
  nome: componentProperties.meta.nome,
  descricao: componentProperties.meta.descricao,
  subMetas: componentProperties.meta.subMetas,
  historico: componentProperties.meta.historico,
  estado: componentProperties.meta.estado,
  isEdit: false,
  isEditDescription: false,
  qntSubMetas: componentProperties.meta.subMetasNumber,
  openConfirmationDialog: false,
  openReopenConfirmationDialog: false,
});

const editInput = ref<HTMLInputElement | null>(null);
const editInputDescription = ref<HTMLInputElement | null>(null);
const editableName = ref<string>(componentData.nome);
const editableDescription = ref<string>(componentData.nome);
const dialogTitle = ref<string>();
const dialogMessage = ref<string>();

const addSubMeta = () => {
  const numero = componentData.qntSubMetas;
  componentData.subMetas.push({
    id: numero+1,
    nome:`SubMeta ${numero+1}`,
    estado: Estados.NaoIniciado,
    isDeleted: false
  });
  componentData.qntSubMetas = componentData.qntSubMetas+1;
  componentData.historico.push(`[${new Date().toLocaleString()}] - SubMeta ${numero+1} criada`);
  updateMeta();
};

const deleteSubMeta = (id:number) => {
  const index = componentData.subMetas.findIndex((sm : SubMeta) => sm.id === id);
  if (index !== -1) {
    componentData.subMetas[index].isDeleted = true;
    componentData.historico.push(`[${new Date().toLocaleString()}] - SubMeta ${id}: ${componentData.subMetas[index].nome}  deletada`);
  }
  updateMeta();
};

const confirmDeletion = () => {
  componentData.openConfirmationDialog = true;
  dialogMessage.value = `Tem certeza que deseja deletar a Meta : ${componentData.nome}?`
  dialogTitle.value = `Deletar Meta ${componentData.nome}`
}

const deleteMeta = (answer : boolean) => {
  if(answer){
    componentData.historico.push(`[${new Date().toLocaleString()}] - Meta ${componentProperties.meta.id}: ${componentData.nome} deletada`);
    componentData.estado = Estados.Deletado;
    updateMeta();
    emits(EMetasEventsNames.onDeleteMeta, componentProperties.meta.id);
  }
  componentData.openConfirmationDialog = false;
};

const changeName = () => {
  componentData.isEdit = true;
  editableName.value = componentData.nome;
  nextTick(() => editInput.value?.focus());
};

const cancelEdit = () => {
  componentData.isEdit = false;
  if(editableName.value){
    editableName.value = editableName.value.trim();
    if(editableName.value != componentData.nome && editableName.value != ""){
      componentData.historico.push(`[${new Date().toLocaleString()}] - Nome da meta ${componentProperties.meta.id} alterado de ${componentData.nome} para ${editableName.value}`);
      componentData.nome = editableName.value;
      updateMeta();
      return
    }
  }
  editableName.value = componentData.nome;
};

const updateMeta = () =>{
  const updatedMeta : Meta = {
    id: componentProperties.meta.id,
    nome: componentData.nome,
    descricao: componentData.descricao,
    subMetas: componentData.subMetas,
    historico: componentData.historico,
    estado: componentData.estado,
    isDeleted: false,
    subMetasNumber: componentData.qntSubMetas,
  }
  emits(EMetasEventsNames.onUpdateMeta, updatedMeta);
}

const updateSubMeta = (subMeta : SubMeta) => {
  const index = componentData.subMetas.findIndex((sm : SubMeta) => sm.id === subMeta.id);
  if(index !== -1){
    componentData.subMetas[index] = subMeta;
    componentData.historico = [...componentData.historico, ...componentData.subMetas[index].historico!];
    componentData.subMetas[index].historico = undefined;
    updateMeta();
  }
}

const changeDescription = () =>{
  if(componentData.isEdit){
    cancelEdit();
    updateMeta();
  }
  componentData.isEditDescription = true;
  editableDescription.value = componentData.descricao ?? '';
  nextTick(() => editInputDescription.value?.focus());
};

const cancelEditDescription = () => {
  componentData.isEditDescription = false;
  if(editableDescription.value){
    editableDescription.value = editableDescription.value.trim();
    if(editableDescription.value != componentData.descricao){
      if(!componentData.historico) componentData.historico = [];
      componentData.historico.push(
        `[${new Date().toLocaleString()}] - Descrição da Meta ${componentProperties.meta.id}: ${componentData.nome} alterado de ${componentData.descricao} para ${editableDescription.value}`
      );
      componentData.descricao = editableDescription.value;
    }
  }
  updateMeta();
};

const updateEstado = (estado : Estados) => {
  componentData.historico.push(`[${new Date().toLocaleString()}] - Estado da Meta ${componentProperties.meta.id}: ${componentData.nome} alterado de ${componentData.estado} para ${estado}`);
  componentData.estado = estado;
  updateMeta();
}

watch(() => (componentProperties.meta), (newMeta, oldMeta) =>{
  if(oldMeta != newMeta){
    componentData.nome = newMeta.nome;
    componentData.descricao = newMeta.descricao;
    componentData.subMetas = newMeta.subMetas;
    componentData.historico = newMeta.historico;
    componentData.estado = newMeta.estado;
    componentData.qntSubMetas = newMeta.subMetasNumber;
    editableName.value = newMeta.nome;
  }
});

const onDragStart = () => {
  dragStatus.value = 'Reordenação iniciada';
  document.body.classList.add('dragging');
};

const updateOrder = (event : SortableEvent) =>{
  dragStatus.value = 'Reordenação concluída';
  document.body.classList.remove('dragging');
  const { oldIndex, newIndex } = event;
  if(oldIndex != newIndex){
    const movedItem = componentData.subMetas[oldIndex!];
    if(movedItem){
      if(!movedItem.historico) movedItem.historico = [];
      movedItem.historico.push(`[${new Date().toLocaleString()}] - A SubMeta ${movedItem!.id}: ${movedItem!.nome} foi movida da posição ${oldIndex} para ${newIndex}`);
      updateMeta();
    }
  }
}

const confirmReopen = () =>{
  componentData.openReopenConfirmationDialog = true;
  dialogMessage.value = `Tem certeza que deseja reabrir a Meta : ${componentData.nome}?`
  dialogTitle.value = `Reabrir Meta ${componentData.nome}`
}

const reopenMeta = (answer: boolean) =>{
  if(answer){
    updateEstado(Estados.NaoIniciado);
    emits(EMetasEventsNames.onReopenMeta, componentProperties.meta.id);
  }
  componentData.openReopenConfirmationDialog = false;
}

const getPorcentagem = (): number => {
  let qntSubMetas = 0;
  let qntSubMetasFinalizadas = 0;
  componentData.subMetas.forEach((sm) => {
    if(!sm.isDeleted){
      qntSubMetas++;
      if(sm.estado == Estados.Finalizado || sm.estado == Estados.Abortado){
        qntSubMetasFinalizadas++;
      }
    }
  });
  if(qntSubMetas == 0) return 0
  return Math.trunc((qntSubMetasFinalizadas / qntSubMetas) * 100 * 100) / 100;
}
</script>

<style scoped>

.gk-expansion :deep(.v-expansion-panels) {
  background: transparent;
}

.gk-panel {
  border: 1px solid var(--color-border);
}

.gk-panel-title {
  border-bottom: 1px solid var(--color-border);
}

.gk-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.gk-progress-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.gk-header-edit {
  display: grid;
  gap: var(--space-3);
}

.gk-name-edit {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.gk-clickable-title {
  margin: 0;
  color: var(--color-text);
  cursor: pointer;
}
.gk-clickable-title:hover {
  text-decoration: underline;
}

.gk-description {
  margin-top: var(--space-2);
}
.gk-clickable-subtle {
  margin: 0;
  color: var(--color-text-muted);
  cursor: pointer;
}
.gk-clickable-subtle:hover {
  text-decoration: underline;
}

.submeta-item {
  display: grid;
  grid-template-columns: 24px 1fr; 
  align-items: start;              
  padding: var(--space-3);
}
.submeta-content { min-width: 0; } 
.submeta-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-1);
}

:deep(.v-btn.btn) {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 600;
  border-radius: var(--radius-md);
}


.progress-text {
  min-width: 56px;
  text-align: right;
}

.gk-panel-text {
  background: color-mix(in oklab, var(--color-surface) 92%, white 8%);
  border-top: 1px solid var(--color-border);
  border-bottom-left-radius: var(--radius-lg);
  border-bottom-right-radius: var(--radius-lg);
}


.input {
  width: 100%;
}

.submeta-row {
  display: flex;
  flex-direction: row;
  gap: 8px; 
}
.submeta-row > :first-child {
  flex: 0 0 24px;  
}
.submeta-row > :last-child {
  flex: 1 1 auto;   
  min-width: 0;     
}
</style>