<template>
<div>
    <div>
        <v-dialog max-width="800">
            <template v-slot:activator="{ props: activatorProps }">
            <v-btn
                prepend-icon="mdi-cancel"
                v-bind="activatorProps"
                text="Metas Removidas"
            ></v-btn>
            </template>

            <template v-slot:default="{ isActive }">
            <v-card title="Metas Removidas">
                <template v-slot:text>
                <div v-for="(m, index) in componentProperties.metas" :key="index">
                    <div v-if="m.estado == Estados.Deletado">
                    <p>{{ m.nome }}</p>
                    <v-btn prepend-icon="mdi-plus" color="white" @click="confirmRecoverMeta(m)" elevated>
                    Recuperar Meta
                    </v-btn>
                    </div>
                </div>

                </template>
            </v-card>
            </template>
        </v-dialog>
    </div>
  <ConfirmDialog v-if="componentData.isOpen" :title="componentData.dialogTitle" :message="componentData.dialogMessage" :is-open="componentData.isOpen" @update-response="recoverMeta"></ConfirmDialog>
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
