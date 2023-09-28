<template>
  <div class="block">
    <el-divider content-position="left"><i class="el-icon-magic-stick"></i><span class="font">策略详情</span>
    </el-divider>
    <el-card>
      <el-table :data="stockData" style="font-size: 13px;" :header-cell-style="{ color: '#545c64' }"
        :row-class-name="rowClassName" @row-click='handleRowClickRole'>
        <el-table-column prop="strategyName" label="策略名称" align="center">
        </el-table-column>
        <el-table-column prop="cost" label="持仓成本" align="center">
        </el-table-column>
        <el-table-column prop="curPrice" label="持仓现价" align="center">
        </el-table-column>

        <el-table-column label="股票数量" align="center">
          <template v-slot="scope">
            <el-popover placement="right" width="300" trigger="click">
              <el-table :data="gridData" style="font-size: 13px;" :header-cell-style="{ color: '#545c64' }">
                <el-table-column align="center" width="100" property="stockCode" label="股票代码"></el-table-column>
                <el-table-column align="center" width="100" property="stockName" label="股票名称"></el-table-column>
                <el-table-column align="center" width="100" property="earnings" label="收益"></el-table-column>
              </el-table>
              <el-button type='text' slot="reference" class="highlightColor">{{ stockData[0].stockNum }}</el-button>
            </el-popover>
          </template>
        </el-table-column>

        <el-table-column label="策略收益" align="center">
          <template v-slot="scope">
            <el-popover placement="left" trigger="click">
              <div :ref="'btn' + scope.$index" class="chart"></div>
              <el-button @click="initCharts(scope.$index)" type='text' slot="reference" class="highlightColor">
                {{ stockData[0].profit }}</el-button>
            </el-popover>
          </template>
        </el-table-column>

        <el-table-column align="center">
          <el-button round size="mini" class="sellBtn">卖出</el-button>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import {
  getDailyQuotation
} from "@/network/stocks";
export default {
  name: "MyStrategy",
  data() {
    return {
      stocksList: [],
      results: [],
      k: [],
      stockData: [{
        strategyName: '111',
        cost: 1,
        curPrice: 11,
        stockNum: 111,
        profit: 1111,
      },
      {
        strategyName: '222',
        cost: 22,
        curPrice: 2,
        stockNum: 222,
        profit: 2222,
      },
      {
        strategyName: '222',
        cost: 22,
        curPrice: 2,
        stockNum: 222,
        profit: 2222,
      },
      ],
      gridData: [{
        stockCode: 'asd',
        stockName: '王小虎',
        earnings: 100
      }, {
        stockCode: 'dfs',
        stockName: '啊啊啊',
        earnings: 200
      }, {
        stockCode: 'dsc',
        stockName: '从低到高',
        earnings: 300
      }],
    }
  },
  methods: {
    //获取当前的行数
    rowClassName({
      row,
      rowIndex
    }) {
      //把每一行的索引放进row
      row.index = rowIndex;
    },
    handleRowClickRole(row) {
      this.rowIndex = row.index
      console.log(this.rowIndex)
    },

    async initCharts(index) {
      console.log(index)
      var colorList = ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'];
      var labelFont = 'bold 12px Sans-serif';

      // getDailyQuotation({
      //   "code": "002466",
      // }).then(res => {
      //   console.log("esss", res)
      // }).catch(err => {
      //   console.log("esss", err)
      // })

      const url = 'http://192.168.1.64:8997/bigdata-stock/api/v1/stock/crawl/daily_quotation?code=002466'

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
          // this.$axios.get(url)
          //   .then((raw) => {
          //     this.results = raw.data.results;
          //     console.log("results:", this.results)
          //     var length = this.results.ts_code.length;
          //     this.k = [
          //       []
          //     ];
          //     for (var i = 0; i < length; i++) {
          //       this.k.push([
          //         this.results.open[i],
          //         this.results.close[i],
          //         this.results.low[i],
          //         this.results.high[i],
          //         this.results.vol[i],
          //       ]);
          //     }
          //   })
          //   .catch((response) => { console.log(response); })

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
              axisLine: { lineStyle: { color: '#777' } },
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
              splitLine: { show: false },
              axisLabel: { show: false },
              axisTick: { show: false },
              axisLine: { lineStyle: { color: '#777' } },
              splitNumber: 20,
              min: 'dataMin',
              max: 'dataMax',
              axisPointer: {
                type: 'shadow',
                label: { show: false },
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
              axisLine: { lineStyle: { color: '#777' } },
              splitLine: { show: true },
              axisTick: { show: false },
              axisLabel: {
                inside: true,
                formatter: '{value}\n'
              }
            }, {
              scale: true,
              gridIndex: 1,
              splitNumber: 2,
              axisLabel: { show: false },
              axisLine: { show: false },
              axisTick: { show: false },
              splitLine: { show: false }
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
                style: { fill: colorList[1], font: labelFont },
                left: 0
              }, {
                id: 'MA10',
                type: 'text',
                style: { fill: colorList[2], font: labelFont },
                left: 'center'
              }, {
                id: 'MA20',
                type: 'text',
                style: { fill: colorList[3], font: labelFont },
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
  }
  }
</script>

<style scoped>
.chart {
  width: 500px;
  height: 600px;
  /* overflow: hidden; */
}

[class^="el-icon"] {
  margin-right: 10px;
}

.block {
  margin-left: 80px;
  margin-right: 80px;
}

.font {
  font-weight: bold;
  font-size: 13px;
  color: #545c64;
}

.sellBtn {
  color: #fff;
  background-color: #009688;
  border-color: #009688;
}

.sellBtn:hover {
  background: var(--el-button-hover-color);
  border-color: var(--el-button-hover-color);
  color: var(--el-button-font-color);
}

.highlightColor {
  color: #009688;
}
</style>