export const singer = state => state.singer

export const playing = state => state.playing

export const fullScreen = state => state.fullScreen

export const playlist = state => state.playlist

export const sequenceList = state => state.sequenceList

export const mode = state => state.mode

export const currentIndex = state => state.currentIndex

export const currentSong = (state) => {
  // 难怪出现问题,currentIndex是上面的那个常量,是一个函数呀,不执行肯定没用呀,要用 state.currentIndex 获取最新 index
  return state.playlist[state.currentIndex] || {}
}
export const disc = state => state.disc

export const topList = state => state.topList

export const searchHistory = state => state.searchHistory
