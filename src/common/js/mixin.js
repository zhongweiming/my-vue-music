import {mapGetters, mapMutations, mapActions} from 'vuex'
import { playMode } from '../../common/js/config'
import { shuffle } from '../../common/js/util'

// 调用这个mixin的组件会覆盖这里面的方法
export const playlistMixin = {
  computed: {
    ...mapGetters([
      'playlist'
    ])
  },
  mounted () {
    this.handlePlaylist(this.playlist)
  },
  activated () {
    this.handlePlaylist(this.playlist)
  },
  watch: {
    playlist (newVal) {
      this.handlePlaylist(newVal)
    }
  },
  methods: {
    handlePlaylist (playlist) {
      // 要求引入了这个 mixin 的组件必须要实现这个方法
      // 因为各个组件不一样,各按所需来实现即可,不错!
      throw new Error('component must implement handlePlaylist method')
    }
  }
}

export const playerMixin = {
  computed: {
    iconMode () {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop'
        : 'icon-random'
    },
    ...mapGetters([
      'sequenceList',
      'mode',
      'playlist',
      'currentSong'
    ])
  },
  methods: {
    changeMode () {
      let mode = (this.mode + 1) % 3
      this.setPlayMode(mode)
      let list = null
      if (mode === playMode.random) {
        // 打乱播放列表,注意此时这个 sequenceList 也会跟着改变
        // 这个时候是有问题的,因为 sequenceList 改变的话,下一次切换回顺序播放,列表还是上一次的随机播放列表
        // 需要改一下函数,把 shuffle 改一下,改成不会改变原数组,yeah
        list = shuffle(this.sequenceList)
      } else {
        list = this.sequenceList
      }
      // 调用之后 index 变为新列表表示当前歌曲的那个 index
      this.resetCurrentIndex(list)
      this.setPlaylist(list)
    },
    resetCurrentIndex (list) {
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    ...mapMutations({
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setPlayMode: 'SET_PLAY_MODE',
      setPlaylist: 'SET_PLAYLIST'
    })
  }
}

export const searchMixin = {
  computed: {
    ...mapGetters([
      'searchHistory'
    ])
  },
  data () {
    return {
      keyword: '',
      refreshDelay: 100
    }
  },
  methods: {
    handleQuery (keyword) {
      this.keyword = keyword
    },
    blurInput () {
      this.$refs.searchBox.blur()
    },
    saveSearch () {
      this.saveSearchHistory(this.keyword)
    },
    clickSearchHistory (keyword) {
      // 当搜索历史中的关键字被点击时做两件事
      // 1.将关键字填入搜索框中
      // 2.将关键字保存在搜索历史中，主要是为了让这个关键字提前到第一个搜索历史，更加合理
      this.$refs.searchBox.setKeyword(keyword)
      this.saveSearchHistory(keyword)
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory'
    ])
  }
}
