<template>
  <div class="block">
    <el-divider content-position="left"><i class="el-icon-magic-stick"></i><span class="font">持仓详情</span>
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

      <el-table :data="positionStockFilter.slice((currentPage-1)*pageSize,currentPage*pageSize)"
        style="font-size: 13px;" :header-cell-style="{ color: '#545c64' }">
        <el-table-column prop="code" label="股票代码" align="center">
        </el-table-column>

        <el-table-column prop="name" label="股票名称" align="center">
        </el-table-column>

        <el-table-column prop="price" label="实时价格" align="center">
        </el-table-column>
        <el-table-column prop="state" label="订单状态" align="center">
          <template #default="scope">
            <span style="color: red;">已买入</span>
          </template>
        </el-table-column>

        <el-table-column prop="amount" label="买入数量" align="center">
        </el-table-column>

        <el-table-column prop="created_time" label="加入观望时间" align="center">
          <template #default="scope">
            {{getTimeStr(scope.row.created_time)}}
          </template>
        </el-table-column>

        <el-table-column prop="updated_time" label="下单时间" align="center">
          <template #default="scope">
            {{getTimeStr(scope.row.updated_time)}}
          </template>
        </el-table-column>

        <el-table-column prop="buy_price" label="成交价格" align="center">
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

        <el-table-column align="center" label="操作">
          <template #default="scope">
            <el-button round size="mini" class="changeSellStraBtn" @click="showDialogAndSendRow(scope.row)">修改卖出策略
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination class="topPadding" @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="currentPage" :page-sizes="[5, 100, 200, 400]" :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper" :total="positionStockFilter.length">
        >
      </el-pagination>
    </el-card>

    <!-- 修改卖出策略的对话框 -->
    <el-dialog title="修改卖出策略" :visible.sync="sellStraDialogFormVisible" width="700px">
      <!-- 下拉选择卖出策略 -->
      <el-row>
        <el-select v-model="sellCondition" placeholder="请选择卖出条件设置指标" @change="sellConditionSelectChange">
          <el-option v-for="item in conditions" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
        </el-select>
      </el-row>
      <el-row class="topPadding">
        <div v-if="sellCondition=='ma'">
          <el-col :span="10" style="padding-top: 10px">
            <el-radio v-model="sellMaLevel" label="1">分钟级</el-radio>
            <el-radio v-model="sellMaLevel" label="2">小时级</el-radio>
            <el-radio v-model="sellMaLevel" label="3">日级</el-radio>
          </el-col>
          <el-col :span="7">
            <el-input placeholder="请输入ma1" v-model="sellMa1" clearable>
              <template slot="prepend">ma1</template>
            </el-input>
          </el-col>
          <el-col :span="7">
            <el-input placeholder="请输入ma2" v-model="sellMa2" clearable>
              <template slot="prepend">ma2</template>
            </el-input>
          </el-col>
        </div>
        <el-col v-else>
          <el-input placeholder="请输入卖出条件" v-model="sellNormal" clearable>
            <template slot="prepend">卖出条件</template>
          </el-input>
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button @click="sellStraDialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="changeSellStra">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {
    getPositionHasBuy,
    addOrder
  } from "@/network/stocks";
  import {
    getTimeStrOut,
    getConditionOut
  } from "@/common/utils";
  export default {
    name: "Positions",
    data() {
      return {
        currentPage: 1,
        pageSize: 5,
        search: '',
        positionStock: [],
        positionStockFilter: [],

        sellStraDialogFormVisible: false,
        conditions: [{
          value: 'percent',
          label: '主动止盈'
        }, {
          value: 'price',
          label: '价格'
        }, {
          value: 'ma',
          label: '双均线'
        }],
        sellCondition: '', // 修改卖出策略的对话框里展示的卖出条件
        sellMaLevel: '1',
        sellNormal: '',
        sellMa1: 5,
        sellMa2: 10,
        isSellInt: true,
        curRow: {},
      }
    },
    watch: {
      'sellMa1': {
        handler(newValue) {
          this.checkSellInt(newValue)
        }
      },
      'sellMa1': {
        handler(newValue) {
          this.checkSellInt(newValue)
        }
      },
    },
    methods: {
      sellConditionSelectChange(selectCondition){ //没有oldValue!!
        if(selectCondition=='price'||selectCondition=='percent'){
          this.sellNormal=''
        } else{
          this.sellMaLevel='1'
          this.sellMa1=5
          this.sellMa2= 10
        }
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
        this.positionStockFilter = this.positionStock.filter(item => {
          return item['name'].indexOf(this.search) !== -1 || item['code'].indexOf(this.search) !== -1
        })
        this.currentPage = 1
      },
      checkSellInt(num) {
        if (!Number.isInteger(num * 1)) {
          // 不是整数
          this.isSellInt = false
        } else if (num == '') {
          this.isSellInt = false
        } else {
          this.isSellInt = true
        }
      },
      getCondition(row, buyOrSell) {
        return getConditionOut(row, buyOrSell)
      },
      getCurrentSellCondition(row){
        if(row.sell_percent==1){
          return 'price'
        }else if(row.sell_percent==2){
          return 'percent'
        }else if(row.sell_percent==3){
          return 'ma'
        }
      },
      getPercentParam(straParam){
        let strArr=straParam.split(",")
          let percent=""
          for (let i=0; i<strArr.length; i++) {
            if(strArr[i].indexOf("percent")!=-1){
              percent=strArr[i].split(":")[1]
              break
            }
          }
          return percent.slice(0, -1) // %不要
      },
      getPriceParam(straParam){
        let price=eval(straParam.split(":")[1])
        return price
      },
      getMaParam(straParam){
        let mode=straParam.split("mode:")[1]
          let ma1=straParam.split("ma1:")[1].split(",")[0]
          let ma2=straParam.split("ma2:")[1].split(",")[0]

          let level = ''
          if (mode == 'min') {
            level = '1'// 分钟级
          } else if (mode == 'hour') {
            level = '2' // 小时级
          } else {
            level = '3' // 日级
          }
          this.sellMaLevel=level
          this.sellMa1=ma1
          this.sellMa2=ma2
      },
      // 点击修改卖出策略按钮的回调
      showDialogAndSendRow(row) { // 当前行的对象, 包含展示的那些字段等
        // 先展示当前的卖出条件, 方便用户修改
        this.sellCondition = this.getCurrentSellCondition(row)
        // 再相应地修改条件设置的值
        if(this.sellCondition=='price'){ // 显示price的参数
          this.sellNormal=this.getPriceParam(row.stra_param_sell)
        }else if(this.sellCondition=='percent'){ // 显示percent的参数
          this.sellNormal=this.getPercentParam(row.stra_param_sell)
        } else{ // 显示ma的参数
          this.getMaParam(row.stra_param_sell)
        }
        this.sellStraDialogFormVisible = true
        this.curRow = row
      },
      // 点击修改卖出策略的对话框的确定修改按钮的回调, 通知后端修改
      changeSellStra() {
        this.sellStraDialogFormVisible = false // 隐藏dialogue
        let straNameSell = 0
        let straParamSell = ''
        // 根据修改, 形成sell参数, 以便下一步addOrder发送请求
        if (this.sellCondition == 'price') {
          straNameSell = 1
          straParamSell = `{"price":"${this.sellNormal}"}`
        } else if (this.sellCondition == 'percent') {
          straNameSell = 2
          let sellPrice = (this.curRow.price * (1 + this.sellNormal * 0.01)).toFixed(2) + ''
          straParamSell = `{"percent":"${this.sellNormal+'%'}","price":"${sellPrice}"}`
        } else {
          straNameSell = 3
          let level = ''
          if (this.sellMaLevel == '1') {
            level = 'min'
          } else if (this.sellMaLevel == '2') {
            level = 'hour'
          } else {
            level = 'day'
          }
          straParamSell =
            `{"ma1":"${this.sellMa1}","ma2":"${this.sellMa2}","mode":"${level}"}`
        }
        // 发送修改卖出策略请求
        addOrder({
          'id': this.curRow.id, // number, 传递id, 让后端知晓此时是修改卖出策略而不是下单
          straNameSell,
          straParamSell
        }).then(res => {
          console.log("修改卖出策略")
          this.$message.success('修改卖出策略成功')
        }).catch(err => {
          console.log("修改卖出策略 error", err)
        })

        // 更新页面
        this.getPositionStock()
      },

      async initCharts(index, code) {
        code = code.substring(0, 6)
        console.log("code:", code)
        var colorList = ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a',
          '#6e7074', '#546570', '#c4ccd3'
        ];
        var labelFont = 'bold 12px Sans-serif';
        const url = 'http://192.168.1.64:8997/bigdata-stock/api/v1/stock/crawl/daily_quotation?code=' + code

        var raw = await this.$axios.get(url)
        this.results = raw.data.results;
        console.log("results:", this.results)
        var length = this.results.ts_code.length;
        this.k = [
          []
        ];
        for (var i = 0; i < length; i++) {
          this.k.push([
            this.results.open[i],
            this.results.close[i],
            this.results.low[i],
            this.results.high[i],
            this.results.vol[i],
          ]);
        }

        var option = {
          animation: true,
          color: colorList,
          legend: {
            top: 20,
            data: ['日K', 'MA5', 'MA10', 'MA20']
          },
          tooltip: {
            triggerOn: 'none',
            transitionDuration: 0,
            confine: true,
            bordeRadius: 4,
            borderWidth: 1,
            borderColor: '#333',
            backgroundColor: 'rgba(255,255,255,0.9)',
            textStyle: {
              fontSize: 12,
              color: '#333'
            },
            position: function (pos, params, el, elRect, size) {
              var obj = {
                top: 60
              };
              obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
              return obj;
            }
          },
          axisPointer: {
            link: [{
              xAxisIndex: [0, 1]
            }]
          },
          dataZoom: [{
            type: 'slider',
            xAxisIndex: [0, 1],
            realtime: false,
            start: 80,
            // start: length < 60 ? 0 : 100 - parseInt(6000 / length),
            end: 100,
            top: 65,
            height: 20,
            handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '120%'
          }, {
            type: 'inside',
            xAxisIndex: [0, 1],
            start: 80,
            end: 100,
            top: 30,
            height: 20
          }],
          xAxis: [{
            type: 'category',
            data: this.results.trade_date,
            boundaryGap: false,
            axisLine: {
              lineStyle: {
                color: '#777'
              }
            },
            // axisLabel: {
            //   formatter: function (value) {
            //     return this.$echarts.format.formatTime('MM-dd', value);
            //   }
            // },
            min: 'dataMin',
            max: 'dataMax',
            axisPointer: {
              show: true
            }
          }, {
            type: 'category',
            gridIndex: 1,
            data: this.results.trade_date,
            scale: true,
            boundaryGap: false,
            splitLine: {
              show: false
            },
            axisLabel: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLine: {
              lineStyle: {
                color: '#777'
              }
            },
            splitNumber: 20,
            min: 'dataMin',
            max: 'dataMax',
            axisPointer: {
              type: 'shadow',
              label: {
                show: false
              },
              triggerTooltip: true,
              handle: {
                show: true,
                margin: 30,
                color: '#B80C00'
              }
            }
          }],
          yAxis: [{
            scale: true,
            splitNumber: 2,
            axisLine: {
              lineStyle: {
                color: '#777'
              }
            },
            splitLine: {
              show: true
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              inside: true,
              formatter: '{value}\n'
            }
          }, {
            scale: true,
            gridIndex: 1,
            splitNumber: 2,
            axisLabel: {
              show: false
            },
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            }
          }],
          grid: [{
            left: 25,
            right: 25,
            top: 110,
            height: 300
          }, {
            left: 25,
            right: 25,
            height: 100,
            top: 440
          }],
          graphic: [{
            type: 'group',
            left: 'center',
            top: 70,
            width: 300,
            bounding: 'raw',
            children: [{
              id: 'MA5',
              type: 'text',
              style: {
                fill: colorList[1],
                font: labelFont
              },
              left: 0
            }, {
              id: 'MA10',
              type: 'text',
              style: {
                fill: colorList[2],
                font: labelFont
              },
              left: 'center'
            }, {
              id: 'MA20',
              type: 'text',
              style: {
                fill: colorList[3],
                font: labelFont
              },
              right: 0
            }]
          }],
          series: [{
            name: 'Volume',
            type: 'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            itemStyle: {
              normal: {
                color: '#7fbe9e'
              },
              emphasis: {
                color: '#140'
              }
            },
            data: this.results.vol
          }, {
            type: 'candlestick',
            name: '日K',
            data: this.k,
            itemStyle: {
              normal: {
                color: '#ef232a',
                color0: '#14b143',
                borderColor: '#ef232a',
                borderColor0: '#14b143'
              },
              emphasis: {
                color: 'black',
                color0: '#444',
                borderColor: 'black',
                borderColor0: '#444'
              }
            }
          }, {
            name: 'MA5',
            type: 'line',
            data: this.results.ma5,
            smooth: true,
            showSymbol: false,
            lineStyle: {
              normal: {
                width: 1
              }
            }
          }, {
            name: 'MA10',
            type: 'line',
            data: this.results.ma10,
            smooth: true,
            showSymbol: false,
            lineStyle: {
              normal: {
                width: 1
              }
            }
          }, {
            name: 'MA20',
            type: 'line',
            data: this.results.ma20,
            smooth: true,
            showSymbol: false,
            lineStyle: {
              normal: {
                width: 1
              }
            }
          }]
        };
        var myChart = this.$echarts.init(this.$refs['btn' + index])
        myChart.setOption(option);
        // window.onresize = function () {
        //   myChart.resize();
        // }

      },
      getPositionStock() {
        getPositionHasBuy({
          "state": 1 // 已买入 我的持仓
        }).then(response => {
            // console.log("我的持仓", response.data)
            this.positionStock = eval('('+response.data+')')
            this.positionStockFilter = this.positionStock.filter(item => {
            return item['name'].indexOf(this.search) !== -1 || item['code'].indexOf(this.search) !== -1
          })
        }).catch(err => {
          console.log("获取持仓 error", err)
        })
      }
    
    },
    mounted() {
      this.getPositionStock()
    },
  }
</script>

<style scoped>
  .highlightColor {
    color: #009688;
  }

  .topPadding {
    padding-top: 20px;
  }

  .chart {
    width: 500px;
    height: 600px;
    /* overflow: hidden; */
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