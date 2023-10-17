<template>
  <div class="block">

    <!-- 第一条分割线 -->
    <el-divider content-position="left">
      <i class="el-icon-edit"></i><span class="font">股票池筛选策略</span>
    </el-divider>

    <!-- 策略选择 -->
    <query-selector ref="query_selector" @reset="reset" v-model="question"></query-selector>

    <el-card>
      <el-row style="font-size: 15px;">
        <el-col :span="8">
          <span style="color:#009688; font-size:17px;">策略</span> : {{strategy}}
        </el-col>
        <el-col :span="14">
          <span style="color:#009688; font-size:17px;">参数</span> : {{this.param[0]}} {{this.param[1]}}
        </el-col>
        <el-col :span="2">
          <el-button class="buttons" type="success" @click="filter" size="small">选股</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 第二条分割线 -->
    <el-divider content-position="left">
      <i class="el-icon-circle-check"></i><span class="font">符合条件的股票</span>
    </el-divider>
    
    <el-card>
      <stock-list ref="stock_list" :stocks="stocks"></stock-list>
    </el-card>

    <!-- 第三条分割线 -->
    <el-divider content-position="left"><i class="el-icon-circle-check"></i><span class="font">已选股票</span></el-divider>
    
    <el-card>
      <el-table :data="chooseStocks" style="font-size: 13px" stripe :header-cell-style="{color: '#545c64'}">
        <el-table-column prop="code" label="股票代码" align="center">
        </el-table-column>
        <el-table-column prop="name" label="股票名称" align="center">
        </el-table-column>
        <el-table-column prop="close" label="收盘价" align="center">
        </el-table-column>
        <el-table-column label="选中" align="center">
          <template #default="scope">
            <!-- label：与数组中的值对应 -->
            <el-checkbox v-model="chooseStocks" :label="scope.row">选择</el-checkbox>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 第四条分割线 -->
    <el-divider content-position="left"><i class="el-icon-circle-check"></i><span class="font">选择买卖策略</span></el-divider>
    
    <el-card>
      <!-- 买入条件设置 -->
      <el-row class="topPadding" :gutter="10">
        <!-- 下拉选框 -->
        <el-col :span="5" :offset="1">
          <el-select @change="buyOptionChange" v-model="trade.conditionsBuy" placeholder="请选择买入条件">
            <el-option v-for="item in conditionsBuy" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-col>

        <div v-if="trade.conditionsBuy=='ma'">
          <el-col :span="6" style="padding-top: 10px">
            <el-radio v-model="trade.inputBuyCondition.level" label="1">分钟级</el-radio>
            <el-radio v-model="trade.inputBuyCondition.level" label="2">小时级</el-radio>
            <el-radio v-model="trade.inputBuyCondition.level" label="3">日级</el-radio>
          </el-col>
          <el-col :span="6">
            <el-input placeholder="请输入MA1" v-model.number="trade.inputBuyCondition.ma1" clearable
            @input="chooseStocksAndInputChange">
              <template slot="prepend">MA1</template>
            </el-input>
          </el-col>
          <el-col :span="6">
            <el-input placeholder="请输入MA2" v-model.number="trade.inputBuyCondition.ma2" clearable
            @input="chooseStocksAndInputChange">
              <template slot="prepend">MA2</template>
            </el-input>
          </el-col>
        </div>

        <el-col :span="16" :offset="2" v-else>
          <el-input placeholder="请输入买入条件" v-model="trade.inputBuyCondition.normal" clearable
            @input="chooseStocksAndInputChange">
            <template slot="prepend">买入条件</template>
          </el-input>
        </el-col>
      </el-row>

      <!-- 卖出条件设置 -->
      <el-row class="topPadding" :gutter="10">
        <!-- 下拉选框 -->
        <el-col :span="5" :offset="1">
          <el-select @change="sellOptionChange" v-model="trade.conditionsSell" placeholder="请选择卖出条件">
            <el-option v-for="item in conditionsSell" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-col>

        <div v-if="trade.conditionsSell=='ma'">
          <el-col :span="6" style="padding-top: 10px">
            <el-radio v-model="trade.inputSellCondition.level" label="1">分钟级</el-radio>
            <el-radio v-model="trade.inputSellCondition.level" label="2">小时级</el-radio>
            <el-radio v-model="trade.inputSellCondition.level" label="3">日级</el-radio>
          </el-col>

          <el-col :span="6">
            <el-input placeholder="请输入MA1" v-model.number="trade.inputSellCondition.ma1" clearable
            @input="chooseStocksAndInputChange">
              <template slot="prepend">MA1</template>
            </el-input>
          </el-col>
          <el-col :span="6">
            <el-input placeholder="请输入MA2" v-model.number="trade.inputSellCondition.ma2" clearable
            @input="chooseStocksAndInputChange">
              <template slot="prepend">MA2</template>
            </el-input>
          </el-col>
        </div>

        <el-col :span="16" :offset="2" v-else>
          <el-input placeholder="请输入卖出条件" v-model="trade.inputSellCondition.normal" clearable
            @input="chooseStocksAndInputChange">
            <template slot="prepend">卖出条件</template>
          </el-input>
        </el-col>
      </el-row>

      <!-- 买入数量 添加按钮 -->
      <el-row class="topPadding">
        <el-col :span="7" :offset="15">
          <span>买入数量 (手)：</span>
          <!-- <el-input-number v-model="trade.amount" :min="1" :max="10" @change="amountChange"></el-input-number> -->
          <el-input-number v-model="trade.amount" :min="1" :max="10" @blur="chooseStocksAndInputChange"></el-input-number>
        </el-col>
        <el-col :span="2">
          <el-button :disabled="addBtnDisabled" type="danger" @click="addStocks">加入观望</el-button>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
  import QuerySelector from "../components/QuerySelector";
  import StockList from "../components/StockList";
  import {
    getAllStock,
    getStrategyInfo,
    addOrder
  } from "@/network/stocks";

  export default {
    name: "Stocks",
    components: {
      StockList,
      QuerySelector
    },
    data() {
      return {
        stocks: [],
        strategy: "",
        question: [],
        param: [],
        queries: [],
        query_selector: [],
        stock_list: [],
        chooseStocks: [],

        conditionsBuy: [{
          value: 'percent',
          label: '主动买入'
        }, {
          value: 'price',
          label: '价格'
        }, {
          value: 'ma',
          label: '双均线'
        }],

        conditionsSell: [{
          value: 'percent',
          label: '主动止盈'
        }, {
          value: 'price',
          label: '价格'
        }, {
          value: 'ma',
          label: '双均线'
        }],
        trade: {
          amount: 1,
          conditionsBuy: '', // 不默认设置初始买入策略，但必须选择
          conditionsSell: '', // 默认为空串，表示不设卖出策略
          inputBuyCondition: {
            level: '3', // 默认日级
            normal: '',
            ma1: 5,  // 已强制为number类型
            ma2: 10,
          },
          inputSellCondition: {
            level: '3',
            normal: '',
            ma1: 5,
            ma2: 10,
          },
        },
        // 下单按钮禁用与否
        addBtnDisabled: true,
      }
    },
    watch: {
      chooseStocks(newVal) {
        this.$bus.$emit('chooseStocksChange', newVal)
        this.chooseStocksAndInputChange()
      },
    },

    methods: {
      // amountChange(currentValue, oldValue){
      //   // console.log(currentValue, oldValue)
      //   if(currentValue==undefined){
      //     console.log('111')
      //     // this.addBtnDisabled = true;
      //   }
      //   if(this.trade.amount==undefined){
      //     console.log('222')
      //   }
      //   // else{
      //   //   this.addBtnDisabled = false;
      //   // }
      // },
      chooseStocksAndInputChange() {
        if ((this.trade.conditionsBuy === 'price' || this.trade.conditionsSell === 'price') &&
          this.chooseStocks.length > 1) {
          this.$message.error('价格策略只能选择一只股票')
          this.addBtnDisabled = true;
        } else if ((this.trade.conditionsBuy === 'price' || this.trade.conditionsBuy === 'percent') && this.trade
          .inputBuyCondition.normal == '') {
          // price percent时，input一定要输入
          this.addBtnDisabled = true
        } else if (this.chooseStocks.length < 1 || this.trade.conditionsBuy == ''|| this.trade.conditionsSell == '') {
          this.addBtnDisabled = true
        } else if ((this.trade.conditionsSell == 'percent' || this.trade.conditionsSell == 'price') && this.trade
          .inputSellCondition.normal == '') { // 设了卖出条件，但没输入，又不是ma（ma不在这里检验）-> 禁用
          this.addBtnDisabled = true
        } else if (this.trade.conditionsBuy === 'ma'&& 
        (this.trade.inputBuyCondition.ma1 == ''||this.trade.inputBuyCondition.ma2== '')) {
          // ma时，一定要输入
          this.addBtnDisabled = true
        } else if (this.trade.conditionsSell === 'ma'&& 
        (this.trade.inputSellCondition.ma1 == ''||this.trade.inputSellCondition.ma2== '')) {
          // ma时，一定要输入
          this.addBtnDisabled = true
        } else if(this.trade.amount == undefined){ 
          // 比较后面才触发 (其他条件都选好, 这个不满足才会触发!! 因为这是else if, 只能走一个! 没有走这个是因为已经走了上面的了!!)
          this.addBtnDisabled = true
          this.$message.error('请输入买入手数')
        }
        else {
          this.addBtnDisabled = false
        }
      },
      buyOptionChange() {
        this.trade.inputBuyCondition.normal = ''
        this.chooseStocksAndInputChange()
      },
      sellOptionChange() {
        this.trade.inputSellCondition.normal = ''
        this.chooseStocksAndInputChange()
      },
      sendAddOrderRequest(code, codeName, close, amount, straNameBuy, straParamBuy, straNameSell, straParamSell) {
        addOrder({
          code,
          codeName,
          'state': 0,
          'price': close,
          amount,
          straNameBuy,
          straParamBuy,
          straNameSell,
          straParamSell,
        }).then(response => {
          console.log("addOrder axios封装")
          this.$message.success('添加成功')
        }).catch(err => {
          console.log("addOrder error", err)
        })
      },
      getLevel(level) {
        if (level == 1) {
          return 'min'
        } else if (level == 2) {
          return 'hour'
        } else {
          return 'day'
        }
      },
      addStocks() {
        // stocksChecked是stock_list组件的
        this.chooseStocks = this.$refs.stock_list.stocksChecked

        let straNameBuy = 0
        let straParamBuy = ''
        let buyPrice = 0
        let buyPercent = 0

        let straNameSell = 0
        let straParamSell = ''
        let sellPrice = 0
        let sellPercent = 0
        if (this.trade.conditionsBuy == 'price') { // 买入条件是价格，只有一只股票
          straNameBuy = 1
          buyPrice = this.trade.inputBuyCondition.normal + ''
          straParamBuy = `{"price":"${buyPrice}"}`
          if (this.trade.conditionsSell == 'price') { // 卖出条件条件是 价格
            straNameSell = 1
            sellPrice = this.trade.inputSellCondition.normal + ''
            straParamSell = `{"price":"${sellPrice}"}`
          } else if (this.trade.conditionsSell == 'percent') { // 卖出条件是百分比
            straNameSell = 2
            sellPercent = this.trade.inputSellCondition.normal * 1
            sellPrice = (this.chooseStocks[0].close * (1 + sellPercent * 0.01)).toFixed(2) + ''
            straParamSell = `{"percent":"${sellPercent+'%'}","price":"${sellPrice}"}`
          } else { // 卖出条件是双均线
            straNameSell = 3
            let level = this.getLevel(this.trade.inputSellCondition.level)
            // ma1<ma2
            var maParams=this.regularizeMaParams(this.trade.inputSellCondition.ma1, this.trade.inputSellCondition.ma2)
            var ma1=maParams[0]
            var ma2=maParams[1] //number
            straParamSell = `{"ma1":"${ma1}","ma2":"${ma2}","mode":"${level}"}`
          }
          console.log(this.chooseStocks[0].code,
            this.chooseStocks[0].name,
            this.chooseStocks[0].close,
            this.trade.amount,
            straNameBuy,
            straParamBuy,
            straNameSell,
            straParamSell);
          this.sendAddOrderRequest(this.chooseStocks[0].code,
            this.chooseStocks[0].name,
            this.chooseStocks[0].close,
            this.trade.amount,
            straNameBuy,
            straParamBuy,
            straNameSell,
            straParamSell)
        } else if (this.trade.conditionsSell == 'price') { // 卖出条件是价格
          straNameSell = 1
          sellPrice = this.trade.inputSellCondition.normal + ''
          straParamSell = `{"price":"${sellPrice}"}`
          if (this.trade.conditionsBuy == 'percent') { // 买入条件是百分比
            straNameBuy = 2
            buyPercent = this.trade.inputBuyCondition.normal * 1
            buyPrice = (this.chooseStocks[0].close * (1 + buyPercent * 0.01)).toFixed(2) + ''
            straParamBuy = `{"percent":"${buyPercent+'%'}","price":"${buyPrice}"}`
          } else { // 买入条件是双均线
            straNameBuy = 3
            let level = this.getLevel(this.trade.inputBuyCondition.level)
            // ma1<ma2
            var maParams=this.regularizeMaParams(this.trade.inputBuyCondition.ma1, this.trade.inputBuyCondition.ma2)
            var ma1=maParams[0]
            var ma2=maParams[1] //number
            straParamBuy = `{"ma1":"${ma1}","ma2":"${ma2}","mode":"${level}"}`
          }
          console.log(this.chooseStocks[0].code,
            this.chooseStocks[0].name,
            this.chooseStocks[0].close,
            this.trade.amount,
            straNameBuy,
            straParamBuy,
            straNameSell,
            straParamSell);
          this.sendAddOrderRequest(this.chooseStocks[0].code,
            this.chooseStocks[0].name,
            this.chooseStocks[0].close,
            this.trade.amount,
            straNameBuy,
            straParamBuy,
            straNameSell,
            straParamSell)
        } else if (this.trade.conditionsBuy == 'percent') { // 买入条件是百分比
          straNameBuy = 2
          buyPercent = this.trade.inputBuyCondition.normal * 1
          if (this.trade.conditionsSell == 'percent') { // 卖出条件是百分比
            straNameSell = 2
            sellPercent = this.trade.inputSellCondition.normal * 1
            this.chooseStocks.forEach((elem, index) => {
              buyPrice = (elem.close * (1 + buyPercent * 0.01)).toFixed(2) + ''
              straParamBuy = `{"percent":"${buyPercent+'%'}","price":"${buyPrice}"}`
              sellPrice = (elem.close * (1 + sellPercent * 0.01)).toFixed(2) + ''
              straParamSell = `{"percent":"${sellPercent+'%'}","price":"${sellPrice}"}`
              console.log(elem.code,
                elem.name,
                elem.close,
                this.trade.amount,
                straNameBuy,
                straParamBuy,
                straNameSell,
                straParamSell);
              this.sendAddOrderRequest(elem.code,
                elem.name,
                elem.close,
                this.trade.amount,
                straNameBuy,
                straParamBuy,
                straNameSell,
                straParamSell)
            });
          } else { // 卖出条件是 ma
            straNameSell = 3
            let level = this.getLevel(this.trade.inputSellCondition.level)
            // ma1<ma2
            var maParams=this.regularizeMaParams(this.trade.inputSellCondition.ma1, this.trade.inputSellCondition.ma2)
            var ma1=maParams[0]
            var ma2=maParams[1] //number
            straParamSell = `{"ma1":"${ma1}","ma2":"${ma2}","mode":"${level}"}`
            this.chooseStocks.forEach((elem, index) => {
              buyPrice = (elem.close * (1 + buyPercent * 0.01)).toFixed(2) + ''
              straParamBuy = `{"percent":"${buyPercent+'%'}","price":"${buyPrice}"}`
              console.log(elem.code,
                elem.name,
                elem.close,
                this.trade.amount,
                straNameBuy,
                straParamBuy,
                straNameSell,
                straParamSell);
              this.sendAddOrderRequest(elem.code,
                elem.name,
                elem.close,
                this.trade.amount,
                straNameBuy,
                straParamBuy,
                straNameSell,
                straParamSell)
            });
          }
        } else { // 买入条件是ma
          straNameBuy = 3
          let level = this.getLevel(this.trade.inputBuyCondition.level)
          // ma1<ma2
          var maParams=this.regularizeMaParams(this.trade.inputBuyCondition.ma1, this.trade.inputBuyCondition.ma2)
          var ma1=maParams[0]
          var ma2=maParams[1] //number
          straParamBuy = `{"ma1":"${ma1}","ma2":"${ma2}","mode":"${level}"}`
          if (this.trade.conditionsSell == 'percent') { // 卖出条件是百分比
            straNameSell = 2
            sellPercent = this.trade.inputSellCondition.normal * 1
            this.chooseStocks.forEach((elem, index) => {
              sellPrice = (elem.close * (1 + sellPercent * 0.01)).toFixed(2) + ''
              straParamSell = `{"percent":"${sellPercent+'%'}","price":"${sellPrice}"}`
              console.log(elem.code,
                elem.name,
                elem.close,
                this.trade.amount,
                straNameBuy,
                straParamBuy,
                straNameSell,
                straParamSell);
              this.sendAddOrderRequest(elem.code,
                elem.name,
                elem.close,
                this.trade.amount,
                straNameBuy,
                straParamBuy,
                straNameSell,
                straParamSell)
            });
          } else { // 卖出条件是 ma
            straNameSell = 3
            let level = this.getLevel(this.trade.inputSellCondition.level)
            // ma1<ma2
            var maParams=this.regularizeMaParams(this.trade.inputSellCondition.ma1, this.trade.inputSellCondition.ma2)
            var ma1=maParams[0]
            var ma2=maParams[1] //number
            straParamSell = `{"ma1":"${ma1}","ma2":"${ma2}","mode":"${level}"}`

            this.chooseStocks.forEach((elem, index) => {
              console.log(elem.code,
                elem.name,
                elem.close,
                this.trade.amount,
                straNameBuy,
                straParamBuy,
                straNameSell,
                straParamSell);
              this.sendAddOrderRequest(elem.code,
                elem.name,
                elem.close,
                this.trade.amount,
                straNameBuy,
                straParamBuy,
                straNameSell,
                straParamSell)
            });
          }
        }
      },

      reset() {
        this.queries = []
      },

      // 使ma1<ma2, str->return number array
      regularizeMaParams(ma1, ma2){
        // 先转成number
        ma1=ma1*1
        ma2=ma2*1
        console.log("111", ma1, ma2)
        var temp=0
        if(ma1>ma2){
          temp=ma1
          ma1=ma2
          ma2=temp
        }
        var maParams=[ma1, ma2]
        return maParams
      },
      // 策略选股按钮
      filter() {
        this.stocks = []
        this.$refs.stock_list.loading = true

        var maParams=this.regularizeMaParams(this.param[0], this.param[1])
        var ma1=maParams[0]
        var ma2=maParams[1] //number

        console.log("222", ma1, ma2)
        getStrategyInfo({
          "md1": ma1,
          "md2": ma2,
          "description": "input two int value to calcu"
        }).then(response => {
          this.stocks = eval('('+response.data+')')
          this.$refs.stock_list.loading = false // 加载中（转圈效果）
        }).catch(err => {
          console.log("策略选股 error", err)
        })
      }
    },
    
    mounted() {
      // 初始显示所有股票
      getAllStock().then(response => {
        var jsArray = eval('('+response.data+')')
        this.stocks = jsArray
        this.$refs.stock_list.loading = false
      }).catch(err => {
        console.log("getAllStock error", err)
      })

      this.$watch(() => {
          return this.$refs.query_selector.checkedStrategy
        },
        (val) => {
          console.log("checkedStrategy:", val)
          if (val === '1') {
            this.strategy = '均线策略'
          } else {
            this.strategy = '价值策略'
          }
        }
      ),

      this.$watch(() => {
          return this.$refs.query_selector.checkedMA
        },
        (val) => {
          console.log("checkedMA:", val)
          // console.log("checkedMA:", typeof(val[0])) // string
          this.param = val
        }
      ),

      this.$watch(() => {
          return this.$refs.stock_list.stocksChecked
        },
        (val) => {
          this.chooseStocks = val
        }
      )
    }
  }
</script>

<style scoped>
  .el-input {
    width: 300px;
  }

  .item-container {
    min-height: 100px;
  }

  .button {
    margin-top: 15px;
    margin-bottom: 15px;
    float: right;
  }

  .without {
    width: 100px;
    margin: 0 auto;
    color: #909399;
  }

  [class^="el-icon"] {
    margin-right: 10px;
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

  .text {
    font-size: 14px;
  }

  .item {
    margin-bottom: 18px;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }

  .clearfix:after {
    clear: both
  }

  .box-card {
    width: 480px;
  }

  .topPadding {
    padding-top: 20px;
  }
</style>