import { defineStore } from 'pinia';
import type { PersistedStateOptions } from 'pinia-plugin-persistedstate';
import { md5 } from 'js-md5';
import { router } from '@/router';
import { request } from '@/utils/request';

interface User {
  username: string;
  routes: Array<string>;
  token: string;
};

export const useAuthStore = defineStore({
  id: 'auth',
  state: () => ({
    // initialize state from local storage to enable user to stay logged in
    /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    user: null as User | null,
    returnUrl: null
  }),
  actions: {
    async login(username: string, password: string, remember:boolean) {
      // const user = await fetchWrapper.post(`${baseUrl}/authenticate`, { username, password });
      try {
        const passwordMd5 = md5(password)
        const response = await request.post('/user/login', { username, password: passwordMd5, remember });
        if (response.data.status === 'success') {
          this.user = {
            username: username,
            routes: response.data.data.routes,
            token: response.data.data.token
          }
        } else {
          throw new Error(response.data.message)
        }
      } catch (error) {
        throw new Error('服务器错误')
      }
      // store user details and jwt in local storage to keep user logged in between page refreshes
      // localStorage.setItem('user', JSON.stringify(user));
      // redirect to previous url or default to home page
      router.push(this.returnUrl || '/dashboard/default');
    },
    async quickLogin(bot: string, otp: string) {
      try {
        const response = await request.post('/user/quickLogin', { bot, otp });
        if (response.data.status === 'success') {
          this.user = {
            username: response.data.data.user || bot,
            routes: response.data.data.routes,
            token: response.data.data.token
          }
        } else {
          throw new Error(response.data.message)
        }
      } catch (error) {
        throw new Error('服务器错误')
      }
      router.push(this.returnUrl || '/dashboard/default');
    },
    async elevation(auth: string) {
      if (this.user?.routes !== undefined && this.user?.username) {
        this.user.routes = [...this.user.routes, auth]
        const response = await request.post('/user/change-permissions', { username: this.user.username, permissions: this.user.routes })
        if (response.data.status === 'success') {
          return true
        }
      }
      return false
    },
    logout() {
      const username = this.user?.username
      this.user = null;
      request.post('/user/logout', { username });
      // localStorage.removeItem('user');
      router.push('/auth/login');
    }
  },
  persist: {
    strategies: [
      {
        storage: localStorage, // 或者其他存储方式
        paths: ['user'] // 指定要持久化的属性
      }
    ]
  } as PersistedStateOptions
});
