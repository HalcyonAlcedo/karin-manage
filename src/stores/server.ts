import { defineStore } from 'pinia';
import type { PersistedStateOptions } from 'pinia-plugin-persistedstate';

const serverUrl = localStorage.getItem('api') || 'http://localhost:5333';

export const useServerStore = defineStore({
  id: 'server',
  state: () => ({
    // API 基础地址
    baseUrl: import.meta.env.DEV ? '/api' : serverUrl
  }),
  actions: {
    // 动态修改 API 地址的方法
    updateBaseUrl(newUrl:string) {
      localStorage.setItem('api', newUrl);
      this.baseUrl = newUrl;
    }
  },
  persist: {
    strategies: [
      {
        storage: localStorage, // 或者其他存储方式
        paths: ['baseUrl'] // 指定要持久化的属性
      }
    ]
  } as PersistedStateOptions
});
