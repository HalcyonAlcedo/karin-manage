const KarinRoutes = [
  {
    name: 'User',
    path: '/user',
    component: () => import('@/views/user/UserManagement.vue')
  },
  {
    name: 'UserManage',
    path: '/user/:user',
    component: () => import('@/views/user/UserEdit.vue')
  }
];

export default KarinRoutes;
