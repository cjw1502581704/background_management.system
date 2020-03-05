<template>
  <div>
    <!--    面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <!--      添加分类按钮-->
      <el-row :gutter="20">
        <el-col :span="6">
          <el-button type="primary" @click="showAddCate">添加分类</el-button>
        </el-col>
      </el-row>
      <!--      表格-->
      <tree-table class="treeTable" :data="catelist" :columns="columns" :selection-type="false" :expand-type="false"
                  show-index
                  index-text="#" border :show-row-hover="false">
        <!--        是否有效-->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted===false" style="color: limegreen"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!--        排序-->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level===0" size="mini">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level===1" type="success" size="mini">二级</el-tag>
          <el-tag v-else type="warning" size="mini">三级</el-tag>
        </template>
        <!--        操作按钮-->
        <template slot="opt">
          <el-button type="primary" size='mini' icon="el-icon-edit">编辑</el-button>
          <el-button type="danger" size='mini' icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
      <!--      分页-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!--    添加分类-->
    <el-dialog
      title="添加分类"
      :visible.sync="addCatedialogVisible"
      width="50%" @close="addCateClose">
      <!--      添加分类表单-->
      <el-form :model="addCateForm" :rules="addCateRuleForm" ref="addCateRuleForm" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectKey"
            :options="parentsCateList"
            :props="cascaderProps"
            @change="addCateChange"
            clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addCatedialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类数据列表，
      catelist: [],
      // 数据条数
      total: 0,
      // 列定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 当前列定义为模板列
          type: 'template',
          // 模板名isok
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      addCatedialogVisible: false,
      addCateForm: {
        cat_name: '',
        // 分类父id
        cat_pid: 0,
        cat_level: 0
      },
      addCateRuleForm: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 添加分类的父级列表
      parentsCateList: [],
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      // 选中的父级分类的id
      selectKey: []
    }
  },
  methods: {
    // 选中项变化时
    addCateChange () {
      this.addCateForm.cat_pid = this.selectKey[this.selectKey.length - 1]
      this.addCateForm.cat_level = this.selectKey.length
    },
    // 确定添加分类
    addCate () {
      // 表单域验证
      this.$refs.addCateRuleForm.validate(async valid => {
        if (!valid) {
          // 表单合数据不合法时
          return this.$message.error('添加失败，数据不合法')
        }
        // 表单合数据合法时
        const { data: res } = await this.$axios.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.addCatedialogVisible = false
        this.getCateList()
      })
    },
    // 对话框关闭时清空表单
    addCateClose () {
      this.selectKey = []
      this.addCateForm.cat_name = ''
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 点击添加分类按钮
    showAddCate () {
      this.getParentCateList()
      this.addCatedialogVisible = true
    },
    // 当前页
    handleCurrentChange (nowPage) {
      this.queryInfo.pagenum = nowPage
      this.getCateList()
    },
    // 每页显示记录数
    handleSizeChange (nowSize) {
      this.queryInfo.pagesize = nowSize
      this.getCateList()
    },
    // 载入页面
    async getCateList () {
      const { data: res } = await this.$axios.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        // 失败时
        return this.$message.error('数据获取失败')
      }
      // 成功时
      this.catelist = res.data.result
      this.total = res.data.total
    },
    // 获取父级分类
    async getParentCateList () {
      const { data: res } = await this.$axios.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$messages.error('获取父级菜单失败')
      }
      this.parentsCateList = res.data
    }
  },
  created () {
    this.getCateList()
  }
}
</script>

<style lang="less" scoped>
  .treeTable {
    margin: 15px 0;
  }

  .el-cascader {
    width: 100%;
  }
</style>
