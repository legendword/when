
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/List.vue') },
      { path: 'deadlines', component: () => import('pages/Deadlines.vue') },
      { path: 'support', component: () => import('pages/Support.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
