<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { request } from '@/utils/request';
import { useServerStore } from '@/stores/server';

const apiStore = useServerStore()
const page = ref({ title: '用户' });

const userList = ref([]);

const breadcrumbs = shallowRef([
  {
    title: '用户管理',
    disabled: true,
    href: '#'
  }
]);

request.post(`${apiStore.baseUrl}/user/userList`)
.then((response) => {
  if (response.data.status === 'success') {
    userList.value = response.data.data
  } else {
    userList.value = []
  }
})
.catch((error) => {
  userList.value = []
})
</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <v-row>
    <v-col cols="12" md="12">
      <UiParentCard title="用户管理">
        <v-row dense>
          <v-col v-for="(item, k) in userList" :key="item.username" cols="6" md="3">
            <v-card :title="item.username" :append-icon="item.status == 'enabled'? 'mdi-check' : 'mdi-close'"
              color="primary" variant="tonal" class="mx-auto" prepend-icon="mdi-account">
              <v-card-text>
                <div class="text-overline mb-1">
              可访问api
              </div>
              <div class="text-h6 mb-1">
                {{ item.routes.join(' | ') }}
              </div>
              </v-card-text>
              <v-card-actions>
              <v-btn :to="`/user/${item.username}`">
                配置用户
              </v-btn>
            </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
