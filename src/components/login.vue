<template>
  <!--  登陆组件-->
  <div class="login_container">
    <!--    登陆框-->
    <div class="login_box">
      <!--      头像-->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!--      表单域-->
        <el-form :model="form" label-width="0px" class="login_form"
                 :rules="loginFormRules" ref="loginFormRef">
<!--          用户名输入框-->
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              prefix-icon="iconfont icon-icon-test8">
            </el-input>
          </el-form-item>
<!--          密码输入框-->
          <el-form-item prop="password">
            <el-input
              type="password"
              v-model="form.password"
              prefix-icon="iconfont icon-icon-test3">
            </el-input>
          </el-form-item>
<!--            按钮-->
          <el-form-item>
            <el-button type="primary" @click="login">登录</el-button>
            <el-button type="info" @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
  </div>
</template>

<script>
export default {
  name: 'login',
  data () {
    return {
      form: {
        username: '',
        password: ''
      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 6, message: '长度在 2 到 6 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetForm () {
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return null
        const { data: res } = await this.$axios.post('login', this.form)
        if (res.meta.status !== 200) return this.$message.error('登陆失败')
        this.$message.success('登陆成功')
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .login_container {
    background: #2b4b6b;
    height: 100%;
  }

  .login_box {
    width: 450px;
    height: 300px;
    background: #ffffff;
    border-radius: 5px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .avatar_box {
      height: 130px;
      width: 130px;
      border-radius: 50%;
      border: 1px solid #eeeeee;
      background: #ffffff;
      box-shadow: 0 0 10px #dddddd;
      padding: 10px;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);

      img {
        border-radius: 50%;
        width: 100%;
        height: 100%;
        border: 1px solid #eeeeee;
      }
    }
  }
  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 20px;
    box-sizing: border-box;
    button {
      float: right;
      margin-left: 10px;
    }
  }
</style>
