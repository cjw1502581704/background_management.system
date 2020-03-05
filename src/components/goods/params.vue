<template>
  <div>
    <!--    面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--    卡片视图-->
    <el-card>
      <!--      头部提示信息-->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数"
        type="warning" :closable="false" show-icon>
      </el-alert>
      <!--      选择商品分类-->
      <el-row class="mar15">
        <el-col>
          <span>选择商品分类：</span>
          <!--          商品分类级联框-->
          <el-cascader
            v-model="selectedKey"
            :options="catelist"
            :props="cateListProps"
            clearable
            @change="cateCascaderChange"></el-cascader>
        </el-col>
      </el-row>
      <!--      tab标签页-->
      <el-tabs v-model="tabActiveName" @tab-click="TabClick">
        <!--        Tab-动态参数-->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="addBtnDisabled" @click="addParamsDialogVisible=true">添加参数
          </el-button>
          <!--          动态参数表格-->
          <el-table
            :data="tabData"
            stripe border
            style="width: 100%">
            <!--            展开列-->
            <el-table-column
              type="expand"
              width="80">
            </el-table-column>
            <!--            参数列-->
            <el-table-column
              type="index"
              label="#"
              width="80">
            </el-table-column>
            <el-table-column
              prop="attr_name"
              label="参数名称">
            </el-table-column>
            <el-table-column
              label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row)">编辑
                </el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="delParams(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!--        Tab-静态属性-->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="addBtnDisabled" @click="addParamsDialogVisible=true">添加属性
          </el-button>
          <!--          静态属性表格-->
          <el-table
            :data="tabData"
            stripe border
            style="width: 100%">
            <!--            展开列-->
            <el-table-column
              type="expand"
              width="80">
            </el-table-column>
            <!--            排序列-->
            <el-table-column
              type="index"
              label="#"
              width="80">
            </el-table-column>
            <el-table-column
              prop="attr_name"
              label="属性名称">
            </el-table-column>
            <el-table-column
              label="操作">
              <template slot-scope="scope">
                <el-button type="primary" size="mini" icon="el-icon-edit" @click="showEditDialog(scope.row)">编辑
                </el-button>
                <el-button type="danger" size="mini" icon="el-icon-delete" @click="delParams(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!--    添加参数/属性对话框-->
    <el-dialog
      :title="'添加'+ParamsDialogTitle"
      :visible.sync="addParamsDialogVisible"
      width="50%" @close="addParamsDialogClose" ref="addParamsDialogRef">
      <!--      输入框-->
      <el-form :model="addParams" :rules="addParamsRules" ref="addParamsFormRef" label-width="100px">
        <el-form-item :label="'添加'+ParamsDialogTitle" prop="attr_name">
          <el-input v-model="addParams.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!--      footer-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="addParamsDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="setAddParams">确 定</el-button>
  </span>
    </el-dialog>
    <!--    修改参数/属性对话框-->
    <el-dialog
      :title="'修改'+ParamsDialogTitle"
      :visible.sync="editParamsDialogVisible"
      width="50%" @close="editParamsDialogClose" ref="editParamsDialogRef">
      <!--      输入框-->
      <el-form :model="editParams" :rules="editParamsRules" ref="editParamsFormRef" label-width="100px">
        <el-form-item :label="'修改'+ParamsDialogTitle" prop="attr_name">
          <el-input v-model="editParams.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <!--      footer-->
      <span slot="footer" class="dialog-footer">
    <el-button @click="editParamsDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="setEditParams">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类列表
      catelist: [],
      // 级联选框props属性
      cateListProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 存放选择的商品分类的id
      selectedKey: [],
      // 选中的tab的name
      tabActiveName: 'many',
      tabData: [],
      // 控制添加参数/属性对话框
      addParamsDialogVisible: false,
      editParamsDialogVisible: false,
      // 添加参数/属性数据源
      addParams: {
        attr_name: ''
      },
      editParams: {
        attr_name: ''
      },
      addParamsRules: {
        attr_name: [
          { required: true, message: '名称不可为空', trigger: 'blur' }
        ]
      },
      editParamsRules: {
        attr_name: [
          { required: true, message: '名称不可为空', trigger: 'blur' }
        ]
      },
      // 修改参数/属性时暂存的scope.row,
      paramsInfo: {}
    }
  },
  methods: {
    // 点击/切换tab时获取tab数据
    TabClick () {
      this.getTabData()
    },
    // 选择分类时获取tab数据
    cateCascaderChange () {
      this.getTabData()
    },
    // 获取tab数据
    async getTabData () {
      const { data: res } = await this.$axios.get(`categories/${this.selectedKey[2]}/attributes`, { params: { sel: this.tabActiveName } })
      if (res.meta.status !== 200) {
        this.$message.error('获取数据失败')
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals.split(' ')
      })
      console.log(res.data)
      this.tabData = res.data
    },
    // 载入商品分类
    async getCateList () {
      const { data: res } = await this.$axios.get('categories')
      if (res.meta.status !== 200) {
        // 失败时
        return this.$message.error('数据获取失败')
      }
      // 成功时
      this.catelist = res.data
    },
    // 添加对话框关闭时
    addParamsDialogClose () {
      this.$refs.addParamsFormRef.resetFields()
    },
    // 修改对话框关闭时
    editParamsDialogClose () {
      // 清空暂存scope
      this.paramsInfo = {}
      this.$refs.editParamsFormRef.resetFields()
    },
    // 提交添加
    setAddParams () {
      this.$refs.addParamsFormRef.validate(async valid => {
        if (!valid) {
          // 表单校验失败
          return this.$message.error('添加失败，数据不合法')
        } else {
          // 表单校验成功
          this.addParamsDialogVisible = false
          const { data: res } = await this.$axios.post(`categories/${this.selectedKey[2]}/attributes`, {
            attr_name: this.addParams.attr_name,
            attr_sel: this.tabActiveName
          })
          if (res.meta.status !== 201) {
            return this.$message.error('添加失败')
          }
          this.$message.success('添加成功')
          this.getTabData()
        }
      })
    },
    // 点击编辑按钮，获取编辑内容
    async showEditDialog (attr) {
      this.paramsInfo = attr
      const { data: res } = await this.$axios.get(`categories/${this.selectedKey[2]}/attributes/${attr.attr_id}`, { params: { attr_sel: this.tabActiveName } })
      if (res.meta.status !== 200) {
        return this.$axios.error('获取数据失败')
      }
      this.editParams.attr_name = res.data.attr_name
      this.editParamsDialogVisible = true
    },
    // 提交修改
    async setEditParams () {
      const { data: res } = await this.$axios.put(`categories/${this.selectedKey[2]}/attributes/${this.paramsInfo.attr_id}`, {
        attr_name: this.editParams.attr_name,
        attr_sel: this.tabActiveName
      })
      if (res.meta.status !== 200) {
        return this.$message.error('修改数据失败')
      }
      this.getTabData()
      console.log(res)
      this.editParamsDialogVisible = false
    },
    // 删除参数
    async delParams (attr) {
      const confirmResult = await this.$messagebox.confirm('确认删除此参数？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$axios.delete(`categories/${this.selectedKey[2]}/attributes/${attr.attr_id}`)
      if (res.meta.status !== 200) {
        this.$message.error('删除失败')
      }
      this.getTabData()
      this.$message.success('删除成功！')
    }
  },
  created () {
    this.getCateList()
  },
  computed: {
    // 控制添加按钮在不选择商品分类时禁用
    addBtnDisabled () {
      if (this.selectedKey.length === 3) {
        return false
      } else {
        return true
      }
    },
    ParamsDialogTitle () {
      if (this.tabActiveName === 'many') {
        return '参数'
      } else {
        return '属性'
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .mar15 {
    margin: 15px 0;
  }
</style>
