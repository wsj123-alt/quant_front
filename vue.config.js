// 调整vue脚手架的默认配置
module.exports = {
    publicPath: process.env.NODE_ENV === 'production' ? '/quant/' : '/',
    devServer: {
        proxy: 'http://192.168.1.57:8000' // 配置访问的服务器地址
    }

    // devServer: {
    //     proxy: {
    //       // 表示: 若请求前缀是/all_stock, 则表示走代理, 转发到target
    //       '/all_stock': {
    //         target: 'http://192.168.1.57:8000', // 目标服务器的地址
    //         // pathRewrite: {
    //         //   '^/all_stock': '/all_stock' // 匹配所有以/all_stock开头的字符串, 改写成'/all_stock'
    //         // },
    //       },
    //       // 账户
    //       '/balance_info': {
    //         target: 'http://192.168.1.57:8000',
    //         // pathRewrite: {
    //         //   '^/balance_info': '/balance_info/'
    //         // },
    //       },
    //       // 均线策略选股
    //       '/getStrategyInfo': {
    //         target: 'http://192.168.1.57:8000',
    //         // pathRewrite: {
    //         //   '^/getStrategyInfo': '/getStrategyInfo'
    //         // },
    //       },
    //       // addOrder
    //       '/addOrder': {
    //         target: 'http://192.168.1.57:8000',
    //         // pathRewrite: {
    //         //   '^/addOrder': '/addOrder'
    //         // },
    //       },
    //       // getPositionHasBuy
    //       '/getPositionHasBuy': {
    //         target: 'http://192.168.1.57:8000',
    //         // pathRewrite: {
    //         //   '^/getPositionHasBuy': '/getPositionHasBuy'
    //         // },
    //       },
    //     }
    //   }
}