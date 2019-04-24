function getRandom (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
// 打乱数组
export function shuffle (arr) {
  // 直接调用 arr 方法更简单,原理应该差不多,都是浅拷贝
  let newArr = arr.slice()
  // let newArr = []
  // for (let i = 0; i < arr.length; i++) {
  //   newArr.push(arr[i])
  // }
  for (let i = 0; i < newArr.length; i++) {
    let j = getRandom(0, i)
    let tmp = newArr[i]
    newArr[i] = newArr[j]
    newArr[j] = tmp
  }
  return newArr
}
// 节流函数
export function debounce (func, delay) {
  let timer
  // 传给 func 的参数可以被下面这个 args 接收？
  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
