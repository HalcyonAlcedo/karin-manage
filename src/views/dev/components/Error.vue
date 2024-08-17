<template>
    <v-row align-content="center" class="fill-height" justify="center">
        <v-col class="d-flex align-center justify-center">
            <div class="text-center">
                <h1 class="text-h1">您渲染的内容存在错误</h1>
                <p>
                    <small>{{ props.err }}</small>
                </p>
            </div>
        </v-col>
    </v-row>
</template>

<script setup>
const props = defineProps({
    err: String,
});

</script>