<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { request } from '@/utils/request';
import { useServerStore } from '@/stores/server';
import { useSnackbarStore } from '@/stores/snackbar';
import { md5 } from 'js-md5';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';

const apiStore = useServerStore()
const snackbarStore = useSnackbarStore()

const route = useRoute();

const breadcrumbs = ref([
  {
    title: '用户管理',
    disabled: false,
    href: '/user'
  },
  {
    title: route.params.user,
    disabled: true,
    href: '#'
  }
]);

const oldPassword = ref('')
const newPassword = ref('')
const rePassword = () => {
  const opasswd = md5(oldPassword.value)
  const npasswd = md5(newPassword.value)
  request.post(`${apiStore.baseUrl}/user/change-password`,{
    username: route.params.user,
    oldPassword: opasswd,
    newPassword: npasswd
  })
  .then((response) => {
    if (response.data.status === 'success') {
      snackbarStore.open('密码修改成功')
    } else {
      snackbarStore.open('密码修改失败', 'error')
    }
  })
  .catch((error) => {
    snackbarStore.open('密码修改失败', 'error')
  })
}
</script>

<template>
  <BaseBreadcrumb :title="`用户：${route.params.user}`" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <v-row>
    <v-col cols="12" md="12">
      <UiParentCard title="用户配置">
        <v-row dense>
          <v-container>
            <v-title>重置密码</v-title>
            <v-text-field v-model="oldPassword" color="primary" label="旧密码" variant="underlined"></v-text-field>
            <v-text-field v-model="newPassword" color="primary" label="新密码" variant="underlined"></v-text-field>
            <v-spacer></v-spacer>
            <v-btn
              @click="rePassword"
              class="me-2 text-none"
              color="#4f545c"
              prepend-icon="mdi-export-variant"
              variant="flat"
            >
              确认
            </v-btn>
          </v-container>
        </v-row>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
