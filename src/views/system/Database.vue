<script setup lang="ts">
import { ref, watch } from 'vue';
import { debounce } from 'lodash';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { request } from '@/utils/request';
import { useServerStore } from '@/stores/server';
import { useSnackbarStore } from '@/stores/snackbar';

const apiStore = useServerStore()
const snackbarStore = useSnackbarStore()

const titlePage = ref({ title: '数据库' });
const breadcrumbs = ref([
  {
    title: '数据库',
    disabled: true,
    href: '#'
  }
]);

const itemsPerPage = ref(5)
const headers = ref([
  {
    title: '键',
    align: 'start',
    sortable: false,
    key: 'key',
  },
  { title: '值', sortable: false, key: 'value' },
  { title: '类型', sortable: false, key: 'type' },
  { title: 'TTL', sortable: false, key: 'ttl' }
])
const search = ref('')
const serverItems = ref([])
const loading = ref(true)
const totalItems = ref(0)

const loadItems = ({ page, itemsPerPage, sortBy }) => {
  loading.value = true
  let pattern = search.value
  if (pattern == '') pattern = '*'
  request.post(`${apiStore.baseUrl}/database/SearchData`, {
    pattern: pattern,
    page: page,
    count: itemsPerPage
  })
    .then((response) => {
      if (response.data.status === 'success') {
        serverItems.value = response.data.data.data
        totalItems.value = response.data.data.total
        loading.value = false
      } else {
        snackbarStore.open('数据获取失败', 'error')
        loading.value = false
      }
    })
    .catch((error) => {
      snackbarStore.open(`数据获取失败: ${error.message}`, 'error')
      loading.value = false
    })
}
const debouncedSetSearch = debounce((event) => {
  search.value = event.target.value
}, 500);
</script>

<template>
  <BaseBreadcrumb :title="titlePage.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <v-row>
    <v-col cols="12" md="12">
      <UiParentCard title="数据库">

        <template v-slot:action>
          <v-spacer></v-spacer>
          <v-text-field @input="debouncedSetSearch" density="compact" label="搜索" prepend-inner-icon="mdi-magnify"
            variant="solo-filled" flat hide-details single-line></v-text-field>
        </template>
        <v-data-table-server v-model:items-per-page="itemsPerPage" :headers="headers" :items="serverItems"
          :items-length="totalItems" :loading="loading" :search="search" @update:options="loadItems">
          <template v-slot:item.value="{ value }">
            <v-textarea :model-value="value" variant="underlined" :rows="Math.ceil(value.length / 30)" readonly auto-grow></v-textarea>
          </template>
        </v-data-table-server>
      </UiParentCard>


    </v-col>
  </v-row>
</template>
