const SystemRoutes = [
  {
    name: 'Logs',
    path: '/system/logs',
    component: () => import('@/views/system/Logs.vue')
  },
  {
    name: 'Redis',
    path: '/system/redis',
    component: () => import('@/views/system/Redis.vue')
  }
];

export default SystemRoutes;
