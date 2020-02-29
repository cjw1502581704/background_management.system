import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入iconfont
import './assets/font_m5xfey9zx6/iconfont.css'
// 引入axios
import axios from 'axios'
// 配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 注册到
Vue.prototype.$axios = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
