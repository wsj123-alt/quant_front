export function formatDate(item) {
    for (let key in item) {
        if (key.indexOf('date') !== -1) {
            if (item[key] !== null) {
                item[key] = new Date(item[key]).toLocaleDateString()
            }
        }
    }
    return item
}

export function debounce(func, delay = 100) {
    let timer = null
    return function (...args) {
        if (timer)
            clearTimeout(timer)
        timer = setTimeout(() => {
            func.apply(this, args)
        }, delay)
    }
}

export function getTimeStrOut(ms){
    var date = new Date(ms);
    let Year = date.getFullYear();
    let Moth = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    let Day = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
    let  GMT =  Year + '-' + Moth + '-' + Day
    return GMT
}

export function getConditionOut(row, buyOrSell) {
    if (buyOrSell == 'buy') { // 获取买入条件 
      return getShowCondition(row.stra_param_buy) // "price:18.18"
    } else { // 获取卖出条件
      return getShowCondition(row.stra_param_sell)
    }
}

function getShowCondition(straParam) {
    if (straParam.indexOf("percent") == -1 && straParam.indexOf("ma1") == -1) { // 条件是 价格
      let price=eval(straParam.split(":")[1])
      return price
    } else if (straParam.indexOf("percent") != -1 ) { // 条件是 百分比
      // console.log('straParam', straParam) // "percent:2%,price:29.12"
      let strArr=straParam.split(",")
      let percent=""
      for (let i=0; i<strArr.length; i++) {
        if(strArr[i].indexOf("percent")!=-1){
          percent=strArr[i].split(":")[1]
          break
        }
      }
      return percent
    } else { // 条件是ma
      // console.log('straParam', straParam) // "ma1:5,ma2:10,mode:day"
      let mode=straParam.split("mode:")[1]
      let ma1=straParam.split("ma1:")[1].split(",")[0]
      let ma2=straParam.split("ma2:")[1].split(",")[0]

      let level = ''
      if (mode == 'min') {
        level = '分钟级'
      } else if (mode == 'hour') {
        level = '小时级'
      } else {
        level = '日级'
      }
      return `ma1:${ma1} ma2:${ma2} ${level}`
    }
}