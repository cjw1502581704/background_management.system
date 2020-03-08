<template>
  <div>
    <!--    面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--  内容卡片-->
    <el-card class="box-card">
      <!--      添加、搜索用户输入框-->
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input placeholder="请输入搜索内容" v-model="queryInfo.query" clearable @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!--      订单列表表格-->
      <el-table
        :data="orderList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#">
        </el-table-column>
        <el-table-column label="订单编号" prop="order_number">
        </el-table-column>
        <el-table-column label="订单价格" prop="order_price">
        </el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status==='1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send">
          <!--          <template slot-scope="scope">-->
          <!--            {{scope.row.is_send}}-->
          <!--          </template>-->
        </el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="addressDialogVisible=true">
            </el-button>
            <el-button type="success" size="mini" icon="el-icon-location" @click="showExpress">
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--      分页-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!--    修改订单地址-->
    <el-dialog
      title="修改订单地址"
      :visible.sync="addressDialogVisible"
      width="50%" @close="setAddressClose">
      <el-form :model="address" :rules="addressRules" ref="addressRef" label-width="100px">
        <!--            省市区级联选择-->
        <el-form-item label="省/市/区" prop="address1">
          <el-cascader
            v-model="address.address1"
            :options="CityData"
            :props="addressProp"></el-cascader>
        </el-form-item>
        <!--      详细地址-->
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="address.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addressDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
  </span>
    </el-dialog>
    <!--    查看物流信息-->
    <el-dialog
      title="物流信息"
      :visible.sync="expressDialogVisible"
      width="50%">
      <!--      时间线-->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in expressInfo"
          :key="index"
          :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
    <el-button @click="expressDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="expressDialogVisible = false">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
// 省市区列表
import CityData from './citydata'

export default {
  data () {
    return {
      // 请求订单参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 订单总数
      total: 0,
      // 订单列表
      orderList: [],
      CityData,
      // 修改订单地址对话框
      addressDialogVisible: false,
      // 订单地址
      address: {
        address1: [],
        address2: ''
      },
      // 省市区级联选框prop
      addressProp: {
        expandTrigger: 'hover',
        value: 'value',
        label: 'label',
        children: 'children'
      },
      // 订单地址表单规则
      addressRules: {
        address1: [
          { required: true, message: '请选择地区', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      // 物流信息对话框
      expressDialogVisible: false,
      // 物流信息
      expressInfo: {}
    }
  },
  methods: {
    async getOrderList () {
      const { data: res } = await this.$axios.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败')
      }
      this.total = res.data.total
      this.orderList = res.data.goods
    },
    // 页面显示数改变
    handleSizeChange (nowsize) {
      this.queryInfo.pagesize = nowsize
      this.getOrderList()
    },
    // 当前页码改变
    handleCurrentChange (nowpage) {
      this.queryInfo.pagenum = nowpage
      this.getOrderList()
    },
    // 修改订单地址对话框关闭
    setAddressClose () {
      this.$refs.addressRef.resetFields()
    },
    // 查看物流进度
    async showExpress () {
      const { data: res } = await this.$axios.get('/kuaidi/804909574412544580')
      if (res.meta.status !== 200) {
        return this.$message.error('获取物流信息失败')
      }
      this.expressInfo = res.data
      this.expressDialogVisible = true
      console.log(this.expressInfo)
    }
  },
  created () {
    this.getOrderList()
  }
}
</script>

<style lang="less" scoped>
  .el-cascader {
    width: 100%;
  }
</style>
