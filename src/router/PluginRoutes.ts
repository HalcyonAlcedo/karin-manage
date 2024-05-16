const PluginRoutes = {
  name: 'Plugin',
  path: '/plugin/:plugin',
  component: () => import('@/views/config/PluginConfigPage.vue'),
  beforeEnter: (to, from, next) => {
    if (to.params.plugin) {
      next(); 
    } else {
      next({ name: 'LandingPage' });
    }
  }
};

export default PluginRoutes;
