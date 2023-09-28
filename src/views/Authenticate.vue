<template>
  <div class="auth">
    <component :is="loginOrRegister" />

    <!-- 暂时无注册功能 -->
    <!-- <a v-show="isNewUser" class="auth-link" @click="toggleComponent">还没有账户？注册</a>
    <a v-show="!isNewUser" class="auth-link" @click="toggleComponent">已经有账户？登录</a> -->
  </div>
</template>

<script>
  import RegisterUser from "@/components/User/RegisterUser";
  import LoginUser from "@/components/User/LoginUser";

  export default {
    // 用户
    name: "Authenticate",
    components: {
      RegisterUser,
      LoginUser
    },
    computed: {
      // 由vuex管理LoginUser组件和RegisterUser组件的公共数据
      isNewUser() {
        return this.$store.state.isNewUser // 初始值为true, 显示LoginUser组件
      },
      // 决定此处显示LoginUser组件或RegisterUser组件
      loginOrRegister() {
        return this.isNewUser ? 'LoginUser' : 'RegisterUser'
      }
    },
    methods: {
      // 切换LoginUser组件和RegisterUser组件
      toggleComponent() {
        this.$store.dispatch('isNewUser', !this.isNewUser)
      }
    }
  }
</script>

<style scoped>
  .auth-link {
    font-size: 0.8em;
    text-decoration: underline;
    color: #2c3e50;
    cursor: pointer;
  }

  .auth {
    display: flex;
    flex-direction: column;
    align-items: center;

  }
</style>