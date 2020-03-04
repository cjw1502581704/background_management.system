<template>
  <div>
    <!--    面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--  内容卡片-->
    <el-card class="box-card">
      <!--      添加、搜索用户输入框-->
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input placeholder="请输入搜索内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="addFormVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!--      用户列表表格-->
      <el-table
        :data="usersList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#">
        </el-table-column>
        <el-table-column prop="username" label="姓名">
        </el-table-column>
        <el-table-column prop="mobile" label="电话">
        </el-table-column>
        <el-table-column prop="email" label="邮箱">
        </el-table-column>
        <el-table-column prop="role_name" label="角色">
        </el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state" @change="userStateChange(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <!--        用户操作按钮-->
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <!--            修改信息-->
            <el-button type="primary" icon="el-icon-edit" size="mini"
                       @click="editForm(scope.row)"></el-button>
            <!--            删除用户-->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="delConfirm(scope.row)"></el-button>
            <!--            分配角色-->
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top"
                        :enterable=false>
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="allotRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--      分配角色对话框-->
      <el-dialog
        title="提示"
        :visible.sync="allotRoledialogVisible"
        width="30%" @close="allotRoleClose">
        <div>
          <p>当前的用户：{{allotRoleInfo.username}}</p>
          <p>当前的角色：{{allotRoleInfo.role_name}}</p>
          <p>分配新角色：
            <el-select v-model="selectedRole" placeholder="请选择角色">
              <el-option
                v-for="item in rolesList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id">
              </el-option>
            </el-select>
          </p>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="allotRoledialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="setAllotRole">确 定</el-button>
        </span>
      </el-dialog>
      <!--      表格下方分页管理-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!--    添加、用户对话框表单-->
    <el-dialog title="添加用户" :visible.sync="addFormVisible" @close="addUserFormClose">
      <el-form :model="addUserForm" :rules="addUserRules" ref="adduserForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </div>
    </el-dialog>
    <!--    修改用户信息对话框-->
    <el-dialog title="修改用户" :visible.sync="editFormVisible" @close="editUserFormClose">
      <el-form :model="editUserForm" :rules="editUserRules" ref="edituserForm" label-width="100px"
               class="demo-ruleForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </div>
    </el-dialog>
  </div>

</template>

<script>
export default {
  name: 'user',
  data () {
    // 邮箱验证规则
    var checkEmail = (rule, value, cb) => {
      const regEmail =
        /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    // 手机号验证规则
    var checkMobile = (rule, value, cb) => {
      const regMobile =
        /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        // 合法
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      usersList: [],
      total: 0,
      // 添加用户对话框
      addFormVisible: false,
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 修改用户对话框
      editFormVisible: false,
      editUserForm: {
        id: '',
        username: '',
        email: '',
        mobile: ''
      },
      // 添加用户表单的验证规则
      addUserRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      editUserRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制分配角色对话框
      allotRoledialogVisible: false,
      allotRoleInfo: {},
      rolesList: [],
      selectedRole: ''
    }
  },
  methods: {
    // 分配角色对话框关闭
    allotRoleClose () {
      // 重置选项
      this.selectedRole = ''
    },
    // 设置角色分配
    async setAllotRole () {
      const { data: res } = await this.$axios.put(`users/${this.allotRoleInfo.id}/role`, { rid: this.selectedRole })
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg)
      } else {
        this.$message.success(res.meta.msg)
        this.getUserList()
        this.allotRoledialogVisible = false
      }
    },
    // 分配角色对话框
    async allotRole (userInfo) {
      this.allotRoledialogVisible = true
      this.allotRoleInfo = userInfo
      // 请求角色列表
      const { data: res } = await this.$axios.get('roles')
      this.rolesList = res.data
    },
    // 获取用户列表
    async getUserList () {
      const { data: res } = await this.$axios.get('users',
        { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取用户列表失败')
      this.usersList = res.data.users
      this.total = res.data.total
    },
    // 更新用户状态
    async userStateChange (userinfo) {
      const { data: res } = await this.$axios.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('用户状态更新失败')
      } else {
        this.$message.success('用户状态更新成功')
      }
    },

    // 每页显示记录数
    handleSizeChange (nowsize) {
      this.queryInfo.pagesize = nowsize
      this.getUserList()
    },
    // 当前页数
    handleCurrentChange (nowpage) {
      this.queryInfo.pagenum = nowpage
      this.getUserList()
    },
    // 关闭用户添加窗口
    addUserFormClose () {
      this.$refs.adduserForm.resetFields()
    },
    // 添加用户
    addUser () {
      this.$refs.adduserForm.validate(async valid => {
        if (!valid) {
          // 不合法时
          return this.$message.error('提交失败，数据不合法')
        }
        // 合法时
        const { data: res } = await this.$axios.post('users', this.addUserForm)
        // 错误的情况
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        } else {
          this.$message.success('添加用户成功')
        }
        this.addFormVisible = false
        this.getUserList()
      })
    },

    // 点击修改按钮
    async editForm (userInfo) {
      // 显示修改对话框
      this.editFormVisible = true
      // 向服务器请求被修改用户的信息，渲染至修改对话框中
      const { data: res } = await this.$axios.get('users/' + userInfo.id)
      this.editUserForm.username = res.data.username
      this.editUserForm.email = res.data.email
      this.editUserForm.mobile = res.data.mobile
      // 存下当前用户id
      this.editUserForm.id = userInfo.id
    },
    // 提交修改信息
    editUser () {
      this.$refs.edituserForm.validate(async valid => {
        if (!valid) {
          // 不合法时
          return this.$message.error('提交失败，数据不合法')
        }
        // 合法时
        const res = await this.$axios.put('users/' + this.editUserForm.id, {
          email: this.editUserForm.email, mobile: this.editUserForm.mobile
        })
        if (res.status !== 200) {
          this.$message.error('更新失败')
        } else {
          this.$message.success('更新成功')
        }
        this.getUserList()
        this.editFormVisible = false
      })
    },
    // 关闭时重置表单和校验
    editUserFormClose () {
      this.$refs.edituserForm.resetFields()
    },
    // 删除确认
    delConfirm (userInfo) {
      this.$messagebox.confirm('此操作将删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        this.$message({ type: 'success', message: '删除成功!' })
        const { data: res } = await this.$axios.delete('users/' + userInfo.id)
        if (res.meta.status !== 200) {
          // 删除失败
          this.$message.error('删除失败')
        } else {
          this.$message.success('删除成功')
        }
        this.getUserList()
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  },
  created () {
    this.getUserList()
  }
}
</script>

<style lang="less" scoped>
</style>
