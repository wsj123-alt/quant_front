import { request } from "./request";

export function getStrategyInfo(data) {
    return request({
        url: 'getStrategyInfo',
        method: 'POST',
        data: data,
    })
}
// 获取指定股票的信息
export function getDailyQuotation(params) {
    return request({
        url: '/get_daily_quotation',
        method: 'GET',
        params: params,
    })
}

// 获取所有股票
export function getAllStock() {
    return request({
        url: 'allStock',
        method: 'GET',
    })
}

// 观望中的撤销订单
export function deleteWaitAndSeeOrder(data) {
    return request({
        url: 'revokeOrder',
        method: 'POST',
        data
    })
}

// 获取不同状态订单信息：0-观望中，1-已买入
export function getPositionHasBuy(data) {
    return request({
        url: 'getPositionHasBuy',
        method: 'POST',
        data
    })
}

export function addOrder(data) {
    return request({
        url: 'addOrder',
        method: 'POST',
        data: data,
    })
}

export function getOrder() {
    return request({
        url: 'bigdata-stoploss/order/api/getOrder',
        method: 'POST',
    })
}

export function getStocks(data) {
    return request({
        url: '/get_stocks',
        method: 'POST',
        data: data,
    })
}

export function getCollections(data) {
    return request({
        url: '/get_user_queries',
        method: 'POST',
        data: data,
    })
}

export function get_range(data) {
    return request({
        url: '/get_range',
        params: data,
    })
}
export function saveCollection(data) {
    return request({
        url: "/save_user_queries",
        method: 'POST',
        data: data,
    })
}

export function delCollection(params) {
    return request({
        url: '/del_user_queries',
        method: 'GET',
        params: params,
    })
}

// 获取我的账户信息
export function getBalanceInfo() {
    return request({
        url: 'balanceInfo',
        method: 'GET',
    })
}