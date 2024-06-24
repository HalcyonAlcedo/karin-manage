<script setup>
import { loadModule } from "vue3-sfc-loader/dist/vue3-sfc-loader"
import * as Vue from 'vue'
import { defineAsyncComponent, ref, computed, nextTick, onErrorCaptured } from "vue"
import { Codemirror } from 'vue-codemirror'
import { vue as langVue } from '@codemirror/lang-vue'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { useServerStore } from '@/stores/server';
import { useSnackbarStore } from '@/stores/snackbar';
import { request } from '@/utils/request';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import ErrorComponent from './components/Error.vue';
import LoadingComponent from './components/Loading.vue';

const breadcrumbs = [
  {
    title: '渲染页面开发',
    disabled: true,
    href: '#'
  }
];

const apiStore = useServerStore();
const snackbarStore = useSnackbarStore()

const code = ref(`<template>  

</template>

<script setup>
import request from 'request'
import { ref } from 'vue'

const props = defineProps({
  apiUrl: String,
  data: Object
})

</${'script'}>`);
const codeData = ref('')
const codeExtensions = [langVue(), oneDark]
const DtatExtensions = [json(), oneDark]

const widget = ref();
const widgetErr = ref('');
const widgetShow = ref(false);

const data = computed(() => {
  try {
    return JSON.parse(codeData.value)
  } catch (error) {
    return {}
  }
})

const loadAsyncComponent = (options) => {
  return new Promise((resolve, reject) => {
    loadModule('edit.vue', options).then(module => {
      resolve(module);
    }).catch(err => {
      widgetErr.value = err.toString()
      reject(null);
    });
  });
};

const updateWidget = () => {
  widgetShow.value = false
  widgetErr.value = ''
  nextTick(() => {
    const options = {
      moduleCache: {
        vue: Vue,
        request: request
      },
      async getFile() {
        return code.value
      },
      addStyle(textContent) {
        const style = Object.assign(document.createElement('style'), { textContent })
        const ref = document.head.getElementsByTagName('style')[0] || null
        document.head.insertBefore(style, ref)
      },
    }
    try {
      widget.value = defineAsyncComponent({
        loader: () => loadAsyncComponent(options),
        loadingComponent: LoadingComponent, // 显示加载时
        errorComponent: ErrorComponent, // 显示是否有错误
      })
      widgetShow.value = true
    } catch (error) {
      widgetErr.value = error.toString()
      widget.value = ErrorComponent
    }
  });

};
onErrorCaptured((err, vm, info) => {
  const componentName = vm.$options.__name;
  if (componentName === 'edit') {
    widgetErr.value = err.toString()
    widget.value = ErrorComponent
  }
  return false;
});
</script>

<template>
  <BaseBreadcrumb title="渲染页面开发" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <v-row>
    <v-col cols="12" md="6">
      <v-row>
        <v-col cols="12">
          <v-card elevation="16" class="editor-container" height="59vh">
            <codemirror v-model="code" placeholder="Code goes here..." :style="{ height: '100%', width: '100%' }" :autofocus="true"
              :indent-with-tab="true" :tab-size="2" :extensions="codeExtensions" @ready="updateWidget"
              @change="updateWidget" />
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-card elevation="16" class="editor-container" height="19vh">
            <codemirror v-model="codeData" placeholder="在此处填写数据..." :style="{ height: '100%', width: '100%' }" :autofocus="true"
              :indent-with-tab="true" :tab-size="2" :extensions="DtatExtensions" @ready="updateWidget"
              @change="updateWidget" />
          </v-card>
        </v-col>

      </v-row>
    </v-col>
    <v-col cols="12" md="6">
      <v-card elevation="16" class="preview-container" height="80vh">
        <component v-if="widgetShow" :is="widget" :data="data" :snackbar="snackbarStore" :apiUrl="apiStore.baseUrl" :err="widgetErr"  />
        <LoadingComponent v-else />
      </v-card>
    </v-col>
  </v-row>

</template>

<style scoped>
.editor-container {
  flex: 1;
  padding: 16px;
  height: 100vh;
}

.preview-container {
  flex: 1;
  padding: 16px;
}
</style>