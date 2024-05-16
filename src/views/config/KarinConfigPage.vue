<script setup lang="ts">
import { ref, shallowRef, provide, watch } from 'vue';
import { useRoute } from 'vue-router';
import { request } from '@/utils/request';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import RecursiveEditor from './RecursiveEditor.vue';

const route = useRoute();

const breadcrumbs = ref([
  {
    title: 'Karin配置',
    disabled: false,
    href: '#'
  },
  {
    title: route.params.file,
    disabled: true,
    href: '#'
  }
]);
const configs = ref([])
const isFetchingConfigs = ref(false)
const changeConfig = ref([])
const setConfig = ref([])
const headers = shallowRef([
  { title: '配置文件', key: 'file' },
  { title: '配置项', key: 'key' },
  { title: '值', key: 'value', sortable: false },
  { title: '操作', key: 'actions', sortable: false }
])
const getConfigs = () => {
  isFetchingConfigs.value = true;
  const fileName = route.params.file;

  request.post('/config/GetKarinConfig', { file: fileName })
  .then((configData) => {
    if (configData.data.status === 'success') {
      configs.value = configData.data.data
    }
    isFetchingConfigs.value = false;
  })
  .catch((error) => {
    console.error(error)
    isFetchingConfigs.value = false;
  })
}
const deleteItem = (item) =>{
  changeConfig.value.splice(changeConfig.value.indexOf(item), 1)
}
const processData = (path, value, file) => {
  let item = changeConfig.value.find(obj => obj.key === path)
  if (item) {
    item.value = value
  } else {
    changeConfig.value.push({
      key: path, value, file
    })
  }
}
const postConfig = () => {
  console.log(setConfig.value)
  isFetchingConfigs.value = true
  request.post('/config/SetKarinConfig', {
    config: setConfig.value
  }).then((response) => {
    getConfigs()
    // 更新数据
    changeConfig.value = []
    setConfig.value = []
  }).catch((error) => {
    console.error(error)
  })
}
watch(() => route.params, () => {
  getConfigs()
});
provide('processData', processData);
getConfigs()
</script>

<template>
  <BaseBreadcrumb :title="route.params.file" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <v-data-table 
    v-if="changeConfig.length > 0" 
    v-model="setConfig" 
    :headers="headers"
    :items="changeConfig"
    show-select return-object>
    <template v-slot:top>
      <v-toolbar
        flat
      >
        <v-toolbar-title>确认修改项</v-toolbar-title>
        <v-divider
          class="mx-4"
          inset
          vertical
        ></v-divider>
        <v-spacer></v-spacer>
        <v-btn
          @click="postConfig"
          class="mb-2"
          color="primary"
          dark
        >
          保存
        </v-btn>
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon
        size="small"
        @click="deleteItem(item)"
      >
        mdi-delete
      </v-icon>
    </template>
  </v-data-table>
  <VContainer>
    <UiParentCard>
      <recursive-editor :file="route.params.file" :data="configs" />
    </UiParentCard>
  </VContainer>
  <v-dialog
      v-model="isFetchingConfigs"
      max-width="320"
      persistent
    >
      <v-list
        class="py-2"
        color="primary"
        elevation="12"
        rounded="lg"
      >
        <v-list-item
          prepend-icon="mdi-contain"
          title="数据加载中"
        >
          <template v-slot:prepend>
            <div class="pe-4">
              <v-icon color="primary" size="x-large"></v-icon>
            </div>
          </template>

          <template v-slot:append>
            <v-progress-circular
              color="primary"
              indeterminate="disable-shrink"
              size="16"
              width="2"
            ></v-progress-circular>
          </template>
        </v-list-item>
      </v-list>
    </v-dialog>
</template>
