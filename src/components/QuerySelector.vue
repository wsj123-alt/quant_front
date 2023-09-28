<template>
    <div>
        <!-- 卡片的阴影效果 -->
        <el-card>
            <el-tabs class="tabs" @tab-click="tabClick" v-model="activeName" tab-position="left" type="card">

                <el-tab-pane name="strategyIndex">
                    <span slot="label"><i class="el-icon-date"></i>投资策略选择</span>
                    <!-- 单选框 -->
                    <el-radio-group v-model="checkedStrategy">
                        <!-- 
                            Object.keys(val_dict) 返回字典val_dict的所有key 
                            splice(29, 3): 从数组的下标29开始取三个元素出来
                        -->
                        <el-radio 
                            v-for="k in Object.keys(val_dict).splice(29, 3)" :key="val_dict[k][1]"
                            :label="val_dict[k][1]"
                            @change="checkListChange(k)"
                        >
                            <p>{{val_dict[k][0]}}</p>
                        </el-radio>
                    </el-radio-group>
                </el-tab-pane>

                <el-tab-pane name="strategySelectIndex">
                    <span slot="label"><i class="el-icon-data-line"></i>策略指标选项</span>
                    <el-checkbox-group v-model="checkedMA" :min="1" :max="2">
                        <el-checkbox 
                            v-for="k in Object.keys(val_dict).splice(32, 6)" :key="val_dict[k][1]"
                            :label="val_dict[k][1]"
                            @change="checkListChange(k)"
                        >
                            <p>{{val_dict[k][0]}}</p>
                        </el-checkbox>
                    </el-checkbox-group>
                </el-tab-pane>

            </el-tabs>
        </el-card>
    </div>
</template>

<script>
import { query_dict, val_dict, con_dict } from "@/common/static";
import router from "@/router";
import { getCollections, saveCollection, delCollection, get_range } from "@/network/stocks";
import { getStrategy } from "@/network/stocks";
export default {
    name: "QuerySelector",

    data() {
        return {
            radio: 3,
            loading: true,
            checkedMA: [],
            checkedStrategy: [],
            activeName: 'strategyIndex',
            colName: "",
            checkList: [],
            val_dict,
            con_dict,
            limits: {},
            query: {
                val: '',
                con: '',
                // 专门为累计类型提供的变量
                years: 1,
                // 专门为历史水平类型提供的变量
                mouths: 1,
                min_num: 0,
                max_num: 2000,
                value: [0, 2000],
            },
            queries: [],
            myCollections: {},
        }
    },

    computed: {
        user() {
            return this.$store.state.user
        },
        available_cons() {
            // 在所有字段上提供历史水平查询
            let cons = { 'current': '当前', 'level': '历史水平', 'MA': '均线' }
            // 限制：仅在用户选择股息率时提供该累计选项，但实际上后端可以处理所有daily basic上的累计查询类型
            if (this.query.val === 'dv_ratio') {
                cons['continues'] = '累计'
            }
            return cons
        }
    },
    watch: {},

    methods: {
        tabClick(tab, event) {
            // 点击我的收藏，获取后端用户收藏数据
            if (tab.name === 'MyCollections') {
                getCollections().then(res => {
                    let collections = res.data['queries']
                    collections = collections.map(item => Object.assign({}, item, { value: [item.min_num, item.max_num] }))
                    for (let q of collections) {
                        this.$set(this.myCollections, q.name, collections.filter(item => {
                            return item['name'] === q.name
                        }))
                    }
                })
            }
        },
        addCollections() {
            if (this.user) {
                this.$prompt('请输入指标名称', '新建指标', {
                    inputPlaceholder: '指标名称',
                    confirmButtonText: '确定',
                    inputValidator: (value) => {
                        if (value.trim().length < 1) {
                            return '输入不能为空'
                        }
                    },
                    cancelButtonText: '取消',
                    // inputErrorMessage: '邮箱格式不正确'
                }).then(({ value }) => {
                    value = value.trim()
                    if (this.myCollections.hasOwnProperty(value)) {
                        this.$confirm('该指标名称已使用, 是否更新该指标?', '提示', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            // type: 'warning'
                        }).then(() => {
                            let qs_clone = this.queries.map(item => item)
                            this.$set(this.myCollections, value, qs_clone)
                            //ToDo [value,qs_clone]写入后端数据库
                            for (let q of qs_clone) {
                                delete q['value']
                                q['name'] = value
                            }
                            saveCollection({ "queries": qs_clone }).then(res => {
                                // console.log(res)
                            })

                            this.$message({
                                type: 'success', message: '成功更新指标: ' + value,
                            });
                        }).catch(() => {
                            this.$message({
                                type: 'info', message: '已取消更新'
                            });
                        });
                    } else {
                        let qs_clone = this.queries.map(item => item)
                        this.$set(this.myCollections, value, qs_clone)
                        // console.log(this.myCollections)
                        // console.log(qs_clone);
                        //ToDo [value,qs_clone]写入后端数据库
                        for (let q of qs_clone) {
                            delete q['value']
                            q['name'] = value
                        }
                        // console.log(qs_clone)
                        saveCollection({ "queries": qs_clone }).then(res => {
                            console.log(res)
                        })
                        this.$message({ type: 'success', message: '已收藏指标: ' + value, duration: 2000 });
                    }
                }).catch(() => {
                    this.$message({ type: 'info', message: '取消收藏' });
                });
            } else {
                this.$confirm('是否跳转到登录页面?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }).then(() => {
                    router.push('/authenticate')
                }).catch(() => {
                    this.$message({ type: 'info', message: '取消登录', duration: 1000 });
                });
            }
        },
        clickCollection(name) {
            this.colName = "（当前指标为 <" + name + ">）"
            this.queries = JSON.parse(JSON.stringify(this.myCollections[name]))
            let arr_value = this.queries.map(item => [item.val, item.con])
            let arr_key = Object.keys(this.val_dict)
            let checkTemp = []

            for (let i = 0; i < arr_value.length; i++) {
                let index = Object.values(this.val_dict).map(item => JSON.stringify([item[1], item[2]])).indexOf(JSON.stringify(arr_value[i]))
                checkTemp.push(arr_key[index])
            }
            this.checkList = checkTemp

        },
        warnDropCollection(name) {
            // console.log(name)
            // this.dropDialogVisible = true

            this.$confirm('将永久删除指标"' + name + '", 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                // console.log(name)
                this.$delete(this.myCollections, name)
                this.colName = ''
                //ToDo 后端数据库删除该条收藏
                delCollection({ "name": name })
                this.$message({
                    type: 'success',
                    message: '成功删除指标"' + name + '"!'
                });
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '取消删除指标"' + name + '"'
                });
            });


        },
        // dropColl(name) {
        //   // console.log(name)
        //   this.$delete(this.myCollections, name)
        //   this.dropDialogVisible = false
        //   //ToDo 后端数据库删除该条收藏
        //   delCollection({"name":name})
        //
        // },
        // canDropColl(name) {
        //   console.log(name)
        //   this.dropDialogVisible = false
        // },
        dropItem(i) {
            this.colName = ''
            this.queries.splice(i, 1)
            this.checkList.splice(i, 1)
        },
        checkListChange(k) {
            this.colName = ''
            // get_range({val: val_dict[k][1]}).then(res => {
            //     if (this.checkList.includes(k)) {
            //         let ran = Object.values(res.data)
            //         let ran0 = ran[0].toFixed(3)
            //         let ran1 = (ran[1] + 0.01).toFixed(3)
            //         ran = [Number(ran0.substring(0, ran0.length - 1)), Number(ran1.substring(0, ran1.length - 1))]
            //         this.query.val = val_dict[k][1]
            //         this.query.con = val_dict[k][2]
            //         this.query.years = 1
            //         this.query.mouths = 1
            //         if (val_dict[k][2] === 'level') {
            //             this.query.min_num = 0
            //             this.query.max_num = 1
            //             this.query.value = [0, 1]
            //         }else if (val_dict[k][2] === 'MA') {
            //             this.query.min_num = 1
            //             this.query.max_num = 100
            //             this.query.value = 1
            //         }else {
            //             this.query.min_num = ran[0]
            //             this.query.max_num = ran[1]
            //             this.query.value = ran
            //         }
            //         this.queries = this.queries.filter(item => {
            //             return (item.val == val_dict[k][1] && item.con != val_dict[k][2]) || (item.val != val_dict[k][1])
            //         })
            //         // console.log(this.queries)
            //         this.queries.push(
            //             JSON.parse(JSON.stringify(this.query))
            //         )
            //         // console.log(this.queries)

            //     } else {
            //         // let index = this.queries.map(item => JSON.stringify([item.val, item.con])).indexOf(JSON.stringify([val_dict[k][1], val_dict[k][2]]))
            //         // this.queries.splice(index, 1)
            //         this.queries = this.queries.filter(item => {
            //             return (item.val == val_dict[k][1] && item.con != val_dict[k][2]) || (item.val != val_dict[k][1])
            //         })
            //     }

            // })


        },
        numberChange(i) {
            this.queries[i]['value'] = [this.queries[i]['min_num'], this.queries[i]['max_num']]
        },
        sliderChange(i) {
            this.queries[i]['min_num'] = this.queries[i]['value'][0]
            this.queries[i]['max_num'] = this.queries[i]['value'][1]
        },
        filter() {
            // 注意指针的问题
            // this.$emit('filter', this.queries)checkedStrategy
            let param = this.checkedMA.sort().reverse()
            let strategy = this.checkedStrategy
            console.log('checkedMA:', param[0])
            console.log('checkedStrategy:', strategy)
            getStrategy({
                "param1": param[0],
                "param2": param[1],
                "strategyName": strategy
            }).then(res => {
                this.stocks = res.data
                // this.$refs.stock_list.loading = false
                console.log("ressss:", this.stocks)

            }).catch(err => {
                console.log("esss", err)
            })

            // 清空query，同时确保指针更新
            // this.query = {
            //   val: '',
            //   con: '',
            //   years: 1,
            //   mouths: 1,
            //   min_num: 0,
            //   max_num: 2000,
            //   value: [0, 2000],
            // }
        },
        reset() {
            this.colName = ''
            this.queries = []
            this.checkList = []
            this.$emit('reset')
        },

        //todo 在用户连续两次以上违反该条件时输入框不能正确的反映当前的min和max值
        inputCheck() {
            if (this.query.min_num > this.query.max_num) {
                this.query.min_num = this.query.max_num
            }
        }
    }
}

</script>

<style scoped>
.el-checkbox-group {
    margin-left: 25px;
    margin-top: 5px;
}

.el-checkbox {
    width: 190px;
    display: inline-block;
    line-height: 30px;

}

.el-slider {
    float: left;
    width: 40%;
    margin: 0 10px;
    padding: 0 10px;
}

.demonstration {
    float: left;
    line-height: 40px;
}

.demonstration2 {
    float: left;
    line-height: 40px;
}

.slider .el-input-number {
    width: 15%;
    float: left;
    line-height: 40px;
}

.years .el-input-number {
    margin-top: 5px;
    width: 50%;
    /*line-height: 40px;*/
}

.button {
    margin-top: 20px;
    float: right;
    margin-left: 10px;
}

.el-button.buttons {
    background-color: #545c64;
    border-color: #545c64;
}

.el-button.buttons:hover {
    color: #ffd04b;
}

.el-button.buttons:active {
    color: #ffd04b;
}

p {
    margin-bottom: 0;
    margin-top: 0;
    width: 100%;
    height: 35px;
    display: block;
    line-height: 35px;
    text-align: center;
    font-size: 13px;
}

.font {
    font-size: 13px;
    font-weight: bold;
    color: #545c64;
}

[class^="el-icon"] {
    margin-right: 10px;
}

.but_color {
    color: #545c64;
    border-color: #dadbdc;
    background-color: #fff;
}

.el-button.but_color:hover {
    border-color: #dadbdc;
    background-color: #F5F5F5;
}

.el-button.but_color:active {
    border-color: #dadbdc;
    background-color: #F5F5F5;
}

.button_text {
    color: #545c64;
    font-size: 13px;

}

.button_text:hover {
    font-weight: bold;
    color: #EEB422;
}

.button_text:active {
    font-weight: bold;
    color: #EEB422;

}

/*.active1 {color: red}*/

.tag {
    margin-left: 10px;
    height: 40px;
}
</style>
<style>
/*标签页样式*/
.el-tabs__item {
    padding: 0 20px;
    height: 40px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    line-height: 40px;
    display: inline-block;
    list-style: none;
    font-size: 13px;
    font-weight: 600;
    color: #545c64;
    position: relative;
}

.el-tabs--card>.el-tabs__header {
    /*border-bottom: 1px solid #545c64;*/
    background-color: #fff;
}

.el-tabs__item.is-active {
    color: #EEB422;
}

.el-tabs__item:hover {
    color: #EEB422;
    cursor: pointer;
}

/*滑块样式*/
.el-slider__bar {
    background-color: #545c64;
}

.el-slider__button {
    width: 13px;
    height: 13px;
    /*border-radius: 0;*/
    background: #FFFFFF;
    border: solid 2px #545c64;
}

/*checkbox样式*/
.el-checkbox {
    color: #545c64;
    /*border-color: #545c64;*/
}

.el-checkbox__input.is-checked+.el-checkbox__label {
    color: #545c64;
    border-color: #545c64;
}

.el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #545c64;
    border-color: #545c64;
}

.unselected .el-checkbox__input .el-checkbox__inner::after {
    border: 2px solid #545c64;
    box-sizing: content-box;
    content: "";
    border-left: 0;
    border-top: 0;
    height: 7px;
    left: 3px;
    position: absolute;
    top: 1px;
    width: 3px;
}

.el-checkbox__input .el-checkbox__inner::after {
    border: 2px solid #fff;
    box-sizing: content-box;
    content: "";
    border-left: 0;
    border-top: 0;
    height: 7px;
    left: 3px;
    position: absolute;
    top: 1px;
    width: 3px;
    transform: rotate(45deg) scaleY(1);
}
</style>
