import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';
import '@/assets/css/style/theme/index.css';
import axios from 'axios'
// import { VueJsonp } from 'vue-jsonp'

// 全量引入echarts
import * as echarts from "echarts"
Vue.prototype.$axios = axios
Vue.prototype.$echarts = echarts
Vue.config.productionTip = false
Vue.use(ElementUI)

// Vue.use(VueJsonp)
// const vm = new Vue()
// vm.$jsonp('/some-jsonp-url', {
//         myCustomUrlParam: 'veryNice'
//     })
// Vue.use(axios)

new Vue({
    router,
    store,
    created() {
        const userString = localStorage.getItem('user')
        if (userString) {
            const userData = JSON.parse(userString)
            this.$store.commit('SET_USER_DATA', userData)
        }
    },
    beforeCreate() {
        Vue.prototype.$bus = this // 安装全局事件总线
    },

    render: function (h) {
        return h(App)
    },
}).$mount('#app')