<template>
  <div>
    <el-button type="primary" @click="logout">退出登录</el-button>
  </div>
</template>

<script>
export default {
  name: 'home',
  data () {
  },
  methods: {
    // 退出登录
    logout () {
      // 清空token
      window.sessionStorage.clear()
      // 跳转到login
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped>
</style>
