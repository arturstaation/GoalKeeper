<template>
  <div class="gk-recover">
    <v-dialog max-width="720" class = "">
      <template #activator="{ props: activatorProps }">
        <v-btn class="btn ghost" prepend-icon="mdi-cancel" v-bind="activatorProps">
          Metas Removidas
        </v-btn>
      </template>

      <template #default="{ isActive }">
        <v-card class="gk-card" elevation="0" style="padding: var(--space-4);">
          <template #title>
            <div class="h1" style="font-size: clamp(18px, 2.6vw, 22px);">Metas Removidas</div>
          </template>

          <template #text>
            <div class="list" style="margin-top: var(--space-3);" v-if="componentProperties.metas && componentProperties.metas.length >= 1"> 
              <div
                v-for="(m, index) in deletedMetas"
                :key="index"
                class="list-item metas-deletadas"
              >
                <p class="subtle" style="margin:0;">{{ m.nome }}</p>

                <v-btn
                  class="btn"
                  prepend-icon="mdi-backup-restore"
                  color="primary"
                  @click="confirmRecoverMeta(m)"
                  rounded
                >
                  Recuperar Meta
                </v-btn>
              </div>

              <div
                v-if="!componentProperties.metas?.some(mm => mm.estado == Estados.Deletado)"
                class="list-item"
              >
                <p class="subtle" style="margin:0;">Nenhuma meta removida.</p>
              </div>
            </div>
          </template>
        </v-card>
      </template>
    </v-dialog>

    <ConfirmDialog
      v-if="componentData.isOpen"
      :title="componentData.dialogTitle"
      :message="componentData.dialogMessage"
      :is-open="componentData.isOpen"
      @update-response="recoverMeta"
    />
  </div>
</template>

<script lang="ts">
import { reactive, computed } from 'vue';
import type Meta from '@/interfaces/Meta';
import { Estados } from "@/enums/Estados";
import ConfirmDialog from './ConfirmDialog.vue';

export enum ERecuperarMetasEventsNames{
  onRecuperarMeta = 'recuperarMeta',
}

interface IRecuperarMetasEvents{
  (e: ERecuperarMetasEventsNames.onRecuperarMeta, m : Meta) : void;
}

interface RecuperarMetasComponentProperties {
  metas?: Meta[]
}

interface RecuperarMetasComponentData {
  isOpen: boolean,
  dialogTitle: string,
  dialogMessage: string,
  selectedMeta?: Meta,
}
</script>

<script lang="ts" setup>

const emits = defineEmits<IRecuperarMetasEvents>();
const componentProperties = withDefaults(defineProps<RecuperarMetasComponentProperties>(),{
  metas: () => [] as Meta[]
});

const deletedMetas = computed(() =>
  (componentProperties.metas || []).filter(m => m.estado === Estados.Deletado)
)

const componentData  = reactive<RecuperarMetasComponentData>({
  isOpen: false,
  dialogTitle: ``,
  dialogMessage: ``,
  selectedMeta: undefined,
});

const recoverMeta = (answer : boolean) => {
  if(answer && componentData.selectedMeta) {
    emits(ERecuperarMetasEventsNames.onRecuperarMeta, componentData.selectedMeta);
  }
  componentData.selectedMeta = undefined;
  componentData.isOpen = false;
}

const confirmRecoverMeta = (m : Meta) =>{
  componentData.selectedMeta = m;
  componentData.isOpen = true;
  componentData.dialogTitle = `Reabilitar Meta: ${m.nome}`;
  componentData.dialogMessage = `Tem certeza que deseja reabilitar a Meta: ${m.nome}?`;
}
</script>

<style scoped>
.gk-recover {
}

.gk-card {
  background: linear-gradient(180deg, var(--color-surface), var(--color-surface-2));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-1), var(--shadow-inset);
  padding: var(--space-6);
}

.metas-deletadas {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}
.metas-deletadas:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-1);
}

:deep(.v-btn.btn) {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 600;
  border-radius: var(--radius-md);
}

:deep(.v-btn:focus-visible) {
  outline: 3px solid color-mix(in oklab, var(--color-primary) 50%, transparent);
  outline-offset: 2px;
}
</style>