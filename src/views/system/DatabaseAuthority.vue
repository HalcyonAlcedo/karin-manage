<script setup lang="ts">
import { ref, computed } from 'vue';
import { router } from '@/router';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useAuthStore } from '@/stores/auth';
import { useSnackbarStore } from '@/stores/snackbar';

const snackbarStore = useSnackbarStore()
const auth = useAuthStore()

const titlePage = ref({ title: '数据库' });
const breadcrumbs = ref([
  {
    title: '数据库',
    disabled: true,
    href: '#'
  }
]);
const loading = ref(false)

const isMatch = computed(() => {
  return auth.user?.routes?.some(regex => new RegExp(regex).test('/database/'))
})

const elevation = async () => {
  if (isMatch.value) {
    router.push('/system/database')
    return
  }
  loading.value = true
  if (!await auth.elevation('^/database/.*$')) {
    snackbarStore.open('权限修改失败', 'error')
  }
  loading.value = false
}
</script>

<template>
  <BaseBreadcrumb :title="titlePage.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <v-row>
    <v-col>
      <v-alert v-if="!isMatch" density="compact" text="不建议直接对数据库进行修改，如确有需求，请点击下方申请权限为当前账号添加数据库访问权限。" title="警告"
        type="warning" />
    </v-col>
    <v-col cols="12" md="12">
      <UiParentCard title="数据库">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <div class="text-h2 text-medium-emphasis ps-2">
              <v-icon icon="mdi-database" :color="isMatch ? 'success' : 'warning'"></v-icon> {{ isMatch ? '验证通过' :
    '权限警告' }}
            </div>
          </v-card-title>

          <v-divider class="mb-4"></v-divider>

          <v-card-text>
            <div class="text-h4 text-medium-emphasis mt-4">
              {{ isMatch ? '当前用户拥有数据库访问权限' : '当前用户无法访问数据库' }}
            </div>
            <v-btn @click="elevation" :loading="loading" class="text-none font-weight-bold ms-n4" color="primary"
              :text="isMatch ? '前往' : '申请权限'" variant="text"></v-btn>
          </v-card-text>

          <v-divider class="mt-2"></v-divider>

          <v-card-actions class="my-2 d-flex justify-end">
            <v-btn to="/" class="text-none" color="primary" rounded="xl" text="首页" variant="flat"></v-btn>
          </v-card-actions>
        </v-card>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
