<template>
  <header class="app-header">
    <div class="app-header__inner">
      <div style="display:flex;align-items:center;gap:10px;">
        <strong>GoalKeeper</strong>
        <span class="badge">Seu Gerenciador de Metas</span>
      </div>
      <button class="theme-toggle" @click="toggleTheme" aria-label="Alternar tema">
        <span aria-hidden="true">🌓</span>
        <span class="subtle">{{ isDark ? 'Dark' : 'Light' }}</span>
      </button>
    </div>
  </header>

  <div class="container">
    <section class="card">
      <div class="d-flex flex-column align-center" style="gap: 6px;">
        <h1 class="h1">GoalKeeper</h1>
        <p class="subtle">Seu Gerenciador de Metas</p>
        <div class="d-flex flex-row botoes" style="margin-top: 8px;">
          <v-btn prepend-icon="mdi-plus" class="btn" color="primary" @click="addMeta" rounded>
            Adicionar Meta
          </v-btn>
          <RecuperarMetas :metas="metasList" @recuperar-meta="recoverMeta" />
          <ResetarMetas @reset-metas="resetData" />
        </div>
      </div>

      <div v-if="hasSomeUnFinishedValue" class="metas" style="margin-top: var(--space-8);">
        <h2 class="h1" style="font-size: clamp(22px,3.2vw,28px);">Metas em Aberto</h2>
        <draggable v-model="metasList" tag="ol" itemKey="id" @end="updateOrder" class="list" style="margin-top: var(--space-4);">
          <template #item="{element: m}">
            <li
              :key="m.id"
              v-if="!m.isDeleted && (m.estado != Estados.Finalizado && m.estado != Estados.Aboratdo)"
              class="list-item meta-item"
            >
              <Metas
                :meta="m"
                @delete-meta="deleteMeta"
                @update-meta="updateMeta"
              />
            </li>
          </template>
        </draggable>
      </div>

      <div v-if="hasSomeFinishedValue" class="metas" style="margin-top: var(--space-8);">
        <h2 class="h1" style="font-size: clamp(22px,3.2vw,28px);">Metas Finalizadas</h2>
        <draggable v-model="metasList" tag="ol" itemKey="id" @end="updateOrder" class="list" style="margin-top: var(--space-4);">
          <template #item="{element: m}">
            <li
              :key="m.id"
              v-if="!m.isDeleted && (m.estado == Estados.Finalizado || m.estado == Estados.Aboratdo)"
              class="list-item meta-item"
            >
              <Metas
                :meta="m"
                @delete-meta="deleteMeta"
                @update-meta="updateMeta"
                @reopen-meta="reopenMeta"
              />
            </li>
          </template>
        </draggable>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import draggable from "vuedraggable";
import { onMounted, ref } from 'vue';
import { Estados } from "@/enums/Estados";
import Metas from './components/Metas.vue';
import type { SortableEvent } from "sortablejs"
import type Meta from './interfaces/Meta';
import RecuperarMetas from "./components/RecuperarMetas.vue";
import ResetarMetas from "./components/ResetarMetas.vue";
import { isDark, toggleTheme, THEME_KEY } from './main'

export default {}
</script>

<script setup lang="ts">

function applyTheme(theme: 'theme-dark' | 'theme-light') {
  const html = document.documentElement;
  html.classList.remove('theme-dark', 'theme-light');
  html.classList.add(theme);
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) as 'theme-dark' | 'theme-light' | null;
  if (saved) {
    applyTheme(saved);
    isDark.value = saved === 'theme-dark';
  } else {
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'theme-dark' : 'theme-light');
    isDark.value = prefersDark;
  }
}

const metasList = ref<Meta[]>([]);
const metasQnt = ref<number>(0);
const hasSomeFinishedValue = ref<boolean>(false);
const hasSomeUnFinishedValue = ref<boolean>(false);

const hasSomeFinished = (): boolean => {
  return metasList.value.some(m => (m.estado == Estados.Finalizado || m.estado == Estados.Aboratdo) && m.isDeleted == false);
}
const hasSomeUnFinished = (): boolean => {
  return metasList.value.some(m => (m.estado != Estados.Finalizado && m.estado != Estados.Aboratdo) && m.isDeleted == false);
}

onMounted(() => {
  initTheme();

  const metasSalvas = localStorage.getItem('metas');
  const qntMetas = localStorage.getItem('metasQnt');

  metasList.value = metasSalvas ? JSON.parse(metasSalvas) : [];
  metasQnt.value = qntMetas ? JSON.parse(qntMetas) : 0;

  localStorage.setItem('metas', JSON.stringify(metasList.value));
  localStorage.setItem('metasQnt', JSON.stringify(metasQnt.value));

  hasSomeFinishedValue.value = hasSomeFinished();
  hasSomeUnFinishedValue.value = hasSomeUnFinished();
});

const addMeta = () => {
  const numero = metasQnt.value;
  const newMeta: Meta = {
    id: numero + 1,
    nome:`Meta ${numero + 1}`,
    subMetas: [],
    subMetasNumber: 0,
    historico: [] as string[],
    estado: Estados.NaoIniciado,
    isDeleted: false,
  };
  newMeta.historico.push(`[${new Date().toLocaleString()}] - Meta ${numero + 1} criada`);
  metasList.value.push(newMeta);
  metasQnt.value = metasQnt.value + 1;

  localStorage.setItem('metas', JSON.stringify(metasList.value));
  localStorage.setItem('metasQnt', JSON.stringify(metasQnt.value));
  hasSomeUnFinishedValue.value = hasSomeUnFinished();
};

const deleteMeta = (id: number) => {
  const index = metasList.value.findIndex((m: Meta) => m.id === id);
  if (index !== -1) metasList.value[index].isDeleted = true;

  localStorage.setItem('metas', JSON.stringify(metasList.value));
  hasSomeFinishedValue.value = hasSomeFinished();
  hasSomeUnFinishedValue.value = hasSomeUnFinished();
};

const updateMeta = (meta: Meta) => {
  const index = metasList.value.findIndex((m: Meta) => m.id === meta.id);
  if (index !== -1) metasList.value[index] = meta;

  localStorage.setItem('metas', JSON.stringify(metasList.value));
  hasSomeFinishedValue.value = hasSomeFinished();
  hasSomeUnFinishedValue.value = hasSomeUnFinished();
};

const updateOrder = (event: SortableEvent) => {
  const { oldIndex, newIndex } = event;
  if (oldIndex != newIndex) {
    const movedItem = metasList.value[oldIndex!];
    if (movedItem) {
      if (!movedItem.historico) movedItem.historico = [];
      movedItem.historico.push(
        `[${new Date().toLocaleString()}] - A Meta ${movedItem.id}: ${movedItem.nome} foi movida da posição ${oldIndex} para ${newIndex}`
      );
      localStorage.setItem('metas', JSON.stringify(metasList.value));
      hasSomeFinishedValue.value = hasSomeFinished();
      hasSomeUnFinishedValue.value = hasSomeUnFinished();
    }
  }
};

const recoverMeta = (m: Meta) => {
  const currentItemIndex = metasList.value.findIndex((meta: Meta) => meta.id == m.id);
  m.estado = Estados.NaoIniciado;
  m.isDeleted = false;
  m.historico.push(`[${new Date().toLocaleString()}] - A Meta ${m.id}: ${m.nome} foi recuperada após ser removida`);
  if (currentItemIndex !== -1) {
    const [recortado] = metasList.value.splice(currentItemIndex, 1);
    metasList.value.push(recortado);
    localStorage.setItem('metas', JSON.stringify(metasList.value));
  }
};

const resetData = (answer: boolean) => {
  if (answer) {
    metasList.value = [];
    metasQnt.value = 0;
    localStorage.setItem('metas', JSON.stringify(metasList.value));
    localStorage.setItem('metasQnt', JSON.stringify(metasQnt.value));
    hasSomeFinishedValue.value = hasSomeFinished();
    hasSomeUnFinishedValue.value = hasSomeUnFinished();
  }
};

const reopenMeta = (id: number) => {
  const currentItemIndex = metasList.value.findIndex((meta: Meta) => meta.id == id);
  if (currentItemIndex !== -1) {
    const [recortado] = metasList.value.splice(currentItemIndex, 1);
    metasList.value.push(recortado);
    localStorage.setItem('metas', JSON.stringify(metasList.value));
  }
};
</script>

<style scoped>
.botoes {
  display: flex;
  gap: 12px;
  margin-bottom: var(--space-4);
  justify-content: center;
}

.v-btn.btn {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 600;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  box-shadow: 0 8px 20px color-mix(in oklab, var(--color-primary) 25%, transparent);
}

.meta-item {
  padding: var(--space-4);
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, border-color 0.18s ease;
}

.meta-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-1);
}

@media (max-width: 700px) {
  .botoes {
    flex-wrap: wrap;
  }
}
</style>