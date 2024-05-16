const KarinRoutes = {
  name: 'Karin',
  path: '/karin/:file',
  component: () => import('@/views/config/KarinConfigPage.vue'),
  beforeEnter: (to, from, next) => {
    if (to.params.file) {
      next(); 
    } else {
      next({ name: 'LandingPage' });
    }
  }
};

export default KarinRoutes;
