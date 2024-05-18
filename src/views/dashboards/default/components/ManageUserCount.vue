<script setup lang="ts">
import { ref } from 'vue';
import iconCard from '@/assets/images/icons/icon-card.svg';

import { request } from '@/utils/request';
import { useServerStore } from '@/stores/server';

const apiStore = useServerStore()
const count = ref(0)

request.post(`${apiStore.baseUrl}/user/userList`)
.then((response) => {
  if (response.data.status === 'success') {
    count.value = response.data.data.length
  } else {
    count.value = 0
  }
})
.catch((error) => {
  count.value = 0
})

</script>

<template>
  <v-card elevation="0" class="bg-teal overflow-hidden bubble-shape bubble-teal-shape">
    <v-card-text>
      <div class="d-flex align-start mb-6">
        <v-btn icon rounded="sm" color="darkteal" variant="flat">
          <img :src="iconCard" width="25" />
        </v-btn>
      </div>
      <h2 class="text-h1 font-weight-medium">
        {{ count }}
      </h2>
      <span class="text-subtitle-1 text-medium-emphasis text-white">面板用户数量</span>
    </v-card-text>
  </v-card>
</template>
