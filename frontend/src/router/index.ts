import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/funcionarios',
    },
    {
      path: '/funcionarios',
      name: 'FuncionariosList',
      component: () => import('@/views/FuncionariosList.vue'),
    },
    {
      path: '/funcionarios/novo',
      name: 'FuncionarioCreate',
      component: () => import('@/views/FuncionarioForm.vue'),
    },
    {
      path: '/funcionarios/:id/editar',
      name: 'FuncionarioEdit',
      component: () => import('@/views/FuncionarioForm.vue'),
      props: true,
    },
    {
      path: '/contratos',
      name: 'ContratosList',
      component: () => import('@/views/ContratosList.vue'),
    },
    {
      path: '/contratos/novo',
      name: 'ContratoCreate',
      component: () => import('@/views/ContratoForm.vue'),
    },
    {
      path: '/contratos/:id/editar',
      name: 'ContratoEdit',
      component: () => import('@/views/ContratoForm.vue'),
      props: true,
    },
  ],
})

export default router
