<template>
  <v-app>
  <RouterView></RouterView>
  <Snackbar />
  </v-app>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import Snackbar from '@/components/Snackbar.vue';
</script>
