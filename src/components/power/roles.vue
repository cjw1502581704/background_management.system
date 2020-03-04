<template>
  <div>
    <!--    面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--  内容卡片-->
    <el-card class="box-card">
      <!--      添加角色按钮 -----暂无功能-->
      <el-button type="primary">添加角色</el-button>
      <!--      角色列表-->
      <el-table
        :data="roleList" style="width: 100%" border stripe>
        <!--        展开 ，角色权限一览-->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!--            循环children得到一级权限，绑定的class用于添加tag的分割线-->
            <el-row :class="['bottom-line',i1===0?'top-line':'']"
                    :gutter="20" v-for="(item1, i1) in scope.row.children"
                    :key="item1.id" class="align-center">
              <!--            一级权限-->
              <el-col :span="6">
                <el-tag closable>
                  {{item1.authName}}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--            二级权限-->
              <el-col :span="18">
                <el-row :class="[i2!==0?'top-line':'']"
                        v-for="(item2, i2) in item1.children"
                        :key="item2.id" class="align-center">
                  <el-col :span="6">
                    <el-tag closable type="warning">
                      {{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!--                  三级权限-->
                  <el-col :span="18">
                    <el-tag closable type="danger"
                            v-for="item3 in item2.children"
                            :key="item3.id" @close="delItem3(scope.row,item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#">
        </el-table-column>
        <el-table-column prop="roleName" label="角色名称">
        </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述">
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <!--            编辑-->
            <el-button type="primary" icon="el-icon-edit" size="mini"
            ></el-button>
            <!--            删除-->
            <el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
            <!--            分配权限-->
            <el-tooltip class="item" effect="dark" content="分配权限" placement="top"
                        :enterable=false>
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="allotRights(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!--    分配角色，树状复选框-->
    <el-dialog
      title="分配角色"
      :visible.sync="allotRightsDialogVisible"
      width="30%"
      @close="rightsTreeClose">
      <!--      树状列表-->
      <el-tree :data="rightsTree"
               :props="rightsTreeProps"
               default-expand-all
               show-checkbox
               :default-checked-keys="treeKey"
               node-key="id"
               ref="rightsTreeRef"></el-tree>
      <!--      底部按钮-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="allotRightsDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="submitAllotRights">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'roles',
  data () {
    return {
      // 角色列表
      roleList: [],
      allotRightsDialogVisible: false,
      rightsTree: [],
      rightsTreeProps: {
        children: 'children',
        label: 'authName'
      },
      treeKey: [],
      checkedId: [],
      roleId: ''
    }
  },
  methods: {
    // 获取角色列表
    async getRoleList () {
      const { data: res } = await this.$axios.get('roles')
      this.roleList = res.data
    },
    // 删除用户权限确认
    delItem3 (role, rightsId) {
      this.$messagebox.confirm('此操作将删除该用户权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$axios.delete(
          `roles/${role.id}/rights/${rightsId}`)
        if (res.meta.status !== 200) {
          // 删除失败
          this.$message.error('删除失败')
        } else {
          this.$message.success('删除成功')
          // 给角色权限重新赋值，以达到视觉效果，刷新页面会导致下拉关闭
          role.children = res.data
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 分配角色，树状复选框
    async allotRights (role) {
      this.roleId = role.id
      // 打开对话框
      this.allotRightsDialogVisible = true
      // 发送请求，数据存入rightsTree
      const { data: res } = await this.$axios.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rightsTree = res.data
      // 将三级节点id存入this.treeKey
      this.getThreeRights(role, this.treeKey)
    },
    // 遍历权限列表，将三级权限存入数组
    getThreeRights (child, arr) {
      if (!child.children) {
        return arr.push(child.id)
      }
      child.children.forEach(item => {
        this.getThreeRights(item, arr)
      })
    },
    // 点击分配权限的确定
    async submitAllotRights () {
      this.checkedId = [...this.$refs.rightsTreeRef.getCheckedKeys(),
        ...this.$refs.rightsTreeRef.getHalfCheckedKeys()]
      // 转为，分割字符串
      const idStr = this.checkedId.join(',')
      // 发送请求
      const { data: res } = await this.$axios.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        this.$message.error('更新失败')
      } else {
        this.$message.success('更新成功')
        this.getRoleList()
      }
      this.allotRightsDialogVisible = false
    },
    // 清空默认勾选暂存区
    rightsTreeClose () {
      this.treeKey = []
    }
  },
  created () {
    this.getRoleList()
  }
}
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 10px;
  }

  .top-line {
    border-top: 1px solid #dddddd;
  }

  .bottom-line {
    border-bottom: 1px solid #dddddd;
  }

  .align-center {
    display: flex;
    align-items: center;
  }
</style>
