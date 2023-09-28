<template>
    <el-form ref="form" label-width="80px">
        <el-form-item label="买入条件">
            <el-input v-model="buy" @blur="handleBlur"></el-input>
        </el-form-item>
        <el-form-item label="卖出条件">
            <el-input v-model="sell" @blur="handleBlur"></el-input>
        </el-form-item>
    </el-form>
</template>

<script>
    export default {
        name: 'ParamSetting',
        data() {
            return {
                buy: '',
                sell: '',
            }
        },
        methods: {
            handleBlur(e) {
                if (!e.target.value.trim()) return alert('输入不能为空！')
                // this.$bus.$emit('paramSetFinish', this.buy, this.sell)
                if (this.buy != '' && this.sell != '') {
                    console.log(this.buy, this.sell);
                }
            }
        }
    }
</script>