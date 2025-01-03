<template>
    <div>
        <div>
            <h2> {{ componentData.nome }} </h2>
            <h4> {{ componentData.descricao }} </h4>
            <button :onclick="deleteSubMeta">Deletar SubMeta</button>
        </div>
    </div>
    
</template>

<script lang="ts">

export enum ESubMetasEventsNames{
    onDeleteSubMeta = 'deleteSubMeta',
}

interface ISubMetasEvents{
    (e: ESubMetasEventsNames.onDeleteSubMeta, SubMetaId : number) : void;
}

interface SubMetasComponentProperties {
    id: number,
    nome: string,
    descricao?: string,
    estado: string,

}

interface SubMetasComponentData {
    nome: string,
    descricao?: string,
    estado: string,
}

</script>

<script lang="ts" setup>

const componentProperties = withDefaults(defineProps<SubMetasComponentProperties>(),{});
const componentData : SubMetasComponentData = {
    nome: componentProperties.nome,
    descricao: componentProperties.descricao,
    estado: componentProperties.estado
}

const emits = defineEmits<ISubMetasEvents>();

const deleteSubMeta = () =>{
    
    emits(ESubMetasEventsNames.onDeleteSubMeta, componentProperties.id);
    
};

</script>