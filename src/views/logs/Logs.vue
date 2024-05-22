<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { request } from '@/utils/request';
import { useServerStore } from '@/stores/server';

const apiStore = useServerStore()
const page = ref({ title: '运行日志' });

const logs = ref([]);
const logError = ref('')
const lastTime = ref('')
const toggle = ref('ALL')
const breadcrumbs = ref([
  {
    title: '运行日志',
    disabled: true,
    href: '#'
  }
]);

const load = ({ done }) => {
  request.post(`${apiStore.baseUrl}/system/GetKarinLogs`, {
    number: -20,
    lastTimestamp: lastTime.value,
    level: toggle.value
  })
    .then((response) => {
      if (response.data.status === 'success') {
        if (response.data.data.length > 0) {
          Array.prototype.push.apply(logs.value, response.data.data)
          lastTime.value = response.data.data[response.data.data.length - 1].timestamp
          done('ok')
        } else {
          logError.value = `没有更多数据了`
          done('empty')
        }
      } else {
        logError.value = `数据获取失败：${response.data?.message || '未知错误'}`
        done('error')
      }
    })
    .catch((error) => {
      logError.value = `数据获取失败：${error.message || '未知错误'}`
      done('error')
    })
}

const level = (type) => {
  switch (type) {
    case 'INFO':
      return 'info'
    case 'WARN':
      return 'warning'
    case 'ERROR':
      return 'error'
    case 'MARK':
      return '#546E7A'
    case 'TRACE':
      return '#FF7043'
    default:
      return '#6D4C41'
  }
}

const reload = () => {
  lastTime.value = ''
  request.post(`${apiStore.baseUrl}/system/GetKarinLogs`, {
    number: -20,
    lastTimestamp: lastTime.value,
    level: toggle.value
  })
    .then((response) => {
      if (response.data.status === 'success') {
        if (response.data.data.length > 0) {
          logs.value = response.data.data
          lastTime.value = response.data.data[response.data.data.length - 1].timestamp
        } else {
          logs.value = []
        }
      } else {
        logs.value = []
      }
    })
    .catch((error) => {
      logs.value = []
    })
}

watch(toggle, () => {
  reload()
})
</script>

<template>
  <BaseBreadcrumb :title="page.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <v-row>
    <v-col cols="12" md="12">
      <UiParentCard title="运行日志">
        <template v-slot:action="{ attrs }">
          <div class="d-flex align-center flex-column pa-6">
            <v-row>
              <v-col cols="auto">
                <v-btn @click="reload" icon>
                  <v-icon>mdi-reload</v-icon>
                </v-btn>
              </v-col>

              <v-col cols="auto">
                <v-btn-toggle v-model="toggle" variant="outlined" divided>
                  <v-btn value="ALL">All</v-btn>
                  <v-btn value="INFO">INFO</v-btn>
                  <v-btn value="WARN">WARN</v-btn>
                  <v-btn value="ERRO">ERROR</v-btn>
                  <v-btn value="MARK">MARK</v-btn>
                  <v-btn value="TRACE">TRACE</v-btn>
                </v-btn-toggle>
              </v-col>
            </v-row>
          </div>
        </template>

        <v-row dense>
          <v-infinite-scroll height="70vh" width="100%" @load="load">
            <template v-for="(item, index) in logs" :key="item">
              <v-list-item>
                <v-alert :text="item.message" :title="item.timestamp" :color="level(item.level)" border="start"
                  variant="outlined" prominent></v-alert>
              </v-list-item>
            </template>
            <template v-slot:empty>
              <v-alert type="warning">{{ logError }}</v-alert>
            </template>
            <template v-slot:error="{ props }">
              <v-alert type="error">
                <div class="d-flex justify-space-between align-center">
                  {{ logError }}
                  <v-btn color="white" size="small" variant="outlined" v-bind="props">
                    重试
                  </v-btn>
                </div>
              </v-alert>
            </template>
          </v-infinite-scroll>
        </v-row>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
