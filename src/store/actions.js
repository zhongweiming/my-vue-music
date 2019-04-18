// 用来处理异步操作或者一系列 mutations 操作的集合
import * as types from './mutation-types'
import { playMode } from '../common/js/config'
import { shuffle } from '../common/js/util'

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
