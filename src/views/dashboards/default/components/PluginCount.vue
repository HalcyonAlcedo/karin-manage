<script setup lang="ts">
import { useConfigStore } from '@/stores/config';
import iconCard from '@/assets/images/icons/icon-card.svg';

const configStore = useConfigStore()

</script>

<template>
  <v-card elevation="0" class="bg-secondary overflow-hidden bubble-shape bubble-secondary-shape">
    <v-card-text>
      <div class="d-flex align-start mb-6">
        <v-btn icon rounded="sm" color="darksecondary" variant="flat">
          <img :src="iconCard" width="25" />
        </v-btn>
      </div>
      <h2 class="text-h1 font-weight-medium">
        {{ configStore.plugins.length }}
      </h2>
      <span class="text-subtitle-1 text-medium-emphasis text-white">插件数量</span>
    </v-card-text>
  </v-card>
</template>
