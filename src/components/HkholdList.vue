<template>
    <div>
        <el-table
                v-loading="loading"
                @sort-change="sortChange"
                :data="hkholds_back"
                style="width: 100%; font-size: 13px"
                stripe
                :header-cell-style="{color: '#545c64'}">
            <el-table-column
                    prop="ts_code_id"
                    label="股票代码"
                    align="center">
            </el-table-column>
            <el-table-column
                    prop="name"
                    label="名称"
                    align="center">
            </el-table-column>
            <el-table-column
                    prop="trade_date"
                    label="交易日期"
                    align="center">
            </el-table-column>
            <el-table-column
                    prop="vol"
                    label="持股数量(股)"
                    align="center">
            </el-table-column>
            <el-table-column
                    prop="ratio"
                    label="持股占比(%)"
                    align="center">
            </el-table-column>

        </el-table>
        <el-pagination
                @current-change="handleCurrentChange"
                :current-page="currentPage"
                :page-size="pageSize"
                layout="total, prev, pager, next, jumper"
                :total="total_back">
            >
        </el-pagination>
    </div>
</template>

<script>
    import {formatDate} from "@/common/utils";

    export default {
        name: "HkholdList",
        components: {},
        props: {
            total: {
                type: Number,
            },
            hkholds: {
                type: Array,
            }
        },
        data() {
            return {
                loading: true,
                currentPage: 1,
                pageSize: 15,
            }
        },
        computed: {
            total_back() {
                return this.total
            },
            hkholds_back() {
                return this.hkholds.map(formatDate)
            }
        },
        methods: {
            handleCurrentChange(currentPage) {
                this.currentPage = currentPage
                // 请求服务端刷新数据
                const offset = (currentPage - 1) * this.pageSize
                this.$emit('pageChange', offset, this.pageSize)
            },
            //bug：在搜索后排序图标仍然保持高亮，但已经恢复默认排序
            sortChange(context) {
                if (context.order === 'ascending' || context.order === 'descending') {
                    this.$emit('sortChange', context.prop, context.order)
                    this.handleCurrentChange(1)
                }
            }
        }
    }
</script>

<style scoped>

</style>