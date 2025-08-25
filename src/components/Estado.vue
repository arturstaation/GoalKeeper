<template>
  <div class="estado-container" @click="changeEstado">
    <div :class="['estado-bolinha', estadoClasses[componentData.estado]]"></div>

    <p
      v-if="!componentData.isEdit || (componentData.estado == Estados.Finalizado || componentData.estado == Estados.Aboratdo)"
      class="estado-text"
    >
      {{ componentData.estado }}
    </p>

    <select
      ref="editInput"
      v-else
      v-model="componentData.estado"
      @change="cancelEdit"
      class="input estado-select"
    >
      <option v-for="(estado, index) in estadosDisponiveis" :key="index" :value="estado">
        {{ estado }}
      </option>
    </select>
  </div>
</template>

<script lang="ts">
import { reactive, ref, nextTick, watch } from "vue";
import { Estados } from "@/enums/Estados";

export enum EEstadoEventsNames {
  onUpdateEstado = 'updateEstado',
}

interface IEstadoEvents {
  (e: EEstadoEventsNames.onUpdateEstado, E: Estados): void;
}

interface EstadoComponentProperties {
  estado: Estados;
}

interface EstadoComponentData {
  estado: Estados;
  isEdit: boolean;
}
</script>

<script lang="ts" setup>

const emits = defineEmits<IEstadoEvents>();
const componentProperties = withDefaults(defineProps<EstadoComponentProperties>(), {});
const componentData = reactive<EstadoComponentData>({
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

const editInput = ref<HTMLSelectElement | null>(null);

const changeEstado = () => {
  componentData.isEdit = true;
  nextTick(() => {
    editInput.value?.focus();
  });
};

const cancelEdit = () => {
  componentData.isEdit = false;
  emits(EEstadoEventsNames.onUpdateEstado, componentData.estado);
};

watch(() => componentProperties.estado, (newEstado, oldEstado) => {
  if (oldEstado != newEstado) componentData.estado = newEstado;
});
</script>

<style scoped>
.estado-container {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
}

.estado-bolinha {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.2s ease, border-color 0.2s ease;
  box-shadow: 0 0 0 2px transparent;
}

.nao-iniciado {
  background: color-mix(in oklab, var(--color-text-muted) 70%, transparent);
  border-color: color-mix(in oklab, var(--color-text-muted) 45%, var(--color-border));
}

.em-progresso {
  background: var(--color-primary);
  border-color: color-mix(in oklab, var(--color-primary) 55%, var(--color-border));
}

.pausado {
  background: var(--color-warning);
  border-color: color-mix(in oklab, var(--color-warning) 55%, var(--color-border));
}

.deletado {
  background: var(--color-danger);
  border-color: color-mix(in oklab, var(--color-danger) 55%, var(--color-border));
}

.finalizado {
  background: var(--color-success);
  border-color: color-mix(in oklab, var(--color-success) 55%, var(--color-border));
}

.abortado {
  background: var(--color-danger);
  border-color: color-mix(in oklab, var(--color-danger) 55%, var(--color-border));
}

.estado-container:hover .estado-bolinha {
  transform: scale(1.15);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-primary) 22%, transparent);
}

.estado-text {
  font-size: var(--font-size-sm);
  color: var(--color-text);
  margin: 0;
}

.estado-select {
  width: auto;
  min-width: 180px;
  padding: 8px 12px;
}
</style>