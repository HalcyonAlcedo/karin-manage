<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useSnackbarStore } from '@/stores/snackbar';
import { useAdapterStore } from '@/stores/adapter';

const snackbarStore = useSnackbarStore()
const adapterStore = useAdapterStore()

const titlePage = ref({ title: '模拟终端' });
const breadcrumbs = ref([
  {
    title: '模拟终端',
    disabled: true,
    href: '#'
  }
]);
const message = ref('')
const listContainer = ref(null)
const menu = ref(false)
const terminal = ref({
  uin: 1001,
  name: 'terminal',
  isGroup: false,
  group: undefined,
  hotkey: 'Enter',
  altKey: false
})

const linkAdapter = () => {
  if (adapterStore.adapter?.readyState === 1) {
    adapterStore.closeAAdapter()
  } else {
    adapterStore.initAdapter()
  }
}
const sendMsg = () => {
  if (!message.value) return
  const message_id = -Math.floor(Math.random() * (9999999999 - 1000000000 + 1)) + 1000000000
  const msg = { 
    "self_id": 1000,
    "user_id": terminal.value.uin || 1001,
    "time": Math.floor(Date.now() / 1000),
    "message_id": message_id,
    "real_id": message_id,
    "message_seq": message_id,
    "message_type": terminal.value.isGroup ? "group" : "private",
    "sender": { 
      "user_id": terminal.value.uin || 1001,
      "nickname": terminal.value.name || "虚拟终端",
      "card": terminal.value.name || "虚拟终端",
      "role": "member"
    }, 
    "raw_message": message.value,
    "font": 14,
    "sub_type": terminal.value.isGroup ? "normal" : "friend",
    "message": [
      { "data": { "text": message.value }, "type": "text" }
    ],
    "message_format": "array",
    "post_type": "message",
    "group_id": terminal.value.group || 1000,
    "target_id": 1000
  }

  adapterStore.sendMessage(JSON.stringify(msg),message.value)
  message.value = ''
}
const msgColor = (sender) => {
  switch (sender) {
    case 'adapter':
      return '#00897B'
    case 'system':
      return '#5E35B1'
    case 'terminal':
      return '#1976D2'
    default:
      return '#6D4C41'
  }
}
const handleKeydown = (event) => {
    if (event.key == terminal.value.hotkey && (terminal.value.altKey ? event.altKey : true)) {
      sendMsg()
    }
  }
const messages = computed(() => {
  return adapterStore.messages
})
const adapter = computed(() => {
  return adapterStore.adapter
})
watch(() => adapterStore.messages, (newMessages, oldMessages) => {
    nextTick(() => {
      const container = listContainer.value.$el;
      // 检查用户是否已滚动到列表底部
      if (container.scrollHeight - container.clientHeight <= container.scrollTop + 100) {
        // 滚动到新的列表项
        container.scrollTop = container.scrollHeight;
      }
    });
}, { deep: true });
</script>

<template>
  <BaseBreadcrumb :title="titlePage.title" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>
  <v-row>
    <v-col cols="12" md="12">
      <UiParentCard>
        <template v-slot:action>
          <v-menu
            v-model="menu"
            :close-on-content-click="false"
            location="end"
          >
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                variant="text"
              >
                {{terminal.name || 'terminal'}}
              </v-btn>
            </template>

            <v-card min-width="300">
              <v-list>
                <v-list-item
                  subtitle="在这里配置虚拟终端"
                  title="配置"
                >
                </v-list-item>
              </v-list>

              <v-divider></v-divider>

              <v-list>
                <v-list-subheader>角色编辑</v-list-subheader>
                <v-list-item>
                  <v-text-field v-model="terminal.uin" label="用户ID" variant="underlined"></v-text-field>
                </v-list-item>
                <v-list-item>
                  <v-text-field v-model="terminal.name" label="用户名" variant="underlined"></v-text-field>
                </v-list-item>
                <v-list-item>
                  <v-switch v-model="terminal.isGroup" label="群聊" hide-details ></v-switch>
                </v-list-item>
                <v-list-item>
                  <v-text-field v-model="terminal.group" label="群号" variant="underlined"></v-text-field>
                </v-list-item>
              </v-list>
              <v-divider></v-divider>
              <v-list>
                <v-list-subheader>发送消息</v-list-subheader>
                <v-list-item>
                  <v-text-field v-model="terminal.hotkey" label="快捷键" variant="underlined"></v-text-field>
                </v-list-item>
                <v-list-item>
                  <v-switch v-model="terminal.altKey" label="需按下Alt" hide-details ></v-switch>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>

          <v-spacer></v-spacer>
          <VBtn @click="linkAdapter" variant="text">{{ adapter?.readyState !== undefined ? '关闭' : '连接' }}</VBtn>
        </template>
        <v-col cols="12">
          <v-card>
            <v-card-text style="height: 60vh; overflow-y: auto;" ref="listContainer">
              <v-list>
                <v-list-item v-for="msg in messages" :key="msg.id">
                  <v-list-item-content>
                    <v-alert :color="msgColor(msg.sender)" border="start" variant="outlined" >
                      <v-alert-title>

                        <v-dialog max-width="800">
                          <template v-slot:activator="{ props: activatorProps }">
                            <strong v-bind="activatorProps">{{ msg.sender === 'terminal' ? terminal.name || 'terminal' : msg.sender }}</strong>
                          </template>

                          <template v-slot:default="{ isActive }">
                            <v-card title="原始信息">
                              <template v-slot:text>
                                <pre>{{JSON.stringify(msg.data, null, 2)}}</pre>
                              </template>
                            </v-card>
                          </template>
                        </v-dialog>

                        <v-spacer></v-spacer>
                        <div class="text-h6">{{ msg.time }}</div>
                      </v-alert-title>
                      <v-alert-text>
                        {{msg.message}}
                        <v-dialog v-for="img in msg.image" :key="img">
                          <template v-slot:activator="{ props: activatorProps }">
                            <v-img :src="'data:image/jpeg;base64,' + img" v-bind="activatorProps" style="max-width: 400px; height: auto;"></v-img>
                          </template>
                          <template v-slot:default="{ isActive }">
                            <v-card>
                              <v-card-text>
                                <v-img :src="'data:image/jpeg;base64,' + img"></v-img>
                              </v-card-text>
                            </v-card>
                          </template>
                        </v-dialog>
                      </v-alert-text>
                    </v-alert>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions class="mx-5">
              <v-text-field
                v-model="message"
                append-icon="mdi-send"
                clear-icon="mdi-close-circle"
                type="text"
                label="消息"
                variant="underlined"
                clearable
                @click:append="sendMsg"
                @keydown="handleKeydown"
              ></v-text-field>
            </v-card-actions>
          </v-card>
        </v-col>
      </UiParentCard>
    </v-col>
  </v-row>
</template>
