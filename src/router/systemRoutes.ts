import { useAuthStore } from '@/stores/auth';

const SystemRoutes = [
  {
    name: 'Logs',
    path: '/system/logs',
    component: () => import('@/views/system/Logs.vue')
  },
  {
    name: 'Redis',
    path: '/system/redis',
    component: () => import('@/views/system/Redis.vue'),
    beforeEnter: (to, from, next) => {
      const auth = useAuthStore();
      console.log(auth.user.routes)
      const isMatch = auth.user.routes.some(regex => new RegExp(regex).test('/redis/'))
      if (isMatch) {
        next(); 
      } else {
        next({ name: 'RedisAuthority' });
      }
    }
  },
  {
    name: 'RedisAuthority',
    path: '/system/redis_authority',
    component: () => import('@/views/system/RedisAuthority.vue')
  }
];

export default SystemRoutes;
