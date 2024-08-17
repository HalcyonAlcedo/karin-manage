import PluginRoutes from './PluginRoutes';
import KarinRoutes from './karinRoutes';
import userRoutes from './userRoutes';
import SystemRoutes from './systemRoutes';
import DevRoutes from './devRoutes';

const MainRoutes = {
  path: '/main',
  meta: {
    requiresAuth: true
  },
  redirect: '/main/dashboard/default',
  component: () => import('@/layouts/full/FullLayout.vue'),
  children: [
    {
      name: 'LandingPage',
      path: '/',
      component: () => import('@/views/dashboards/default/DefaultDashboard.vue')
    },
    {
      name: 'Default',
      path: '/dashboard/default',
      component: () => import('@/views/dashboards/default/DefaultDashboard.vue')
    },
    {
      name: 'Store',
      path: '/store',
      component: () => import('@/views/store/Store.vue')
    },
    ...PluginRoutes,KarinRoutes,
    ...userRoutes, ...SystemRoutes,
    ...DevRoutes
  ]
};

export default MainRoutes;
