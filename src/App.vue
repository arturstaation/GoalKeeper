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

      <div class="metas" style="margin-top: var(--space-8);" v-if="abertasProxy.length > 0">
        <h2 class="h1" style="font-size: clamp(22px,3.2vw,28px);">Metas em Aberto</h2>

        <draggable
          v-model="abertasProxy"
          tag="ol"
          itemKey="id"
          class="list"
          style="margin-top: var(--space-4);"
          :animation="180"
          :ghost-class="'drag-ghost'"
          :chosen-class="'drag-chosen'"
          :drag-class="'drag-dragging'"
          :handle="'.drag-handle'"
          :delay="isTouchDevice ? 120 : 0"
          :delay-on-touch-only="true"
          :fallback-tolerance="5"
          :group="{ name: 'abertas', put: false, pull: false }"
          @start="onDragStart"
          @end="onDragEndAbertas"
        >
          <template #item="{ element: m }">
            <div class="meta-row">
              <div class="item-header">
                  <button class="drag-handle" aria-label="Reordenar" title="Arraste para reordenar">↕</button>
              </div>
              <li
                :key="m.id"
                class="list-item meta-item"
                tabindex="0"
                :data-id="m.id"
              >
                <Metas
                  :meta="m"
                  @delete-meta="deleteMeta"
                  @update-meta="updateMeta"
                />
              </li>
            </div>
          </template>
        </draggable>
      </div>

      <div class="metas" style="margin-top: var(--space-8);" v-if="finalizadasProxy.length > 0">
        <h2 class="h1" style="font-size: clamp(22px,3.2vw,28px);">Metas Finalizadas</h2>

        <draggable
          v-model="finalizadasProxy"
          tag="ol"
          itemKey="id"
          class="list"
          style="margin-top: var(--space-4);"
          :animation="180"
          :ghost-class="'drag-ghost'"
          :chosen-class="'drag-chosen'"
          :drag-class="'drag-dragging'"
          :handle="'.drag-handle'"
          :delay="isTouchDevice ? 120 : 0"
          :delay-on-touch-only="true"
          :fallback-tolerance="5"
          :group="{ name: 'finalizadas', put: false, pull: false }"
          @start="onDragStart"
          @end="onDragEndFinalizadas"
        >

          <template #item="{ element: m }">
            <div class="meta-row">
              <div class="item-header">
                <button class="drag-handle" aria-label="Reordenar" title="Arraste para reordenar">↕</button>
              </div>
              <li
              :key="m.id"
              class="list-item meta-item"
              tabindex="0"
              :data-id="m.id"
              >
                <Metas
                :meta="m"
                @delete-meta="deleteMeta"
                @update-meta="updateMeta"
                @reopen-meta="reopenMeta"
                />
              </li>
            </div>
            
          </template>
        </draggable>
      </div>

      <div class="sr-only" aria-live="polite">{{ dragStatus }}</div>
    </section>
  </div>
</template>

<script lang="ts">
import draggable from "vuedraggable";
import { onMounted, ref, computed } from 'vue';
import { Estados } from "@/enums/Estados";
import Metas from './components/Metas.vue';
import type { SortableEvent } from "sortablejs"
import type Meta from './interfaces/Meta';
import RecuperarMetas from "./components/RecuperarMetas.vue";
import ResetarMetas from "./components/ResetarMetas.vue";
import { isDark, toggleTheme, THEME_KEY } from './main';

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
const dragStatus = ref('');
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

const abertas = computed(() =>
  metasList.value.filter(m => !m.isDeleted && m.estado !== Estados.Finalizado && m.estado !== Estados.Abortado)
);
const finalizadas = computed(() =>
  metasList.value.filter(m => !m.isDeleted && (m.estado === Estados.Finalizado || m.estado === Estados.Abortado))
);

const abertasProxy = computed<Meta[]>({
  get: () => abertas.value,
  set: (newOrder) => {
    const idsAbertas = new Set(newOrder.map(m => m.id));
    const outros = metasList.value.filter(m => !idsAbertas.has(m.id));
    metasList.value = [...newOrder, ...outros];
    persistMetas();
  }
});
const finalizadasProxy = computed<Meta[]>({
  get: () => finalizadas.value,
  set: (newOrder) => {
    const idsFinalizadas = new Set(newOrder.map(m => m.id));
    const abertasAtuais = metasList.value.filter(m => !m.isDeleted && m.estado !== Estados.Finalizado && m.estado !== Estados.Abortado);
    const outros = metasList.value.filter(m => !idsFinalizadas.has(m.id) && !abertasAtuais.includes(m));
    metasList.value = [...abertasAtuais, ...newOrder, ...outros];
    persistMetas();
  }
});

onMounted(() => {
  initTheme();
  const metasSalvas = localStorage.getItem('metas');
  const qntMetas = localStorage.getItem('metasQnt');
  metasList.value = metasSalvas ? JSON.parse(metasSalvas) : [];
  metasQnt.value = qntMetas ? JSON.parse(qntMetas) : 0;
  persistMetas(true);
});

function persistMetas(immediate = false) {
  if (immediate) {
    localStorage.setItem('metas', JSON.stringify(metasList.value));
    localStorage.setItem('metasQnt', JSON.stringify(metasQnt.value));
    return;
  }
  window.clearTimeout((persistMetas as any)._t);
  (persistMetas as any)._t = window.setTimeout(() => {
    localStorage.setItem('metas', JSON.stringify(metasList.value));
    localStorage.setItem('metasQnt', JSON.stringify(metasQnt.value));
  }, 120);
}

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
  persistMetas();
};

const deleteMeta = (id: number) => {
  const index = metasList.value.findIndex((m: Meta) => m.id === id);
  if (index !== -1) metasList.value[index].isDeleted = true;
  persistMetas();
};

const updateMeta = (meta: Meta) => {
  const index = metasList.value.findIndex((m: Meta) => m.id === meta.id);
  if (index !== -1) metasList.value[index] = meta;
  persistMetas();
};

function addHistoricoMovimento(item: Meta, fromIndex: number, toIndex: number) {
  if (!item.historico) item.historico = [];
  item.historico.push(
    `[${new Date().toLocaleString()}] - A Meta ${item.id}: ${item.nome} foi movida da posição ${fromIndex + 1} para ${toIndex + 1}`
  );
}

const onDragStart = () => {
  dragStatus.value = 'Reordenação iniciada';
  document.body.classList.add('dragging');
};
const onDragEndAbertas = (event: SortableEvent) => {
  dragStatus.value = 'Reordenação concluída';
  document.body.classList.remove('dragging');
  const { oldIndex, newIndex } = event;
  if (oldIndex != null && newIndex != null && oldIndex !== newIndex) {
    const item = abertas.value[newIndex];
    if (item) addHistoricoMovimento(item, oldIndex, newIndex);
    persistMetas();
  }
};
const onDragEndFinalizadas = (event: SortableEvent) => {
  dragStatus.value = 'Reordenação concluída';
  document.body.classList.remove('dragging');
  const { oldIndex, newIndex } = event;
  if (oldIndex != null && newIndex != null && oldIndex !== newIndex) {
    const item = finalizadas.value[newIndex];
    if (item) addHistoricoMovimento(item, oldIndex, newIndex);
    persistMetas();
  }
};

const recoverMeta = (m: Meta) => {
  const currentItemIndex = metasList.value.findIndex((meta: Meta) => meta.id == m.id);
  m.estado = Estados.NaoIniciado;
  m.isDeleted = false;
  m.historico ??= [];
  m.historico.push(`[${new Date().toLocaleString()}] - A Meta ${m.id}: ${m.nome} foi recuperada após ser removida`);
  if (currentItemIndex !== -1) {
    const [recortado] = metasList.value.splice(currentItemIndex, 1);
    metasList.value.push(recortado);
  }
  persistMetas();
};

const resetData = (answer: boolean) => {
  if (answer) {
    metasList.value = [];
    metasQnt.value = 0;
    persistMetas(true);
  }
};

const reopenMeta = (id: number) => {
  const currentItemIndex = metasList.value.findIndex((meta: Meta) => meta.id == id);
  if (currentItemIndex !== -1) {
    const [recortado] = metasList.value.splice(currentItemIndex, 1);
    metasList.value.push(recortado);
    persistMetas();
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

.list {
  padding: 0;
}

.meta-item {
  padding: var(--space-4);
  margin-bottom: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--surface-1);
  border: 1px solid var(--border);
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, border-color 0.18s ease;
  display: grid;
  grid-template-columns: 1fr; 
  align-items: start;      
}

.meta-row {
  display: flex;
  flex-direction: row;
  gap: 8px; 
}
.meta-row > :first-child {
  flex: 0 0 24px;  
}
.meta-row > :last-child {
  flex: 1 1 auto;   
  min-width: 0;     
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