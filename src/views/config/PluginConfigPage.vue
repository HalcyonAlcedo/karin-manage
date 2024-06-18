<script setup lang="ts">
import { loadModule } from "vue3-sfc-loader/dist/vue3-sfc-loader"
import * as Vue from 'vue'
import { ref, shallowRef, provide, watch, computed, defineAsyncComponent, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { request } from '@/utils/request';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import RecursiveEditor from './RecursiveEditor.vue';

import { useSnackbarStore } from '@/stores/snackbar';
import { useServerStore } from '@/stores/server';

const route = useRoute();
const apiStore = useServerStore();
const snackbarStore = useSnackbarStore()

const breadcrumbs = ref([
  {
    title: '插件配置',
    disabled: false,
    href: '/plugin'
  },
  {
    title: route.params.plugin,
    disabled: true,
    href: '#'
  }
]);
const configs = ref([])
const view = ref([])
const isFetchingConfigs = ref(false)
const changeConfig = ref([])
const setConfig = ref([])
const page = ref(1)
const widgets = ref([])

const pageCount = computed(() => {
  return Math.ceil(changeConfig.value.length / 5)
})
const widgetsList = computed(() => {
  const sortColsArray = (arr) => {
    let result = []
    let tempArr = [...arr]

    while (tempArr.length > 0) {
      let rowSum = 0
      let rowIndexes = []

      for (let i = 0; i < tempArr.length; i++) {
        if (rowSum + tempArr[i].col <= 12) {
          rowSum += tempArr[i].col
          rowIndexes.push(i)
        }
      }

      if (rowSum < 12 && tempArr.length > rowIndexes.length) {
        let diff = 12 - rowSum
        let closest = tempArr
          .map((obj, index) => ({ index, diff: Math.abs(diff - obj.col) }))
          .filter(obj => !rowIndexes.includes(obj.index))
          .sort((a, b) => a.diff - b.diff)[0]

        if (closest && closest.diff <= diff) {
          rowSum += tempArr[closest.index].col
          rowIndexes.push(closest.index)
        }
      }

      result.push(...rowIndexes.map(index => tempArr[index]))
      tempArr = tempArr.filter((_, index) => !rowIndexes.includes(index))
    }

    return result
  }

  let col4Array = widgets.value.filter(item => item.col === 4);
  let otherColsArray = widgets.value.filter(item => item.col !== 4);
  let sortedArray = sortColsArray(otherColsArray)
  return [...col4Array, ...sortedArray]
})
const headers = shallowRef([
  { title: '配置文件', key: 'file' },
  { title: '配置项', key: 'key' },
  { title: '值', key: 'value', sortable: false },
  { title: '操作', key: 'actions', sortable: false }
])
const getConfigs = () => {
  isFetchingConfigs.value = true;
  const pluginName = route.params.plugin;
  request.post('/config/GetPluginConfig', { plugin: pluginName })
    .then((configData) => {
      if (configData.data.status === 'success') {
        Object.keys(configData.data.data).forEach(key => {
          const data = configData.data.data[key]
        });
        configs.value = configData.data.data
        view.value = configData.data.view
      }
      isFetchingConfigs.value = false;
    })
    .catch((error) => {
      snackbarStore.open(`获取数据失败${error}`, 'error')
      isFetchingConfigs.value = false;
    })
}
const deleteItem = (item) => {
  changeConfig.value.splice(changeConfig.value.indexOf(item), 1)
}
const processData = (path, value, file) => {
  let item = changeConfig.value.find(obj => obj.key === path && obj.file === file)
  if (item) {
    item.value = value
  } else {
    changeConfig.value.push({ key: path, value, file })
  }
}
const postConfig = () => {
  const fileName = route.params.plugin
  isFetchingConfigs.value = true
  request.post('/config/SetPluginConfig', {
    plugin: fileName,
    config: setConfig.value
  }).then((response) => {
    if (response.data.status === 'success') {
      snackbarStore.open('保存成功')
      getConfigs()
      for (const change of response.data.data) {
        changeConfig.value = changeConfig.value.filter(obj => !(obj.file === change.file && obj.key === change.key))
      }
    } else {
      isFetchingConfigs.value = false
      snackbarStore.open('保存失败', 'error')
    }
    setConfig.value = []
  }).catch((error) => {
    isFetchingConfigs.value = false
    snackbarStore.open(`保存失败：${error.message}`, 'error')
  })
}
const postAllConfig = () => {
  setConfig.value = changeConfig.value
  postConfig()
}
const getTitle = (file) => {
  return view.value?.find(el => el.file === (file.endsWith('.yaml') ? file : file + '.yaml')).name || file
}
const load = async () => {
  request.post('/config/GetWidgets', { plugin: route.params.plugin }).then(res => {
    if (res.data.status === 'success') {
      let widgetList = []
      for (const widget of res.data.data) {
        const options = {
          moduleCache: {
            vue: Vue
          },
          async getFile() {
            return widget.widget
          },
          addStyle(textContent) {
            const style = Object.assign(document.createElement('style'), { textContent })
            const ref = document.head.getElementsByTagName('style')[0] || null
            document.head.insertBefore(style, ref)
          },
        }
        // 加载远程组件
        if (widget.plugin === route.params.plugin && widget.onPlugin) {
          widgetList.push({
            plugin: widget.plugin,
            file: widget.file,
            data: widget.data,
            col: widget.data?.col || 4,
            remote: defineAsyncComponent(() => loadModule(widget.file, options))
          })
        }
      }
      widgets.value = widgetList
    }
  })
}
watch(() => route.params, () => {
  widgets.value = []
  load()
  getConfigs()
});
provide('processData', processData);
onMounted(() => {
  load()
  getConfigs()
})
</script>

<template>
  <BaseBreadcrumb :title="route.params.plugin" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <v-banner v-if="changeConfig.length > 0" elevation="2" sticky style="z-index: 100;">
    <v-data-table v-model="setConfig" v-model:page="page" :headers="headers" :items="changeConfig" items-per-page="5"
      show-select return-object>
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>确认修改项</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-btn @click="postAllConfig" class="mb-2" color="primary" dark>
            全部保存
          </v-btn>
          <v-btn @click="postConfig" class="mb-2" color="primary" dark>
            保存
          </v-btn>
        </v-toolbar>
      </template>
      <template v-slot:bottom>
        <div class="text-center pt-2">
          <v-pagination v-model="page" :length="pageCount"></v-pagination>
        </div>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon size="small" @click="deleteItem(item)">
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>
  </v-banner>
  <v-row>
    <v-col v-if="widgetsList.length" cols="12" md="12">
      <UiParentCard class="my-4">
        <v-row>
          <v-col v-for="widget in widgetsList" :key="`${widget.plugin}-${widget.file}`" :lg="widget.col || 4" cols="12">
            <component v-if="widget.remote" :is="widget.remote" :request="request" :snackbar="snackbarStore"
              :apiUrl="apiStore.baseUrl" :data="widget.data" />
          </v-col>
        </v-row>
      </UiParentCard>
    </v-col>
    <v-col cols="12" md="12">
      <UiParentCard v-for="(config, key, index) in configs" :key="index" :title="getTitle(key)" class="my-4">
        <recursive-editor :file="key" :data="config" />
      </UiParentCard>
    </v-col>
  </v-row>
  <v-dialog v-model="isFetchingConfigs" max-width="320" persistent>
    <v-list class="py-2" color="primary" elevation="12" rounded="lg">
      <v-list-item prepend-icon="mdi-contain" title="数据加载中">
        <template v-slot:prepend>
          <div class="pe-4">
            <v-icon color="primary" size="x-large"></v-icon>
          </div>
        </template>

        <template v-slot:append>
          <v-progress-circular color="primary" indeterminate="disable-shrink" size="16" width="2"></v-progress-circular>
        </template>
      </v-list-item>
    </v-list>
  </v-dialog>
</template>
