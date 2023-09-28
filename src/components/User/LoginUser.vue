<template>
  <div>
    <h3 align="center">用户登录</h3>

    <el-form @submit.native.prevent>
      <el-form-item label="用户名:">
        <el-input v-model="username" size="small"></el-input>
      </el-form-item>

      <el-form-item label="密码:" prop="pass">
        <el-input type="password" v-model="password" autocomplete="off" size="small"></el-input>
      </el-form-item>

      <el-form-item align="right">
        <el-button class="but_color" native-type="submit" @click="login" size="small">登录</el-button>
      </el-form-item>
    </el-form>

  </div>
</template>

<script>
  export default {
    // 登录组件
    name: "LoginUser",
    data() {
      return {
        username: '',
        password: '',
      }
    },
    methods: {
      login() {
        if ((this.username == 'admin' || this.username == 'lihan') && this.password == '123123') {
          // 存储到浏览器本地，之后访问页面之前都要判断
          localStorage.setItem('username', this.username)
          localStorage.setItem('password', '123123')

          // 登陆后默认去首页
          this.$router.push({name: 'Stocks'})

          // 取消导航栏禁用（使用全局事件总线来实现）
          this.$bus.$emit('cancelDisabled', this.username)
        } else {
          this.$message.error('用户名或密码错误');
        }
      }
    }
  }
</script>

<style scoped>
  .but_color {
    color: #545c64;
    border-color: #dadbdc;
    background-color: #fff;
  }

  .el-button.but_color:hover {
    border-color: #dadbdc;
    background-color: #F5F5F5;
  }

  .el-button.but_color:active {
    border-color: #dadbdc;
    background-color: #F5F5F5;
  }
</style>