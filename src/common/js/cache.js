import storage from 'good-storage'

const SEARCH_KEY = '__search__'
const SEARCH_MAX_LENGTH = 15

const PLAY_HISTORY_KEY = '__playHistory__'
const PLAY_HISTORY_MAX_LENGTH = 200

const FAVORITE_KEY = '__favorite__'
const FAVORTTE_MAX_LENGTH = 9999
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
// 保存播放历史
export function savePlay (song) {
  let songs = storage.get(PLAY_HISTORY_KEY, [])
  insertArray(songs, song, (item) => {
    return item.id === song.id
  }, PLAY_HISTORY_MAX_LENGTH)
  storage.set(PLAY_HISTORY_KEY, songs)
  return songs
}

// 加载播放历史
export function loadPlayHistory () {
  return storage.get(PLAY_HISTORY_KEY, [])
}

// 添加某首歌到我喜欢
export function saveFavorite (song) {
  let songs = storage.get(FAVORITE_KEY, [])
  insertArray(songs, song, (item) => {
    return item.id === song.id
  }, FAVORTTE_MAX_LENGTH)
  storage.set(FAVORITE_KEY, songs)
  return songs
}
// 从我喜欢中删除某首歌
export function deleteFavorite (song) {
  let songs = storage.get(FAVORITE_KEY, [])
  deleteFromArray(songs, (item) => {
    return item.id === song.id
  })
  storage.set(FAVORITE_KEY, songs)
  return songs
}
// 获取我喜欢的歌曲列表
export function loadFavorite () {
  return storage.get(FAVORITE_KEY, [])
}
