<script setup lang="ts">
import { useCustomizerStore } from '../../../stores/customizer';
import { useConfigStore } from '@/stores/config';
import { useSnackbarStore } from '@/stores/snackbar';
import NavGroup from './NavGroup/NavGroup.vue';
import NavItem from './NavItem/NavItem.vue';
import NavCollapse from './NavCollapse/NavCollapse.vue';
import Logo from '../logo/LogoMain.vue';
import { computed } from 'vue';

const customizer = useCustomizerStore();
const configStore = useConfigStore()
const snackbarStore = useSnackbarStore()

try {
  configStore.getConfigs()
} catch (error) {
  snackbarStore.open(error, 'error')
}

const sidebar = computed(() => {
  return configStore.sidebarItems
})
const version = computed(() => {
  return configStore.version
})
</script>

<template>
  <v-navigation-drawer left v-model="customizer.Sidebar_drawer" elevation="0" rail-width="75" mobile-breakpoint="lg" app
    class="leftSidebar" :rail="customizer.mini_sidebar" expand-on-hover>
    <!---Logo part -->

    <div class="pa-5">
      <Logo />
    </div>
    <!-- ---------------------------------------------- -->
    <!---Navigation -->
    <!-- ---------------------------------------------- -->
    <perfect-scrollbar class="scrollnavbar">
      <v-list class="pa-4">
        <!---Menu Loop -->
        <template v-for="(item, i) in sidebar" :key="i">
          <!---Item Sub Header -->
          <NavGroup :item="item" v-if="item.header" :key="item.title" />
          <!---Item Divider -->
          <v-divider class="my-3" v-else-if="item.divider" />
          <!---If Has Child -->
          <NavCollapse class="leftPadding" :item="item" :level="0" v-else-if="item.children" />
          <!---Single Item-->
          <NavItem :item="item" v-else class="leftPadding" />
          <!---End Single Item-->
        </template>
      </v-list>
      <div class="pa-4">
        <!-- <ExtraBox /> -->
      </div>
      <div class="pa-4 text-center">
        <v-chip color="inputBorder" size="small"> Karin v{{ version }} </v-chip>
      </div>
    </perfect-scrollbar>
  </v-navigation-drawer>
</template>
