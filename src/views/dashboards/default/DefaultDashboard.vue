<script setup lang="ts">
import { loadModule } from "vue3-sfc-loader/dist/vue3-sfc-loader"
import * as Vue from 'vue'
import { onMounted, defineAsyncComponent, ref, computed } from "vue"
import { request } from '@/utils/request';
import { useServerStore } from '@/stores/server';
import { useSnackbarStore } from '@/stores/snackbar';

const apiStore = useServerStore();
const snackbarStore = useSnackbarStore()

const widgets = ref([])

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
onMounted(() => {
  load()
})

// 加载远程文件
const load = async () => {
  const pluginList = await request.post('/config/GetPluginList')
  if (pluginList.data.status === 'success') {
    for (const plugin of pluginList.data.data) {
      request.post('/config/GetWidgets', { plugin }).then(res => {
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
              col: widget.data?.col || 4,
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
    <v-col v-masonry-tile v-for="widget in widgetsList" :key="`${widget.plugin}-${widget.file}`" :lg="widget.col || 4"
      cols="12">
      <component v-if="widget.remote" :is="widget.remote" :request="request" :snackbar="snackbarStore" :apiUrl="apiStore.baseUrl"
        :data="widget.data" />
    </v-col>
  </v-row>
</template>
