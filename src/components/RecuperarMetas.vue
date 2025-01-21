<template>
    <div>
      <div>
        <v-dialog max-width="800">
          <template v-slot:activator="{ props: activatorProps }">
            <v-hover v-slot:default="{ isHovering, props: hoverProps }">
              <v-btn
                prepend-icon="mdi-cancel"
                v-bind="{...activatorProps, ...hoverProps}"
                :color="isHovering ? '#c0392b' : '#e74c3c'"
                rounded
              >
                Metas Removidas
              </v-btn>
            </v-hover>
          </template>
          <template v-slot:default="{ isActive }">
            <v-card title="Metas Removidas">
              <template v-slot:text>
                <div v-for="(m, index) in componentProperties.metas" :key="index">
                  <div
                    v-if="m.estado == Estados.Deletado"
                    class="d-flex flex-row justify-space-between align-center metas-deletadas"
                  >
                    <p>{{ m.nome }}</p>
                    <v-hover v-slot:default="{ isHovering, props: hoverProps }">
                      <v-btn
                        prepend-icon="mdi-backup-restore"
                        :color="isHovering ? '#2980b9' : '#3498db'"
                        @click="confirmRecoverMeta(m)"
                        elevated
                        v-bind="hoverProps"
                        rounded
                      >
                        Recuperar Meta
                      </v-btn>
                    </v-hover>
                  </div>
                </div>
              </template>
            </v-card>
          </template>
        </v-dialog>
      </div>
      <ConfirmDialog
        v-if="componentData.isOpen"
        :title="componentData.dialogTitle"
        :message="componentData.dialogMessage"
        :is-open="componentData.isOpen"
        @update-response="recoverMeta"
      ></ConfirmDialog>
    </div>
  </template>
  

<script lang = "ts">

import { reactive, watch } from 'vue';
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
    metas: Meta[]

}

interface RecuperarMetasComponentData {
    isOpen: boolean,
    dialogTitle: string,
    dialogMessage: string,
    selectedMeta?: Meta,

}

</script>
<script lang = "ts" setup>


const emits = defineEmits<IRecuperarMetasEvents>();
const componentProperties = withDefaults(defineProps<RecuperarMetasComponentProperties>(),{});
const componentData  = reactive<RecuperarMetasComponentData>({

    isOpen: false,
    dialogTitle: ``,
    dialogMessage: ``,
    selectedMeta: undefined,
});
const recoverMeta = (answer : boolean) => {


    if(answer && componentData.selectedMeta)
        emits(ERecuperarMetasEventsNames.onRecuperarMeta, componentData.selectedMeta);
    
    componentData.selectedMeta = undefined;
    componentData.isOpen = false;

}

const confirmRecoverMeta = (m : Meta) =>{

    componentData.selectedMeta = m;
    componentData.isOpen = true;
    componentData.dialogTitle = `Reabilitar Meta : ${m.nome}`;
    componentData.dialogMessage = `Tem certeza que deseja reabilitar a Meta : ${m.nome} ?`;
     
}

</script>

<style scoped>

div {
  padding: 1rem;
}

.v-dialog {
  display: flex;
  justify-content: center;
  align-items: center;
}

.v-card {
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
}

.v-card-title {
  font-size: 1.5rem;
  color: #2c3e50;
  font-weight: bold;
}

.metas-deletadas {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #bdc3c7;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  background-color: #f9f9f9;
  transition: box-shadow 0.3s ease, transform 0.2s ease;
}

.metas-deletadas:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}


p {
  font-size: 1rem;
  color: #2c3e50;
  margin: 0;
}
</style>
