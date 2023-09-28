<template>
  <div>
    <el-row>
      <el-col :span="8">
        <el-input class="input_style" @input="searchStockByKeyword" v-model="search" clearable
          @clear="getOriginStockList" placeholder="输入股票代码或名称">
          <el-button slot="append" icon="el-icon-search" @click="searchStockByKeyword"></el-button>
        </el-input>
      </el-col>
    </el-row>
    <el-table v-loading="loading" @sort-change="sortChange"
      :data="stocks_back.slice((currentPage-1)*pageSize,currentPage*pageSize)" style="width: 100%; font-size: 13px"
      stripe :header-cell-style="{color: '#545c64'}">
      <el-table-column prop="code" label="股票代码" align="center">
      </el-table-column>
      <el-table-column prop="name" label="股票名称" align="center">
      </el-table-column>
      <el-table-column prop="close" label="收盘价" align="center">
      </el-table-column>
      <el-table-column prop="choose" label="选中" align="center">
        <template #default="scope">
          <!-- label：与数组中的值对应 -->
          <el-checkbox v-model="stocksChecked" :label="scope.row">选择</el-checkbox>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination class="topPadding" @size-change="handleSizeChange" @current-change="handleCurrentChange"
      :current-page="currentPage" :page-sizes="[5, 100, 200, 400]" :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper" :total="stocks_back.length">
    </el-pagination>
  </div>
</template>

<script>
  import {
    formatDate
  } from "@/common/utils";
  import {
    stock_dict,
    query_dict
  } from "@/common/static";

  export default {
    name: "StockList",
    components: {},
    mounted() {
			this.$bus.$on('chooseStocksChange',(newChooseStocks)=>{
        this.stocksChecked=newChooseStocks // 已选股票取消了, 则股票列表中的选中状态也要取消
			})
		},
    props: {
      stocks: {
        type: Array,
        default: []
      }
    },
    data() {
      return {
        stocks_back: this.stocks.map(formatDate),
        search: '',
        currentPage: 1,
        pageSize: 5,
        loading: false,
        stocksChecked: []
      }
    },
    computed: {
      show_dict() {
        let s_dict = Object.assign({}, stock_dict, query_dict)
        let show_dict = {}
        if (this.stocks_back.length > 0) {
          for (let key in this.stocks_back[0]) {
            if (key in s_dict)
              show_dict[key] = s_dict[key]
            else {
              let temp = key.split('-')
              let label = ''
              if (temp[0] === 'current_level')
                label += s_dict[temp[1]] + "历史水平（过去" + temp[2].toString() + "个月)"
              show_dict[key] = label
            }
          }
        }
        return show_dict
      }
    },
    watch: {
      // search(val, oldVal) {
      //   this.stocks_back = this.stocks.filter(item => {
      //     // console.log(item['ts_code'].indexOf(val) !== -1)
      //     return item['ts_code'].indexOf(val) !== -1 || item['name'].indexOf(val) !== -1 || item['area'].indexOf(
      //       val) !== -1 || item['industry'].indexOf(val) !== -1
      //   })
      //   this.currentPage = 1
      // },
      stocks() {
        //必须监听父组件的变化，可能此变量只在初始化的时候获得一次赋值
        // console.log('watch stock');
        this.stocks_back = this.stocks.map(formatDate)
      }
    },
    methods: {
      searchStockByKeyword() {
        this.stocks_back = this.stocks.filter(item => {
          return item['name'].indexOf(this.search) !== -1 || item['code'].indexOf(this.search) !== -1
        })
        this.currentPage = 1
      },
      getOriginStockList() {
        this.stocks_back = this.stocks.map(formatDate);
      },
      cellData(row) {
        console.log(row);
      },
      stockDetail(row) {
        this.$router.push({
          path: '/stock_detail',
          query: {
            ts_code: row['ts_code'],
            myTab: "first"
          }
        })
      },
      handleCurrentChange(currentPage) {
        this.currentPage = currentPage
      },
      handleSizeChange(size) {
        this.pageSize = size;
      },
      //bug：在搜索后排序图标仍然保持高亮，但已经恢复默认排序
      sortChange(context) {
        if (context.order === 'ascending' || context.order === 'descending') {
          this.stocks_back.sort((a, b) => {
            let result
            if (context.prop === 'list_date') {
              result = new Date(a[context.prop]) - new Date(b[context.prop])
            } else {
              result = a[context.prop] - b[context.prop]
            }
            return context.order === 'ascending' ? result : -result
          })
          this.currentPage = 1
        }
      }
    }
  }
</script>

<style scoped>
  .topPadding {
    padding-top: 20px;
  }

  .link_color {
    font-size: 13px;
    color: #0366D6;
  }

  .el-link.link_color:hover {
    /*font-weight: bold;*/
    color: #0366D6;
  }

  .el-link.link_color:active {
    /*font-weight: bold;*/
    color: #0366D6;
  }
</style>
<style>
  .el-pager li.active,
  .el-pager li:hover,
  .el-pagination button:hover {
    color: #0366D6;
  }
</style>