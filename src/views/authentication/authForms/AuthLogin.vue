<script setup lang="ts">
import { ref } from 'vue';
import Social from '@/assets/images/auth/social.svg';
import { useAuthStore } from '@/stores/auth';
import { Form } from 'vee-validate';
import { request } from '@/utils/request';

import { useSnackbarStore } from '@/stores/snackbar';

const snackbarStore = useSnackbarStore()

const valid = ref(false);
const show1 = ref(false);
const traditional = ref(false);
const copySucceeded = ref(false);
const remember = ref(false)
const password = ref('');
const username = ref('');
const otp = ref('')
const qq = ref()
const bot = ref()
const passwordRules = ref([
  (v: string) => !!v || '尚未输入密码'
]);
const usernameRules = ref([
  (v: string) => !!v || '尚未输入用户名',
  (v: string) => /^[0-9a-zA-Z]+$/.test(v) || '只能由字母和数字组成'
]);
const qqRules = ref([
(v: string) => /^\d+$/.test(v) || '只能由数字组成'
]);
const quickError = ref('')
const otpDialog = ref(false);
const otpValidating = ref(false);
const copyRePassTip = () => {
  navigator.clipboard.writeText('#重置面板管理密码')
  copySucceeded.value = true
  setTimeout(function () {
    copySucceeded.value = false
  }, 3000);
}
/* eslint-disable @typescript-eslint/no-explicit-any */
const validate = (values: any, { setErrors }: any) => {
  const authStore = useAuthStore();
  return authStore.login(username.value, password.value, remember.value).catch((error) => setErrors({ apiError: error }));
}
const otpLogin = () => {
  quickError.value = ''
  request.post('/user/quickLogin', { bot: bot.value, qq: qq.value })
  .then((response) => {
    if (response.data.status === 'success') {
      otp.value = ''
      otpDialog.value = true;
    } else {
      snackbarStore.open(`登陆失败：${response.data.message}`, 'error')
    }
  })
  .catch((error) => {
    snackbarStore.open(`登陆失败：${error.message}`, 'error')
  })
}
const quickLogin = () => {
  otpValidating.value = true
  const authStore = useAuthStore();
  return authStore.quickLogin(bot.value, otp.value).catch((error) => {
    otpValidating.value = false
    otpDialog.value = false
    traditional.value = true
    quickError.value = error
  });
}
</script>

<template>
  <v-dialog
    v-model="otpDialog"
    max-width="400"
    persistent
  >
    <v-card
      class="py-12 px-8 text-center mx-auto ma-4"
      max-width="420"
      width="100%"
    >
      <h3 class="text-h6 mb-2">
        请输入一次性密码以验证您的帐户
      </h3>

      <div>登陆至{{ bot }}。</div>

      <v-otp-input
        v-model="otp"
        :disabled="otpValidating"
        :loading="otpValidating"
        @finish="quickLogin"
        autofocus
        color="primary"
        variant="plain"
      ></v-otp-input>

    </v-card>
  </v-dialog>
  <v-text-field v-model="qq" :rules="qqRules" label="用户QQ" class="mt-4 mb-8" required density="comfortable"
    variant="outlined" color="primary" hide-details="auto"></v-text-field>
  <v-text-field v-model="bot" :rules="qqRules" label="机器人QQ" class="mt-4 mb-8" required density="comfortable"
    variant="outlined" color="primary" hide-details="auto"></v-text-field>
  <v-btn @click="otpLogin" block color="primary" variant="outlined" class="text-lightText socialBtn">
    <img :src="Social" alt="social" />
    <span class="ml-2">快捷登陆</span></v-btn>
  <div v-if="quickError" class="mt-2">
    <v-alert color="error">{{ quickError }}</v-alert>
  </div>
  <v-row>
    <v-col class="d-flex align-center">
      <v-divider class="custom-devider" />
      <v-btn @click="traditional = !traditional" variant="outlined" class="orbtn" rounded="md" size="small">OR</v-btn>
      <v-divider class="custom-devider" />
    </v-col>
  </v-row>
  <div v-if="traditional">
    <h5 class="text-h5 text-center my-4 mb-8">使用账号密码登陆</h5>
    <Form @submit="validate" class="mt-7 loginForm" v-slot="{ errors, isSubmitting }">
      <v-text-field v-model="username" :rules="usernameRules" label="用户名" class="mt-4 mb-8" required
        density="comfortable" hide-details="auto" variant="outlined" color="primary"></v-text-field>
      <v-text-field v-model="password" :rules="passwordRules" label="密码" required density="comfortable"
        variant="outlined" color="primary" hide-details="auto" :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
        :type="show1 ? 'text' : 'password'" @click:append="show1 = !show1" class="pwdInput"></v-text-field>

      <div class="d-sm-flex align-center mt-2 mb-7 mb-sm-0">
        <v-checkbox
        v-model="remember"
        label="保持登陆"
        required
        color="primary"
        class="ms-n2"
        hide-details
      ></v-checkbox>
        <div class="ml-auto">
          <v-dialog max-width="500">
            <template v-slot:activator="{ props: activatorProps }">
              <a v-bind="activatorProps" href="javascript:void(0)" class="text-primary text-decoration-none">忘记密码?</a>
            </template>
            <template v-slot:default="{ isActive }">
              <v-card title="提示">
                <v-card-text>
                  <p>如果你忘记密码可以联系管理员在用户管理页面修改密码</p>
                  <p>如果你是管理员，可以通过发送命令
                    <v-tooltip :text="copySucceeded ? '已复制' : '点击复制'" location="top">
                      <template v-slot:activator="{ props }">
                        <v-chip v-bind="props" @click="copyRePassTip">#重置面板管理密码</v-chip>
                      </template>
                    </v-tooltip>
                    进行密码重置
                  </p>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>

                  <v-btn text="确认" @click="isActive.value = false"></v-btn>
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>
        </div>
      </div>
      <v-btn color="secondary" :loading="isSubmitting" block class="mt-2" variant="flat" size="large" :disabled="valid"
        type="submit">
        登陆</v-btn>
      <div v-if="errors.apiError" class="mt-2">
        <v-alert color="error">{{ errors.apiError }}</v-alert>
      </div>
    </Form>
  </div>
  <div class="mt-5 text-right">
    <v-divider />
    <!-- <v-btn variant="plain" to="/auth/register" class="mt-2 text-capitalize mr-n2">注册账号</v-btn> -->
  </div>
</template>
<style lang="scss">
.custom-devider {
  border-color: rgba(0, 0, 0, 0.08) !important;
}

.socialBtn {
  border-color: rgba(0, 0, 0, 0.08);
  margin: 30px 0 20px 0;
}

.outlinedInput .v-field {
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: none;
}

.orbtn {
  padding: 2px 40px;
  border-color: rgba(0, 0, 0, 0.08);
  margin: 20px 15px;
}

.pwdInput {
  position: relative;

  .v-input__append {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
  }
}

.loginForm {
  .v-text-field .v-field--active input {
    font-weight: 500;
  }
}
</style>
