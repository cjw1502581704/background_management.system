<template>
  <div>
    <!--    面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--    内容卡片-->
    <el-card class="box-card">
      <!--      添加、搜索用户输入框-->
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input placeholder="请输入搜索内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="goAddGoods">添加商品</el-button>
        </el-col>
      </el-row>
      <!--      用户列表表格-->
      <el-table
        :data="goodsList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#">
        </el-table-column>
        <el-table-column label="商品名称" prop="goods_name">
        </el-table-column>
        <el-table-column label="商品价格（元）" prop="goods_price" width="90">
        </el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="90">
        </el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="110">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template slot-scope="scope">
            <!--            编辑-->
            <el-button type="primary" icon="el-icon-edit" size="mini"
                       @click="editForm(scope.row)"></el-button>
            <!--            删除-->
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="delConfirm(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--      分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 15, 20, 50]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="queryInfo.total">
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 15,
        total: 926
      },
      goodsList: []
    }
  },
  methods: {
    async getGoodsList () {
      const { data: res } = await this.$axios.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.goodsList = res.data.goods
      this.queryInfo.total = res.data.total
    },
    // 页面显示条数变化
    handleSizeChange (nowsize) {
      this.queryInfo.pagesize = nowsize
      this.getGoodsList()
    },
    // 当前记录页数变化
    handleCurrentChange (nowpage) {
      this.queryInfo.pagenum = nowpage
      this.getGoodsList()
    },
    // 删除商品确认框
    delConfirm (row) {
      this.$messagebox.confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        // 确认删除
        const { data: res } = await this.$axios.delete(`goods/${row.goods_id}`)
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('删除商品失败')
        }
        this.getGoodsList()
        this.$message.success('删除商品成功')
      }).catch(() => {
        // 取消删除
        this.$message.info('已取消删除')
      })
    },
    // 添加商品
    goAddGoods () {
      this.$router.push('goods/add')
    }
  },
  created () {
    this.getGoodsList()
  }
}
</script>

<style lang="less" scoped>
</style>
