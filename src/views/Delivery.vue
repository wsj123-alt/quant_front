<template>
  <div class="block">
    <el-divider content-position="left"><i class="el-icon-magic-stick"></i><span class="font">观望详情</span>
    </el-divider>
    
    <el-card>
      <!-- 过滤 -->
      <el-row>
        <el-col :span="8">
          <el-input class="input_style" @input="searchStockByKeyword" v-model="search" clearable
            @clear="searchStockByKeyword" placeholder="输入股票代码或名称">
            <el-button slot="append" icon="el-icon-search" @click="searchStockByKeyword"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <el-table :data="stockFilter.slice((currentPage-1)*pageSize,currentPage*pageSize)" style="font-size: 13px;"
        :header-cell-style="{ color: '#545c64' }">

        <el-table-column prop="code" label="股票代码" align="center"></el-table-column>
        
        <el-table-column prop="name" label="股票名称" align="center">
          <template v-slot="scope">
            <el-popover placement="left" trigger="click">
              <div :ref="'btn' + (scope.$index+(currentPage-1)*pageSize)" class="chart">服务器异常</div>
              <!-- 激活弹出框的内容写在这 -->
              <el-button
                @click="initCharts(scope.$index+(currentPage-1)*pageSize,stockFilter[scope.$index+(currentPage-1)*pageSize].code)"
                type='text' slot="reference" class="highlightColor">
                {{ stockFilter[scope.$index+(currentPage-1)*pageSize].name }}</el-button>
            </el-popover>
          </template>
        
        </el-table-column>
        
        <!-- <el-table-column :sortable="true" :sort-method="sortByPrice" prop="price" label="实时价格" align="center"> -->
        <el-table-column prop="price" label="实时价格" align="center">
        </el-table-column>

        <el-table-column prop="state" label="订单状态" align="center">
          <template #default="scope">
            <span style="color:orange;">观望中</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="amount" label="买入数量" align="center">
        </el-table-column>

        <el-table-column prop="created_time" label="下单时间" align="center">
          <template #default="scope">
            {{getTimeStr(scope.row.created_time)}}
          </template>
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
            <el-button round size="mini" type="danger" @click="revokeOrder(scope.row.id)">撤销订单</el-button>
          </template>
        </el-table-column>

      </el-table>

      <el-pagination class="topPadding" @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="currentPage" :page-sizes="[5, 100, 200, 400]" :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper" :total="stockFilter.length">
        >
      </el-pagination>

    </el-card>

  </div>
</template>

<script>
  import {
    getPositionHasBuy,
    deleteWaitAndSeeOrder
  } from "@/network/stocks";
  import {
    getTimeStrOut,
    getConditionOut
  } from "@/common/utils";
  export default {
    name: "Delivery",
    data() {
      return {
        length: 0,
        currentPage: 1,
        pageSize: 5,
        stockOrders: [],
        search: '',
        stockFilter: [],
      }
    },
    mounted() { 
      this.getWaitAndSeeOrder()
    },
    methods: {
      getWaitAndSeeOrder(){
        getPositionHasBuy({
          "state": 0, // 观望中
        }).then(response => {
          // console.log("观望data:", response.data)
          this.stockOrders = eval('('+response.data+')')
          this.stockFilter = this.stockOrders.filter(item => {
            return item['name'].indexOf(this.search) !== -1 || item['code'].indexOf(this.search) !== -1
          })
        }).catch(err => {
          console.log("获取观望单 error", err)
        })
      },
      // sortByPrice(obj1, obj2) {
      //   let val1 = obj1.price * 1
      //   let val2 = obj2.price * 1
      //   return val1 - val2
      // },
      handleCurrentChange(currentPage) {
        this.currentPage = currentPage
      },
      handleSizeChange(size) {
        this.pageSize = size;
      },
      getTimeStr(ms){
        return getTimeStrOut(ms)
      },
      getCondition(row, buyOrSell) {
        return getConditionOut(row, buyOrSell)
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
        this.length = this.results.ts_code.length;
        this.k = [
          []
        ];
        for (var i = 0; i < this.length; i++) {
          this.k.push([
            this.results.open[i],
            this.results.close[i],
            this.results.low[i],
            this.results.high[i],
            this.results.vol[i],
          ]);
        }
        // 指定配置项和数据
        var option = {
          animation: true,
          color: colorList, // 每条线的颜色
          legend: {
            top: 20, // 距离
            data: ['日K', 'MA5', 'MA10', 'MA20']
          },
          tooltip: { // 提示框组件
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
          series: [{ // 线的条数=对象的个数
            name: 'Volume', // 对应legend里的名称以及鼠标放上去提示的名称
            type: 'bar', // 图表类型
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
            data: this.results.vol // 与横坐标对应的数据
            // stack 数据堆叠
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
        // 初始化echarts实例对象（传盒子对象）
        var myChart = this.$echarts.init(this.$refs['btn' + index])
        // 将配置项数据给echarts实例对象
        myChart.setOption(option);
        // window.onresize = function () {
        //   myChart.resize();
        // }
      },
      revokeOrder(id) { // id: number
        deleteWaitAndSeeOrder({
          "id": id,
        }).then(res => {
          if (res.status == 200) {
            this.$message.success('撤销观望订单成功')
            // 撤销成功后，再重新显示观望中订单
            this.getWaitAndSeeOrder()
            // 如果这一页的订单都被撤销了，则回到上一页
            let curPageStocks = this.stockFilter.slice((this.currentPage - 1) * this.pageSize, this.currentPage *
              this.pageSize)
            if (curPageStocks.length == 1) {
              this.currentPage = this.currentPage - 1
            }
          } else {
            this.$message.error('撤销观望订单失败')
          }
        }).catch(err => {
          console.log("撤销观望订单 error", err)
        })
      },
      searchStockByKeyword() {
        this.stockFilter = this.stockOrders.filter(item => {
          return item['name'].indexOf(this.search) !== -1 || item['code'].indexOf(this.search) !== -1
        })
        this.currentPage = 1
      },
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

  .removeBtn {
    color: #fff;
    background-color: #009688;
    border-color: #009688;
  }

  .removeBtn:hover {
    background: var(--el-button-hover-color);
    border-color: var(--el-button-hover-color);
    color: var(--el-button-font-color);
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
</style>