import { useAuthStore } from '@/stores/auth';

const SystemRoutes = [
  {
    name: 'Logs',
    path: '/system/logs',
    component: () => import('@/views/system/Logs.vue')
  },
  {
    name: 'Database',
    path: '/system/database',
    component: () => import('@/views/system/Database.vue'),
    beforeEnter: (to, from, next) => {
      const auth = useAuthStore();
      const isMatch = auth.user.routes.some(regex => new RegExp(regex).test('/database/'))
      if (isMatch) {
        next(); 
      } else {
        next({ name: 'DatabaseAuthority' });
      }
    }
  },
  {
    name: 'DatabaseAuthority',
    path: '/system/database_authority',
    component: () => import('@/views/system/DatabaseAuthority.vue')
  },
  {
    name: 'VirtualClient',
    path: '/system/vclient',
    component: () => import('@/views/system/VClient.vue')
  },
  {
    name: 'Terminal',
    path: '/system/terminal',
    component: () => import('@/views/system/Terminal.vue')
  }
];

export default SystemRoutes;
