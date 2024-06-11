<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useSnackbarStore } from '@/stores/snackbar';
import { useServerStore } from '@/stores/server';
import { request } from '@/utils/request';

import { TerminalFlash } from 'vue-web-terminal'
import 'vue-web-terminal/lib/theme/dark.css'

const snackbarStore = useSnackbarStore()
const apiStore = useServerStore()

const init_log = [
  {
    "type": "normal",
    "content": "Terminal Initializing ...",
  }
]

const titlePage = ref({ title: '终端' })
const breadcrumbs = ref([
  {
    title: '终端',
    disabled: true,
    href: '#'
  }
]);
const terminalRef = ref()
const flash = ref()
const path = ref()
const socket = ref()

const token = localStorage.getItem('token')
request.post('/system/GetAdapterPort').then(response => {
  let wsUrl = `${apiStore.baseUrl}/system/Terminal`
  if (response.data.status === 'success' && response.data.data.wormhole) {
    wsUrl = `${apiStore.baseUrl.replace("web", "websocket")}/system/Terminal?port=${response.data.data.server}`
  }
  socket.value = new WebSocket(wsUrl, token || '')
  socket.value.onopen = function (event) {
    socket.value.send(JSON.stringify({
      time: Math.floor(Date.now() / 1000),
      action: 'ping'
    }))
    terminalRef.value.pushMessage({
      "type": "normal",
      "content": "Welcome to Karin terminal! If you are using for the first time, you can use the help command to learn.",
      "class": "success",
      "tag": "success"
    })
    // 心跳
    setInterval(() => {
      socket.value.send(JSON.stringify({
        time: Math.floor(Date.now() / 1000),
        action: 'ping'
      }))
    }, 30000)
  }
  socket.value.onmessage = function (event) {
    let message
    try {
      message = JSON.parse(event.data)
      if (message.type === 'output') {
        terminalRef.value.pushMessage({
          type: "normal",
          content: message.content
        })
      } else if (message.type === 'error') {
        terminalRef.value.pushMessage({
          type: "normal",
          content: message.content,
          class: "error",
          tag: "error"
        })
      } else if (message.type === 'directory') {
        path.value = message.content
      } else if (message.type === 'close') {
        flash.value.finish()
      }
    } catch (error) {
      terminalRef.value.pushMessage({
        type: "table",
        content: error,
        class: "error",
        tag: "error"
      })
      flash.value.finish()
      return
    }
  }
  // 监听错误
  socket.value.onerror = function (error) {
    terminalRef.value.pushMessage({
      type: "table",
      content: error,
      class: "error",
      tag: "error"
    })
    flash.value.finish()
  }
  // 连接关闭时触发
  socket.value.onclose = function (event) {
    terminalRef.value.pushMessage({
      type: "normal",
      content: '终端已关闭！',
      class: "error",
      tag: "error"
    })
    flash.value.finish()
  }
})
const onExecCmd = (key, command, success, failed) => {
  const parts = command.split(' ')
  const args = parts.slice(1)
  const commandObject = {
    action: 'execute',
    command: key,
    args: args,
    workingDirectory: path.value
  }
  if (socket.value.readyState === 1) {
    socket.value.send(JSON.stringify(commandObject))
    flash.value = new TerminalFlash()
    success(flash.value)
  } else {
    failed('终端连接异常！')
  }
}
// 定义全局按键事件的处理函数
const handleGlobalKeydown = (event) => {
  if (event.ctrlKey && event.keyCode === 67) {
    event.preventDefault();
    socket.value.send(JSON.stringify({
      action: 'terminate'
    }))
  }
}

// 在组件挂载时添加全局事件监听器
onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown)
})

// 在组件卸载时移除全局事件监听器
onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})

</script>

<template>
  <BaseBreadcrumb :title="titlePage.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <v-row>
    <v-col cols="12" md="12">
      <UiParentCard>
        <v-col cols="12">
          <div style="height: 70vh">
            <terminal name="terminal" ref='terminalRef' :context="path || 'Karin'" :show-header="false"
              :init-log="init_log" @exec-cmd="onExecCmd">
            </terminal>
          </div>
        </v-col>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
