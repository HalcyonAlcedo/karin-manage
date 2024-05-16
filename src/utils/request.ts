// utils/request.js
import Axios from 'axios';
import { useServerStore } from '@/stores/server';
import { useAuthStore } from '@/stores/auth';

export const request = Axios.create();

// 请求拦截器
request.interceptors.request.use((config) => {
  const apiStore = useServerStore(); // 使用 Pinia store
  config.baseURL = apiStore.baseUrl; // 设置动态 API 地址

  // 如果本地存储有 token，将其添加到请求头中
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.authorization = `${token}`;
  }
  return config;
});

// 响应拦截器
request.interceptors.response.use(response => {
  // 如果响应中有新的 token，保存它
  if (response.data.status === 'success' && response.data.data?.token) {
    localStorage.setItem('token', response.data.data.token);
  }

  return response;
},
  error => {
    console.log(error.response?.data)
    // 如果出现权限错误，检查用户是否失去登陆状态
    if (error.response?.data?.status === 'error' || error.response?.data === 'Unauthorized') {
      if (error.response?.data?.error === 'Unauthorized' || error.response?.data === 'Unauthorized') {
        if (!(error.response.request.responseURL.includes('/user/check-user') || error.response.request.responseURL.includes('/user/logout'))) {
          Axios.post('/user/check-user')
            .then((res) => {
              if (res.data.status === 'error') {
                const authStore = useAuthStore();
                authStore.logout()
              }
            })
            .catch((error) => {
              const authStore = useAuthStore();
              authStore.logout()
            });
        }
      }
      return Promise.reject(error);
    }
  }
);
