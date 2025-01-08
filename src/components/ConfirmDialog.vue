<template>
    <v-dialog v-model="componentProperties.isOpen" max-width="800" @click:outside="emitAnswer(false)">
      <v-card>
        <v-card-title>
          <h1>{{ componentProperties.title }}</h1>
        </v-card-title>
        <v-card-text>
          <p>{{ componentProperties.message }}</p>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="emitAnswer(false)">Cancelar</v-btn>
          <v-btn @click="emitAnswer(true)">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>


<script lang="ts">

export enum EConfirmDialogEventsNames{
  onUpdateResponse = 'updateResponse',
}

interface IConfirmDialogEvents{
  (e: EConfirmDialogEventsNames.onUpdateResponse, Agree : boolean) : void;
}

interface ConfirmDialogComponentProperties {
  title?: string,
  message?: string,
  isOpen: boolean
}



</script>



<script lang="ts" setup>


const componentProperties = withDefaults(defineProps<ConfirmDialogComponentProperties>(),{});
const emits = defineEmits<IConfirmDialogEvents>();

const emitAnswer = (answer : boolean) => {

  emits(EConfirmDialogEventsNames.onUpdateResponse, answer);

};

</script>