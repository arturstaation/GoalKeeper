<template>
    <div>
        <div>
            <h2> {{ componentData.nome }} </h2>
            <h4> {{ componentData.descricao }} </h4>
            <btn>Deletar SubMeta</btn>
        </div>
    </div>
    
</template>

<script lang="ts">

interface SubMetasComponentProperties {
    nome: string,
    descricao: string,
    estado: string,

}

interface SubMetasComponentData {
    nome: string,
    descricao: string,
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

</script>