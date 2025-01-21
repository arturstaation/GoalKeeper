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
        <v-hover v-slot:default="{ isHovering, props: hoverProps }">
          <v-btn
            @click="emitAnswer(false)"
            v-bind="hoverProps"
            :style="{
              backgroundColor: isHovering ? '#c0392b' : '#e74c3c',
              color: 'white',
            }"
          >
            Cancelar
          </v-btn>
        </v-hover>
        <v-hover v-slot:default="{ isHovering, props: hoverProps }">
          <v-btn
            @click="emitAnswer(true)"
            v-bind="hoverProps"
            :style="{
              backgroundColor: isHovering ? '#1e8449' : '#27ae60',
              color: 'white',
            }"
          >
            Confirmar
          </v-btn>
        </v-hover>
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

<style scoped>

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

.v-card-title h1 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0;
}

.v-card-text p {
  font-size: 1.2rem;
  color: #34495e;
  margin: 1rem 0;
}

.v-card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

</style>
