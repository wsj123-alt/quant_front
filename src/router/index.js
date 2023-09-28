// 该文件专门用于创建整个应用的路由器
// 第一步：引入并use路由插件
import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

// 已登录后，想再去登陆界面, 此时应该不允许, 但点击登录图标后报错. 以下代码用于解决该问题
const routerPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
    return routerPush.call(this, location).catch(error => error)
}

const routes = [{
        // 没有路由时, 默认去/authenticate登陆界面 (若到了登陆界面发现浏览器本地存有用户名和密码, 则又会跳到/stocks)
        path: '/',
        redirect: '/authenticate',
        meta: {
            title: '用户登录',
        },
    },
    {
        path: '/stocks',
        name: 'Stocks',
        meta: {
            title: '股票列表',
        },
        component: () =>
            import('../views/Stocks') // 可以在上面引入, 也可以在这里引入
    },
    {
        path: '/positions',
        name: 'Positions',
        meta: {
            title: '我的持仓'
        },
        component: () =>
            import('../views/Positions')
    },
    {
        path: '/shares',
        name: 'Shares',
        meta: {
            title: '账户'
        },
        component: () =>
            import('../views/Shares')
    },
    {
        path: '/complete',
        name: 'Complete',
        meta: {
            title: '完成订单'
        },
        component: () =>
            import('../views/Complete')
    },
    {
        path: '/delivery',
        name: 'Delivery',
        meta: {
            title: '观望单'
        },
        component: () =>
            import('../views/Delivery')
    },
    {
        path: '/myStrategy',
        name: 'MyStrategy',
        meta: {
            title: '我的策略',
        },
        component: () =>
            import('../views/MyStrategy')
    },
    {
        path: '/authenticate',
        name: 'Authenticate',
        meta: {
            title: '用户登录'
        },
        component: () =>
            import('../views/Authenticate')
    },
]

const router = new VueRouter({
    routes,
    mode: 'history',
    base: process.env.NODE_ENV === 'production' ? '/quant/' : '/', // 不可删
})

router.beforeEach((to, from, next) => {
    let username = localStorage.getItem('username');
    let password = localStorage.getItem('password');
    if ((username === 'admin' || username === 'lihan') && password === '123123') {
        if (to.path == "/authenticate") { // 若已登录且还要去登录页, 则转到主页
            next('/stocks');
        } else {
            next();
        }
    } else { // 只有去登陆界面才放行，其余去向不做操作，相当于默认重定向到登录界面
        if (to.path == "/authenticate") {
            next();
        } else if (from.name == null) { // 一上来from.name是null
            next('/authenticate')
        }
        // 仅以上代码，则存在问题：点击其他界面虽不会做跳转操作，但相应标签会高亮
        // 解决：在Authenticate组件中控制菜单的禁用
    }
})

export default router