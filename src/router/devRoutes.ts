const DevRoutes = [
  {
    name: 'Renderer',
    path: '/dev/renderer',
    component: () => import('@/views/dev/renderer.vue')
  }
];

export default DevRoutes;
