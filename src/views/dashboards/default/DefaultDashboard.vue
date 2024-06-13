<script setup lang="ts">
import { loadModule } from "vue3-sfc-loader/dist/vue3-sfc-loader"
import * as Vue from 'vue'
import { onMounted, defineAsyncComponent, ref } from "vue"
import { request } from '@/utils/request';
import { useServerStore } from '@/stores/server';

const apiStore = useServerStore();

const widgets = ref([])

onMounted(() => {
  load()
})

// 加载远程文件
const load = async () => {
  const pluginList = await request.post('/config/GetPluginList')
  if (pluginList.data.status === 'success') {
    for (const plugin of pluginList.data.data) {
      request.post('/config/GetWidgets', { plugin }).then( res => {
        if (res.data.status === 'success') {
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
          widgets.value.push({
            plugin: widget.plugin,
            file: widget.file,
            data: widget.data,
            col: widget.data?.col,
            remote: defineAsyncComponent(() => loadModule(widget.file, options))
          })
        }
      }
      })
    }
  }
}
</script>

<template>
  <v-row v-masonry>
    <!-- 远程组件 -->
    <v-col v-masonry-tile v-for="widget in widgets" :key="widget" :lg="widget.col || 4" cols="12">
      <component v-if="widget.remote" :is="widget.remote" :request="request" :apiUrl="apiStore.baseUrl"
        :data="widget.data" />
    </v-col>

  </v-row>
</template>
