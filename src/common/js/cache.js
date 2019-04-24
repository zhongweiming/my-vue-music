import storage from 'good-storage'

const SEARCH_KEY = '__search__'
const SEARCH_MAX_LENGTH = 15

// 往数组中插入数据
function insertArray (arr, val, compare, maxLen) {
  let index = arr.findIndex(compare)
  if (index === 0) {
    return
  }
  if (index > 0) {
    arr.splice(index, 1)
  }
  arr.unshift(val)
  if (maxLen && arr.length > maxLen) {
    arr.pop()
  }
}
// 从数组中删除某个数据
function deleteFromArray (arr, compare) {
  let index = arr.findIndex(compare)
  // 找到了就删除对应元素
  if (index > -1) {
    arr.splice(index, 1)
  }
}

// 保存搜索历史的方法
export function saveSearch (keyword) {
  // 获取本地缓存中键为 SEARCH_KEY的值，没有则为空数组
  let searches = storage.get(SEARCH_KEY, [])
  insertArray(searches, keyword, (item) => {
    return item === keyword
  }, SEARCH_MAX_LENGTH)
  // 将插入后的新数据保存到 localStorage 中
  storage.set(SEARCH_KEY, searches)
  // 把最新数据返回
  return searches
}

// 加载缓存中的搜索历史
export function loadSearch () {
  return storage.get(SEARCH_KEY, [])
}

// 删除某个历史
export function deleteSearch (keyword) {
  let searches = storage.get(SEARCH_KEY, [])
  deleteFromArray(searches, (item) => {
    return item === keyword
  })
  storage.set(SEARCH_KEY, searches)
  return searches
}

// 清空搜索历史
export function clearSearch () {
  storage.remove(SEARCH_KEY)
  return []
}
