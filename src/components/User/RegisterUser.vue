<template>
  <div>
    <h3 align="center">用户注册</h3>

    <el-form :rules="rules" status-icon :model="ruleForm" ref="ruleForm">
      <p v-if="status === 400">
        Invalid registry.
      </p>

      <el-form-item label="用户名:">
        <el-input v-model="ruleForm.username" size="small"></el-input>
      </el-form-item>

      <el-form-item label="密码:" prop="pass">
        <el-input type="password" v-model="ruleForm.pass" autocomplete="off" size="small"></el-input>
      </el-form-item>

      <el-form-item label="确认密码:" prop="checkPass">
        <el-input type="password" v-model="ruleForm.checkPass" autocomplete="off" size="small"></el-input>
      </el-form-item>

      <el-form-item align="right">
        <el-button class="but_color" @click="registry('ruleForm')" size="small">提交</el-button>
      </el-form-item>

    </el-form>
  </div>
</template>

<script>
export default {
  // 注册组件
  name: "RegisterUser",
  data() {
    let validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'));
      } else {
        if (this.ruleForm.checkPass !== '') {
          this.$refs.ruleForm.validateField('checkPass');
        }
        callback();
      }
    };
    let validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.ruleForm.pass) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    return {
      ruleForm: {
        username: '',
        pass: '',
        checkPass: '',
        age: ''
      },
      status: null,
      rules: {
        pass: [
          {validator: validatePass, trigger: 'blur'}
        ],
        checkPass: [
          {validator: validatePass2, trigger: 'blur'}
        ],
      },
    }
  },
  methods: {
    registry(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          alert('submit!');
          this.$store.dispatch('registry', {
            username: this.ruleForm.username,
            password: this.ruleForm.pass
          }).then(() => {
            this.$router.push({name: 'Test'})
          }).catch(err => {
            this.status = err.response.status
          })
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
  }
}
</script>

<style scoped>
.but_color{
  color: #545c64;
  border-color:#dadbdc;
  background-color: #fff;
}
.el-button.but_color:hover{
  border-color: #dadbdc;
  background-color: #F5F5F5;
}
.el-button.but_color:active{
  border-color: #dadbdc;
  background-color: #F5F5F5;
}
</style>
