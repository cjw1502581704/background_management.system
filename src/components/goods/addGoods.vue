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
                v-model="addForm.goods_cat"
                :options="goodCatList"
                :props=catProps></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane name='1' label="商品参数">
            <el-form-item :label='item.attr_name' v-for="item in manyParamsTag" :key="item.attr_id">
              <!--            动态参数复选框-->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="k" v-for="(k,i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane name='2' label="商品属性">
            <el-form-item :label='item.attr_name' v-for="item in onlyParamsDate" :key="item.attr_id">
              <!--           静态属性输入框-->
              <el-input v-model="item.attr_vals">
              </el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane name='3' label="商品图片">
            <!--             上传图片-->
            <el-upload
              :action="uploadAction"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :file-list="uploadPicFileList"
              list-type="picture" :headers="uploadPicHeader" :on-success="upPicSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane name='4' label="商品内容">
            <!--            富文本编辑器组件-->
            <quill-editor v-model="addForm.goods_introduce">
              <!--                          ref="myQuillEditor"-->
              <!--                          :options="editorOption"-->
              <!--                          @blur="onEditorBlur($event)"-->
              <!--                          @focus="onEditorFocus($event)"-->
              <!--                          @ready="onEditorReady($event)"-->

            </quill-editor>
            <!--            添加商品按钮-->
            <el-button type="primary" class="addBtn" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <el-dialog
        :visible.sync="pervImgDialogVisible"
        width="50%">
        <img class="prevImg" :src="prevImg"/>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
// 导入lodash
import _ from 'lodash'

export default {
  data () {
    return {
      // 步骤条进度
      activeIndex: '0',
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 选中的商品分类
        goods_cat: [],
        // 图片
        pics: [],
        // 详情
        goods_introduce: '',
        // 商品参数(数组)
        attrs: []
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
      // 商品动态参数
      manyParamsTag: [],
      // 商品静态属性
      onlyParamsDate: [],
      // 上传图片的目的地址
      uploadAction: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 上传的文件列表
      uploadPicFileList: [],
      // 上传图片头部
      uploadPicHeader: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片对话框
      pervImgDialogVisible: false,
      // 预览图片地址
      prevImg: ''
    }
  },
  methods: {
    async getGoodsCat () {
      const { data: res } = await this.$axios.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.goodCatList = res.data
    },
    // 切换tab前的验证
    tabLeave (activeName, oldActiveName) {
      // 必须选择商品分类，才能进入商品参数tab，否则参数无法获取
      if ((activeName === '1' || activeName === '2') && !this.cateId) {
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
        // vals转为数组格式
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length !== 0 ? item.attr_vals.split(' ') : []
        })
        this.manyParamsTag = res.data
      } else if (this.activeIndex === '2') {
        // 获取静态属性
        const { data: res } = await this.$axios.get(`categories/${this.cateId}/attributes`,
          { params: { sel: 'only' } })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.onlyParamsDate = res.data
      }
    },
    // 预览已上传文件
    handlePreview (prev) {
      this.prevImg = prev.response.data.url
      this.pervImgDialogVisible = true
    },
    // 移除已上传文件
    handleRemove (imgInfo) {
      // 比对要删除的和已上传的tmp_path,找到其索引
      const removeImg = imgInfo.response.data.tmp_path
      const i = this.addForm.pics.findIndex(item =>
        item.pic === removeImg
      )
      // 从暂存区中删除
      this.addForm.pics.splice(i, 1)
    },
    // 图片成功上传触发
    upPicSuccess (res) {
      const resInfo = { pic: res.data.tmp_path }
      this.addForm.pics.push(resInfo)
      console.log(this.addForm)
    },
    // 添加商品
    addGoods () {
      this.$refs.ruleFormRef.validate(async valid => {
        if (!valid) {
          // 表单验证，错误时
          return this.$message.error('请确认表单正确填写')
        }
        // 深拷贝出Form方便操作，并作为提交数据
        const Form = _.cloneDeep(this.addForm)
        // 商品分类goods_cat数组转为String
        Form.goods_cat = Form.goods_cat.join(',')
        // 商品动态参数处理
        this.manyParamsTag.forEach(item => {
          const manyDate = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          Form.attrs.push(manyDate)
        })
        // 商品静态属性处理
        this.onlyParamsDate.forEach(item => {
          const manyDate = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          Form.attrs.push(manyDate)
        })
        const { data: res } = await this.$axios.post('goods', Form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  },
  created () {
    this.getGoodsCat()
  },
  computed: {
    cateId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
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

  .el-checkbox {
    margin: 0 10px 0 0 !important;
  }

  .prevImg {
    width: 100%;
  }

  .addBtn {
    margin: 15px 0;
  }
</style>
