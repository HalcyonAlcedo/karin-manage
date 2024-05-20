<script setup>
import { ref, watch } from 'vue'
import { useSnackbarStore } from '@/stores/snackbar'

const snackbarStore = useSnackbarStore()
const visible = ref(snackbarStore.visible)
const message = ref(snackbarStore.msg)
const color = ref(snackbarStore.color)
const timeout = ref(snackbarStore.timeout)
const showClose = ref(snackbarStore.showClose)

snackbarStore.$subscribe((mutation, state) => {
    visible.value = state.visible
    message.value = state.msg
    color.value = state.color
    timeout.value = state.timeout
    showClose.value = state.showClose
})

const closeSnackbar = () => {
    snackbarStore.close()
}
</script>

<template>
    <v-snackbar v-model="visible" :color="color" :timeout="timeout" :right="true" top @input="closeSnackbar">
        {{ message }}
        <template v-slot:action="{ attrs }">
            <v-btn icon v-bind="attrs" v-if="showClose" @click="closeSnackbar">
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </template>
    </v-snackbar>
</template>
