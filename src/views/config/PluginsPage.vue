<script setup lang="ts">
import { ref, shallowRef, computed } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

import { useConfigStore } from '@/stores/config';
const configStore = useConfigStore()

const page = ref({ title: '插件配置' });
const breadcrumbs = shallowRef([
  {
    title: '插件配置',
    disabled: false,
    href: '#'
  }
]);

const colors = ref([
  'primary',
  'lightprimary',
  'secondary',
  'lightsecondary',
  'info',
  'success',
  'accent',
  'warning',
  'error',
  'darkText',
  'lightText',
  'borderLight',
  'inputBorder',
  'containerBg'
]);
const plugins = computed(()=>{
  return configStore.plugins
})
</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <v-row>
    <v-col cols="12" md="12">
      <UiParentCard title="插件列表">
        <v-row>
          <v-col md="3" cols="12" v-for="(plugin, index) in plugins" :key="index">
            <router-link :to="`/plugin/${plugin}`">
            <v-sheet rounded="md" class="align-center justify-center d-flex" height="100" width="100%" :color="colors[Math.floor(Math.random() * colors.length)]"
              >{{ plugin }}
            </v-sheet>
            </router-link>
          </v-col>
        </v-row>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
