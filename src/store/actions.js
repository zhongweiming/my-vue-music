// 用来处理异步操作或者一系列 mutations 操作的集合
import * as types from './mutation-types'
import { playMode } from '../common/js/config'
import { shuffle } from '../common/js/util'
import { clearSearch, deleteSearch, saveSearch } from '../common/js/cache'

function findIndex (list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}

export const selectPlay = function ({commit, state}, {list, index}) {
  commit(types.SET_SEQUENCE_LIST, list)
  // 如果为随机播放模式,回到列表点歌的时候,如果不处理,那么会变成顺序播放,因为一点歌 list 会变成原来的 songs 中的默认 list
  if (state.mode === playMode.random) {
    // 打乱列表
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    // 找到列表中点击的那首歌在新随机列表中的索引,这样才会播放点击的那首歌
    index = findIndex(randomList, list[index])
  } else {
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export const randomPlay = function ({commit}, {list}) {
  commit(types.SET_PLAY_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  // 生成随机播放列表
  let randomList = shuffle(list)
  commit(types.SET_PLAYLIST, randomList)
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export const insertSong = function ({commit, state}, song) {
  // 返回一个副本，这样的话对 playlist 的修改就不会影响到 state 里面的 playlist 了，直接赋值浅拷贝是会影响原先对象的
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  // 处理 playlist
  // 记录一下当前歌曲的位置
  let currentSong = playlist[currentIndex]
  // 查找当前列表中是否有要插入的歌曲
  let fpIndex = findIndex(playlist, song)
  // 插入歌曲到当前歌曲后面，所以索引要加一
  currentIndex++
  // 插入这首歌到当前歌曲的下一个位置
  playlist.splice(currentIndex, 0, song)
  // 如果要插入的歌曲已经在播放列表中，则删除那首歌
  if (fpIndex > -1) {
    // 如果要插入的歌曲位置在原先已有歌曲的后面
    if (currentIndex > fpIndex) {
      playlist.splice(fpIndex, 1)
      // 因为在前面删了一首歌，所以 currentIndex 要减一
      currentIndex--
    } else {
      playlist.splice(fpIndex + 1, 1)
    }
  }

  // 处理 sequenceList
  // 找到当前播放歌曲在 sequenceList 中的位置
  let currentSIndex = findIndex(sequenceList, currentSong)
  // 插入歌曲到当前歌曲后面，所以索引要加一
  currentSIndex++
  // 查找当前列表中是否有要插入的歌曲
  let fsIndex = findIndex(sequenceList, song)
  // 插入这首歌到当前歌曲的下一个位置
  sequenceList.splice(currentSIndex, 0, song)
  // 如果要插入的歌曲已经在播放列表中，则删除那首歌
  if (fsIndex > -1) {
    // 如果要插入的歌曲位置在原先已有歌曲的后面
    if (currentSIndex > fsIndex) {
      sequenceList.splice(fsIndex, 1)
      // sequenceList 并不需要修改索引啥的
    } else {
      sequenceList.splice(fsIndex + 1, 1)
    }
  }

  // 提交
  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export const saveSearchHistory = function ({commit}, keyword) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(keyword))
}

export const deleteSearchHistory = function ({commit}, keyword) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(keyword))
}

export const clearSearchHistory = function ({commit}) {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}
