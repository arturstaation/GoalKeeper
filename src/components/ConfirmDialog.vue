<template>
  <v-dialog
    v-model="componentProperties.isOpen"
    max-width="560"
    @click:outside="emitAnswer(false)"
    transition="dialog-transition"
  >
    <v-card class="gk-card" elevation="0">
      <v-card-title class="gk-title">
        <h1 class="h1" style="font-size: clamp(20px, 2.6vw, 26px); margin: 0;">
          {{ componentProperties.title }}
        </h1>
      </v-card-title>

      <v-card-text class="gk-text">
        <p class="subtle" style="margin: 0;">
          {{ componentProperties.message }}
        </p>
      </v-card-text>

      <v-card-actions class="gk-actions">
        <v-btn
          class="btn ghost gk-btn"
          variant="text"
          @click="emitAnswer(false)"
        >
          Cancelar
        </v-btn>
        <v-btn
          class="btn gk-btn btn-confirm"
          color="primary"
          @click="emitAnswer(true)"
        >
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
export enum EConfirmDialogEventsNames {
  onUpdateResponse = 'updateResponse',
}

interface IConfirmDialogEvents {
  (e: EConfirmDialogEventsNames.onUpdateResponse, Agree: boolean): void;
}

interface ConfirmDialogComponentProperties {
  title?: string;
  message?: string;
  isOpen: boolean;
}
</script>

<script lang="ts" setup>
const componentProperties = withDefaults(defineProps<ConfirmDialogComponentProperties>(), {});
const emits = defineEmits<IConfirmDialogEvents>();

const emitAnswer = (answer: boolean) => {
  emits(EConfirmDialogEventsNames.onUpdateResponse, answer);
};
</script>

<style scoped>
:deep(.v-overlay__content) {
  display: flex;
  justify-content: center;
  align-items: center;
}

.gk-card {
  background: linear-gradient(180deg, var(--color-surface), var(--color-surface-2));
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-1), var(--shadow-inset);
  padding: var(--space-6);
}

.gk-title {
  padding: 0;
  margin: 0 0 var(--space-3);
}

.gk-text {
  padding: 0;
  margin-bottom: var(--space-6);
  color: var(--color-text);
}

.gk-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: 0;
}

.gk-btn {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 600;
  border-radius: var(--radius-md);
}

.btn-confirm {
}


.dialog-transition-enter-active,
.dialog-transition-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.dialog-transition-enter-from,
.dialog-transition-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.98);
}

:deep(.v-btn:focus-visible) {
  outline: 3px solid color-mix(in oklab, var(--color-primary) 50%, transparent);
  outline-offset: 2px;
}
</style>