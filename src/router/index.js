import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login.vue'
import Home from '../components/home.vue'
import Welcome from '../components/welcome.vue'
import Users from '../components/user/user.vue'
import Roles from '../components/power/roles.vue'
import Rights from '../components/power/rights.vue'

Vue.use(VueRouter)

const routes = [
  // 这里是router
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/roles', component: Roles },
      { path: '/rights', component: Rights }
    ]
  }
]

const router = new VueRouter({
  routes
})
// 添加路由导航守卫
router.beforeEach((to, from, next) => {
  // 登录页直接放行
  if (to.path === '/login') return next()
  // 从sessionStorage中获取token
  const tokenStr = window.sessionStorage.getItem('token')
  // 没有token，强制跳转到login
  if (!tokenStr) return next('/login')
  // 有token，就放行
  next()
})

export default router
