<template>
  <!--  home-->
  <el-container class="home_container">
    <!--    头部-->
    <el-header>
      <div>
        <img src="../assets/logo.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="primary" @click="logout">退出登录</el-button>
    </el-header>
    <el-container>
      <!--      侧边栏-->
      <el-aside :width="toggleCollapse?' 64px' : '200px '">
        <div class="togglecollapse" @click="toggleCollapse=!toggleCollapse">| | |</div>
        <!--        主菜单-->
        <el-menu
          :collapse="toggleCollapse"
          :collapse-transition="false"
          unique-opened
          class="el-menu-vertical-demo"
          @open="handleOpen"
          @close="handleClose"
          background-color="#333744"
          text-color="#fff"
          active-text-color="#490eff"
          router
        >
          <!--            一级菜单-->

          <el-submenu :index="item.id+''" v-for="item in Menulist" :key="item.id">
            <template slot="title">
              <!--              字体图标-->
              <i class="el-icon-location"></i>
              <!--              菜单文本-->
              <span>{{item.authName}}</span>
            </template>
            <!--            二级菜单-->
            <el-menu-item :index="'/'+subitem.path" v-for="subitem in item.children" :key="subitem.id">
              <!--                字体图标-->
              <i class="el-icon-menu"></i>
              <!--                2级菜单文本-->
              <span slot="title">{{subitem.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!--      主体区域-->
      <el-main>
<!--        路由占位符-->
        <router-view> </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'home',
  data () {
    return {
      toggleCollapse: false,
      Menulist: []
    }
  },
  created () {
    this.getMenuList()
  },
  methods: {
    // 退出登录
    logout () {
      // 清空token
      window.sessionStorage.clear()
      // 跳转到login
      this.$router.push('/login')
    },
    async getMenuList () {
      const { data: res } = await this.$axios.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.Menulist = res.data
    },
    // 侧边栏展开
    handleOpen (key, keyPath) {
      console.log(key, keyPath)
    },
    // 侧边栏收起
    handleClose (key, keyPath) {
      console.log(key, keyPath)
    }
  }
}
</script>

<style lang="less" scoped>
  .home_container {
    height: 100%;
  }

  .el-header {
    background: #373d41;
    font-size: 23px;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: space-between;

    span {
      position: relative;
      top: -20px;
    }

    img {
      height: 60px;
    }
  }

  .el-aside {
    background: #333744;

    .el-menu {
      border-right: none;
    }

    .togglecollapse {
      background: #4a5064;
      font-size: 10px;
      height: 20px;
      display: block;
      cursor: pointer;
      text-align: center;
      color: #ffffff;
    }
  }
  .el-main {
    background: #eaedf1;
  }
</style>
