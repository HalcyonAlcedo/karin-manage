<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import Logo from '@/layouts/full/logo/LogoDark.vue';
import AuthLogin from '../authForms/AuthLogin.vue';

import { useServerStore } from '@/stores/server';

const route = useRoute()
const apiStore = useServerStore();

const server = ref(apiStore.baseUrl)
const dialog = ref(false)
const verifyMsg = ref('')
const rules = ref(value => /^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/.test(value) || '错误的URL') 
const childRef = ref(null)

const request = axios.create({
  timeout: 10000
});

 
const updateChild = () => {
  if (childRef.value) {
    childRef.value.getUserList();
  }
};

const verifyServer = (url:string) => {
  if (!url) {
    if (/^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/.test(server.value)) {
      url = server.value.endsWith('/') ? server.value.slice(0, -1) : server.value
    } else {
      verifyMsg.value = `验证失败: 错误的服务器地址`
      dialog.value = true
      return
    }
  }
  verifyMsg.value = '验证中'
  request.post(`${url}/system/verify`)
  .then((response) => {
    if (response.data.status === 'success') {
      if (url !== apiStore.baseUrl) {
        apiStore.updateBaseUrl(url)
      }
      verifyMsg.value = '验证通过'
      dialog.value = false
      updateChild()
      if (childRef.value) {
        childRef.value.queryLogin();
      }
    } else {
      verifyMsg.value = `验证失败: ${response.data.error || '未知错误'}`
      dialog.value = true
    }
  })
  .catch((error) => {
    verifyMsg.value = `验证失败: ${error}`
    dialog.value = true
  })
}

if(route.query.server) {
  server.value = decodeURIComponent(route.query.server as string)
  verifyServer(decodeURIComponent(route.query.server as string))
} else {
  verifyServer(apiStore.baseUrl)
}

</script>

<template>
  <v-row class="h-screen" no-gutters>
    <!---Left Part-->
    <v-col cols="12" class="d-flex align-center bg-lightprimary">
      <v-container>
        <div class="pa-7 pa-sm-12">
          <v-row justify="center">
            <v-col cols="12" lg="10" xl="6" md="7">
              <v-card elevation="0" class="loginBox">
                <v-card variant="outlined">
                  <v-card-text class="pa-9">
                    <!---Left Part Logo -->
                    <v-row>
                      <v-col cols="12" class="text-center">
                        <Logo />
                        <h2 class="text-secondary text-h2 mt-8">欢迎使用karin管理面板</h2>
                        <h4 class="text-disabled text-h4 mt-3">输入
                          <v-tooltip text="点击此处切换服务器">
                            <template v-slot:activator="{ props }">
                              <strong @click="dialog = true" v-bind="props">karin服务器</strong>
                            </template>
                          </v-tooltip>
                          地址和用户凭据登陆面板</h4>
                      </v-col>
                    </v-row>
                    <!---Left Part Logo -->

                    <!---Left Part Form-->
                    <AuthLogin ref="childRef" />
                    <!---Left Part Form-->
                  </v-card-text>
                </v-card>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-col>
    
    <v-dialog
      v-model="dialog"
      max-width="400"
      persistent
    >
      <v-card
        prepend-icon="mdi-server-network"
        text="当前服务器无响应，请确认服务器地址是否正确"
        title="服务器无响应"
      >
      <v-card-text>
          <v-row dense>
            <v-col>
              <v-text-field
                v-model="server"
                :rules="[rules]"
                label="服务器地址"
                required
                variant="underlined"
              ></v-text-field>
            </v-col>
          </v-row>
          <small class="text-caption text-medium-emphasis">{{verifyMsg}}</small>
        </v-card-text>
        <template v-slot:actions>
          <v-spacer></v-spacer>
          <v-btn @click="verifyServer()">
            确认
          </v-btn>
        </template>
      </v-card>
    </v-dialog>

    <!---Left Part-->
  </v-row>
</template>

<style lang="scss">
.loginBox {
  max-width: 475px;
  margin: 0 auto;
}
</style>
