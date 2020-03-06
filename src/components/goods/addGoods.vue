<template>
  <div>
    <!--    面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!--  内容卡片-->
    <el-card class="box-card">
      <!--          提示信息-->
      <el-alert
        title="添加商品信息"
        type="info"
        center :closable="false"
        show-icon>
      </el-alert>
      <!--          步骤条-->
      <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!--      表单-->
      <el-form :model="addForm" :rules="addFormRules" ref="ruleFormRef" label-position="top" label-width="100px">
        <!--      Tab栏-->
        <el-tabs v-model="activeIndex" tab-position="left" @tab-click="tabClick" :before-leave="tabLeave">
          <el-tab-pane name='0' label="基本信息">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price" type="number">
              <el-input v-model.number="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model.number="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model.number="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="selectedCatList"
                :options="goodCatList"
                :props=catProps></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane name='1' label="商品参数">商品参数</el-tab-pane>
          <el-tab-pane name='2' label="商品属性">商品属性</el-tab-pane>
          <el-tab-pane name='3' label="商品图片">商品图片</el-tab-pane>
          <el-tab-pane name='4' label="商品内容">商品内容</el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 步骤条进度
      activeIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { type: 'number', message: '必须为数字值' },
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { type: 'number', message: '必须为数字值' },
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { type: 'number', message: '必须为数字值' },
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类prop
      catProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 所有商品分类列表
      goodCatList: [],
      // 选中的商品分类
      selectedCatList: [],
      // 商品参数
      manyParamsTag: []
    }
  },
  methods: {
    async getGoodsCat () {
      const { data: res } = await this.$axios.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.goodCatList = res.data
      console.log(res)
    },
    // 切换tab前的验证
    tabLeave (activeName, oldActiveName) {
      // 必须选择商品分类，才能进入商品参数tab，否则参数无法获取
      if (activeName === '1' && !this.cateId) {
        this.$message.info('请先选择商品分类')
        return false
      }
    },
    // tab标签选中时
    async tabClick () {
      // 进入商品价格tab时
      if (this.activeIndex === '1') {
        // 获取动态参数，tag
        const { data: res } = await this.$axios.get(`categories/${this.cateId}/attributes`,
          { params: { sel: 'many' } })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.manyParamsTag = res.data
        console.log(res)
      }
    }
  },
  created () {
    this.getGoodsCat()
  },
  computed: {
    cateId () {
      if (this.selectedCatList.length === 3) {
        return this.selectedCatList[2]
      } else {
        return null
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .el-step__title {
    font-size: 14px;
  }
</style>
