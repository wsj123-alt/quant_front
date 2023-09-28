<template>
  <div class="block">
    <el-divider content-position="left">
      <i class="el-icon-edit"></i><span class="font">账户信息</span>
    </el-divider>

    <el-card>
      <el-row :gutter="20">

        <el-col :span="6">
          <span style="color:#009688; font-size:20px;">资金余额</span> : {{balance}}
        </el-col>
        <el-col :span="6">
          <span style="color:#009688; font-size:20px;">可用金额</span> : {{amount_available}}
        </el-col>
        <el-col :span="6">
          <span style="color:#009688; font-size:20px;">可取金额</span> : {{amount_withdraw}}
        </el-col>
        <el-col :span="6">
          <span style="color:#009688; font-size:20px;">总资产</span> : {{total_assets}}
        </el-col>

      </el-row>
    </el-card>
    
  </div>
</template>

<script>
  import {getBalanceInfo} from "@/network/stocks";
  export default {
    name: "Shares",
    data() {
      return {
        balance: 0,
        amount_available: 0,
        amount_withdraw: 0,
        total_assets: 0,
      };
    },
    mounted() {
      getBalanceInfo().then(response => {
        var obj = JSON.parse(response.data)
        this.balance=obj['资金余额']
        this.amount_available=obj['可用金额']
        this.amount_withdraw=obj['可取金额']
        this.total_assets=obj['总资产']
      }).catch(err => {
        console.log("获取账户信息 error", err)
      })
    }
  };

</script>
<style lang="scss">
  .block {
    margin-left: 50px;
    margin-right: 50px;
  }
  .like {
    cursor: pointer;
    font-size: 25px;
    display: inline-block;
  }
</style>
