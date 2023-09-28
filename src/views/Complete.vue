<template>
  <div class="block">
    <el-divider content-position="left"><i class="el-icon-magic-stick"></i><span class="font">历史详情</span>
    </el-divider>
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input class="input_style" @input="searchStockByKeyword" v-model="search" clearable
            @clear="searchStockByKeyword" placeholder="输入股票代码或名称">
            <el-button slot="append" icon="el-icon-search" @click="searchStockByKeyword"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <el-table :data="historyStockFilter" style="font-size: 13px;" :header-cell-style="{color:'#545c64'}">
        <el-table-column prop="code" label="股票代码" align="center">
        </el-table-column>
        <el-table-column prop="name" label="股票名称" align="center">
        </el-table-column>
        <el-table-column prop="price" label="实时价格" align="center">
        </el-table-column>
        <el-table-column prop="state" label="订单状态" align="center">
          <template #default="scope">
            <span style="color: red;">已卖出</span>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="买入数量" align="center">
        </el-table-column>

        <el-table-column prop="created_time" label="加入观望时间" align="center">
          <template #default="scope">
            {{getTimeStr(scope.row.created_time)}}
          </template>
        </el-table-column>

        <el-table-column prop="updated_time" label="卖出时间" align="center">
          <template #default="scope">
            {{getTimeStr(scope.row.updated_time)}}
          </template>
        </el-table-column>

        <el-table-column prop="buy_price" label="成交价格" align="center">
        </el-table-column>
        <el-table-column prop="sell_price" label="卖出价格" align="center">
        </el-table-column>

        <el-table-column prop="buy_percent" label="买入策略" align="center">
          <template #default="scope">
            <span v-if="scope.row.buy_percent==1">价格</span>
            <span v-else-if="scope.row.buy_percent==2">百分比</span>
            <span v-else>双均线</span>
          </template>
        </el-table-column>

        <el-table-column prop="stra_param_buy" label="买入条件" align="center">
          <template #default="scope">
            {{getCondition(scope.row,'buy')}}
          </template>
        </el-table-column>

        <el-table-column prop="sell_percent" label="卖出策略" align="center">
          <template #default="scope">
            <span v-if="scope.row.sell_percent==1">价格</span>
            <span v-else-if="scope.row.sell_percent==2">百分比</span>
            <span v-else>双均线</span>
          </template>
        </el-table-column>

        <el-table-column prop="stra_param_sell" label="卖出条件" align="center">
          <template #default="scope">
            {{getCondition(scope.row,'sell')}}
          </template>
        </el-table-column>
      </el-table>

      <el-pagination class="topPadding" @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="currentPage" :page-sizes="[5, 100, 200, 400]" :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper" :total="historyStockFilter.length">
        >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
  import {
    getPositionHasBuy
  } from "@/network/stocks";
  import {
    getTimeStrOut,
    getConditionOut
  } from "@/common/utils";
  export default {
    name: "Complete",
    data() {
      return {
        currentPage: 1,
        pageSize: 5,
        search: '',
        historyStock: [],
        historyStockFilter: [],
      }
    },
    methods: {
      getCondition(row, buyOrSell) {
        return getConditionOut(row, buyOrSell)
      },
      getTimeStr(ms){
        return getTimeStrOut(ms)
      },
      handleCurrentChange(currentPage) {
        this.currentPage = currentPage
      },
      handleSizeChange(size) {
        this.pageSize = size;
      },
      searchStockByKeyword() {
        this.historyStockFilter = this.historyStock.filter(item => {
          return item['name'].indexOf(this.search) != -1 || item['code'].indexOf(this.search) != -1
        })
        this.currentPage = 1
      },
    },
    mounted() {
      getPositionHasBuy({
        "state": 2, // 已卖出
      }).then(res => {
        console.log('完成订单获取成功', res.data)
        this.historyStock = eval('('+res.data+')')
        this.historyStockFilter = this.historyStock.filter(item => {
            return item['name'].indexOf(this.search) != -1 || item['code'].indexOf(this.search) != -1
        })
      }).catch(err => {
        console.log("完成订单获取 error", err)
      })
    },
  }
</script>

<style scoped>
  [class^="el-icon"] {
    margin-right: 10px;
  }

  .topPadding {
    padding-top: 20px;
  }

  .block {
    margin-left: 50px;
    margin-right: 50px;
  }

  .font {
    font-weight: bold;
    font-size: 13px;
    color: #545c64;
  }

  .efont {
    font-weight: bold;
    font-size: 20px;
    color: #009688;
  }

  .spancenter {
    text-align: center;
    display: block;
  }

  .changeSellStraBtn {
    color: #fff;
    background-color: #FFA000;
    border-color: #FFA000;
  }

  .changeSellStraBtn:hover {
    background: var(--el-button-hover-color);
    border-color: var(--el-button-hover-color);
    color: var(--el-button-font-color);
  }

  .sellBtn {
    margin-top: 7px;
    color: #fff;
    background-color: #009688;
    border-color: #009688;
  }

  .sellBtn:hover {
    background: var(--el-button-hover-color);
    border-color: var(--el-button-hover-color);
    color: var(--el-button-font-color);
  }
</style>