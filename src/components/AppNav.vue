<template>
  <div>
    <!-- 顶部导航栏 (只有一行, 分成三大列) -->
    <el-row>
      
      <!-- 1. logo -->
      <el-col :span="3">
        <div style="height: 60.4px; background-color: #009688">
          <el-image style="width: 120px;  margin-top: 10px; margin-left: 10px" :src="logourl"></el-image>
        </div>
      </el-col>

      <!-- 2. 导航栏 -->
      <el-col :span="17">
        <el-menu v-if="!$route.meta.navHide" :default-active="$route.path" class="el-menu-demo" mode="horizontal"
          @select="handleSelect" background-color="#009688" text-color="#fff" active-text-color="#FFA000">
          <el-menu-item index="/stocks" :disabled="menuDisabled">策略</el-menu-item>
          <el-menu-item index="/delivery" :disabled="menuDisabled">观望单</el-menu-item>
          <el-menu-item index="/positions" :disabled="menuDisabled">我的持仓</el-menu-item>
          <el-menu-item index="/complete" :disabled="menuDisabled">完成订单</el-menu-item>
          <!-- <el-menu-item index="/myStrategy" :disabled="menuDisabled">我的策略</el-menu-item> -->
          <el-menu-item index="/shares" :disabled="menuDisabled">账户</el-menu-item>
        </el-menu>
      </el-col>

      <!-- 3. 用户信息 -->
      <el-col class="auth" style="height: 60.4px ; background-color: #009688" :span="4">
        <template>
          <!-- 小人图标 -->
          <el-button class="info" icon="el-icon-user-solid" @click="auth" circle :disabled="loginBtnDisabled">
          </el-button>
          <!-- 欢迎admin (不能点) 或 登录 -->
          <el-link class="info" :underline="false" @click="auth" :disabled="loginBtnDisabled">{{elLinkText}}</el-link>
          <!-- 登出 (登陆界面不显示此链接) -->
          <el-link v-if="loginBtnDisabled" class="info2" :underline="false" @click="logout">登出</el-link>
        </template>
      </el-col>

    </el-row>
  </div>
</template>

<script>
export default {
  // 页面固定导航栏
  name: "AppNav",

  mounted() {
    // 看登录与否来控制导航栏和登录按钮的禁用与否
    let username = localStorage.getItem('username');
    let password = localStorage.getItem('password');
    if ((username === 'admin' || username === 'lihan') && password === '123123') {
      this.menuDisabled = false
      // 以下两句操作的是同一个链接
      this.loginBtnDisabled = true // 登录之后, "登录"链接内容变为"欢迎...", 且不允许点击这个链接
      this.elLinkText = '欢迎 ' + username
    } else {
      this.menuDisabled = true
      this.loginBtnDisabled = false
    }

    // AppNav组件想要LoginUser组件的username, 所以在这里绑定事件并指定回调
    this.$bus.$on('cancelDisabled', (username) => {
      // 因为用的箭头函数, 所以这里的this指向的是AppNav组件
      this.menuDisabled = false
      this.loginBtnDisabled = true
      this.elLinkText = '欢迎 ' + username
    })
  },
  beforeDestroy() {
    this.$bus.$off('cancelDisabled')
  },

  data() {
    return {
      menuDisabled: true, // 默认禁用导航栏
      elLinkText: '登录', // 默认显示"登录"
      loginBtnDisabled: false, // "登录"或"欢迎..."链接是否能点击
      logourl: require('../assets/logo.png'), // logo图片
    }
  },
  methods: {
    handleSelect(key, keyPath) {
      this.$router.push(key)
    },
    // 登出
    logout() {
      // 清除浏览器本地存储
      localStorage.removeItem('username')
      localStorage.removeItem('password')
      // 禁用导航栏等
      this.menuDisabled = true
      // 修改显示的用户状态
      this.loginBtnDisabled = false
      this.elLinkText = '登录'
      // 跳转到登录界面
      this.$router.push('/authenticate')
    },
    // 编程式路由, 有重复点击时控制台报错问题, 需要在路由文件中重写push方法处理一下
    auth() {
      this.$router.push('/authenticate')
    },
  }
}
</script>

<style scoped>
.auth {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #545c64;
}

.el-link.info {
  color: #fff;
  margin-left: 5px;
}

.el-link.info2 {
  color: rgb(184, 172, 172);
  font-size: 13px;
  margin-left: 10px;
}

.el-dropdown-menu {
  width: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.el-link.info:hover {
  color: #ffd04b;
}

.el-link.info2:hover {
  color: #ffd04b;
}

.el-link.info:active {
  color: #ffd04b;
}

.info1 {
  color: #545c64;
  border-color: #545c64;
}

.el-button.info1:hover {
  color: #ffd04b;
  border-color: #545c64;
}

.el-button.info1:active {
  color: #ffd04b;
  border-color: #545c64;
}

.el-icon .info1 {
  color: #545c64;
}

/*.item_color.el-menu-item.is-active {*/
/*  border-bottom: none;*/
/*}*/
</style>