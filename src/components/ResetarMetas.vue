<template>
  <div class="gk-reset">
    <v-btn class="btn ghost" prepend-icon="mdi-refresh" rounded @click="openDialog">
      Resetar Dados
    </v-btn>

    <ConfirmDialog
      v-if="componentData.isOpen"
      title="Resetar Metas"
      message="Tem certeza que deseja resetar suas metas? Essa ação é irreversível e deletará todos os seus dados do site."
      :is-open="componentData.isOpen"
      @update-response="resetData"
    />
  </div>
</template>

<script lang="ts">
import { reactive } from 'vue';
import ConfirmDialog from './ConfirmDialog.vue';

export enum EResetarMetasEventsNames {
  onResetarMetas = 'resetMetas',
}

interface IRecuperarMetasEvents {
  (e: EResetarMetasEventsNames.onResetarMetas, a: boolean): void;
}

interface RecuperarMetasComponentProperties {}

interface RecuperarMetasComponentData {
  isOpen: boolean;
}
</script>

<script lang="ts" setup>

const emits = defineEmits<IRecuperarMetasEvents>();
defineProps<RecuperarMetasComponentProperties>();

const componentData = reactive<RecuperarMetasComponentData>({
  isOpen: false,
});

const resetData = (answer: boolean) => {
  emits(EResetarMetasEventsNames.onResetarMetas, answer);
  componentData.isOpen = false;
};

const openDialog = () => {
  componentData.isOpen = true;
};
</script>

<style scoped>
.gk-reset {
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