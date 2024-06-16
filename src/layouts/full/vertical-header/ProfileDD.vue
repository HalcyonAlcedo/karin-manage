<script setup lang="ts">
import { LogoutIcon, UserIcon } from 'vue-tabler-icons';
import { useAuthStore } from '@/stores/auth';
import { useServerStore } from '@/stores/server';
import { useSnackbarStore } from '@/stores/snackbar';

import { request } from '@/utils/request';


const authStore = useAuthStore();
const serverStore = useServerStore();
const snackbarStore = useSnackbarStore();

const getTimeOfDay = (hour: number): string => {
  if (hour >= 6 && hour < 12) {
    return '早上';
  } else if (hour >= 12 && hour < 18) {
    return '中午';
  } else {
    return '晚上';
  }
}

const restart = () => {
  request.post(`${serverStore.baseUrl}/system/restartServer`)
    .then((response) => {
      if (response.data.status === 'success') {
        snackbarStore.open('服务重启成功')
      } else {
        snackbarStore.open('服务重启失败', 'error')
      }
    })
    .catch((error) => {
      snackbarStore.open('服务重启失败', 'error')
    })
}
</script>

<template>
  <!-- ---------------------------------------------- -->
  <!-- profile DD -->
  <!-- ---------------------------------------------- -->
  <div class="pa-4">
    <h4 class="mb-n1"> {{ getTimeOfDay(new Date().getHours()) }}好, <span class="font-weight-regular">{{ authStore.user?.username }}</span></h4>
    <!--
    <v-text-field persistent-placeholder placeholder="Search" class="my-3" color="primary" variant="outlined" hide-details>
      <template v-slot:prepend-inner>
        <SearchIcon stroke-width="1.5" size="20" class="text-lightText SearchIcon" />
      </template>
    </v-text-field>
    -->
    <v-divider></v-divider>
    <perfect-scrollbar style="height: calc(100vh - 75vh); max-height: 515px">

      <div class="bg-lightwarning rounded-md pa-5 my-3 circle sm-circle lg-circle">
        <h4>服务器</h4>
        <h6 class="text-subtitle-2 text-medium-emphasis mr-11 pr-11 mb-3 mt-2">{{ serverStore.baseUrl }}</h6>
      </div>

      <v-divider></v-divider>
      <!--
      <div class="bg-lightprimary rounded-md px-5 py-3 my-3">
        <div class="d-flex align-center justify-space-between">
          <h5 class="text-h5">Start DND Mode</h5>
          <div>
            <v-switch v-model="swt1" color="primary" hide-details></v-switch>
          </div>
        </div>
        <div class="d-flex align-center justify-space-between">
          <h5 class="text-h5">Allow Notifications</h5>
          <div>
            <v-switch v-model="swt2" color="primary" hide-details></v-switch>
          </div>
        </div>
      </div>
      -->
      <v-divider></v-divider>
      
      <v-list class="mt-3">
        <v-list-item @click="restart()" color="secondary" rounded="md">
          <template v-slot:prepend>
            <BrandGravatarIcon size="20" class="mr-2" />
          </template>

          <v-list-item-title class="text-subtitle-2"> 重启服务 </v-list-item-title>
        </v-list-item>

        <v-list-item :to="`/user/${authStore.user?.username}`" color="secondary" rounded="md">
          <template v-slot:prepend>
            <UserIcon size="20" class="mr-2" />
          </template>

          <v-list-item-title class="text-subtitle-2"> 用户配置 </v-list-item-title>
        </v-list-item>

        <v-list-item @click="authStore.logout()" color="secondary" rounded="md">
          <template v-slot:prepend>
            <LogoutIcon size="20" class="mr-2" />
          </template>

          <v-list-item-title class="text-subtitle-2"> 注销 </v-list-item-title>
        </v-list-item>
      </v-list>
    </perfect-scrollbar>
  </div>
</template>
