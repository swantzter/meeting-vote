import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from './views/Home.vue'

const Admin = () => import('./views/Admin.vue')
const Vote = () => import('./views/Vote.vue')
const Results = () => import('./views/Results.vue')
const Policies = () => import('./views/Policies.vue')

const routes: RouteRecordRaw[] = [
  { path: '/', component: Home },
  { path: '/policies', component: Policies },
  { path: '/:sessionId/admin', component: Admin },
  { path: '/:sessionId/vote', component: Vote },
  { path: '/:sessionId/results', component: Results }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
