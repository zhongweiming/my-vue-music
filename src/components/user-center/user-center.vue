<template>
  <transition name="slide">
    <div class="user-center">
      <div class="back" @click.stop="back">
        <i class="icon-back"></i>
      </div>
      <div class="switches-wrapper">
        <switches :currentIndex="currentIndex" :switches="switches" @switch="switchItem"></switches>
      </div>
      <div ref="playBtn" class="play-btn" @click.stop="random">
        <i class="icon-play"></i>
        <span class="text">随机播放全部</span>
      </div>
      <div class="list-wrapper" ref="listWrapper">
        <scroll ref="favoriteList" class="list-scroll" v-if="currentIndex===0" :data="favoriteList">
          <div class="list-inner">
            <song-list :songs="favoriteList" @select="selectSong"></song-list>
          </div>
        </scroll>
        <scroll ref="playHistory" class="list-scroll" v-if="currentIndex===1" :data="playHistory">
          <div class="list-inner">
            <song-list :songs="playHistory" @select="selectSong"></song-list>
          </div>
        </scroll>
      </div>
      <div class="no-result-wrapper" v-show="noResult">
        <no-result :title="noResultDesc"></no-result>
      </div>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
import Switches from 'base/switches/switches'
import {mapGetters, mapActions} from 'vuex'
import Scroll from 'base/scroll/scroll'
import SongList from 'base/song-list/song-list'
import Song from '../../common/js/song'
import NoResult from 'base/no-result/no-result'
import { playlistMixin } from '../../common/js/mixin'
export default {
  name: 'user-center',
  mixins: [playlistMixin],
  data () {
    return {
      currentIndex: 0,
      switches: [
        {name: '我喜欢的'},
        {name: '最近听的'}
      ]
    }
  },
  computed: {
    noResultDesc () {
      if (this.currentIndex === 0) {
        return '暂无收藏歌曲哦,去将喜欢的歌曲加入进来吧'
      } else if (this.currentIndex === 1) {
        return '你还没有听过一首歌哦'
      }
    },
    noResult () {
      if (this.currentIndex === 0) {
        return !this.favoriteList.length
      } else if (this.currentIndex === 1) {
        return !this.playHistory.length
      }
    },
    ...mapGetters([
      'favoriteList',
      'playHistory'
    ])
  },
  methods: {
    handlePlaylist (playlist) {
      this.$refs.listWrapper.style.bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.favoriteList && this.$refs.favoriteList.refresh()
      this.$refs.playHistory && this.$refs.playHistory.refresh()
    },
    switchItem (index) {
      this.currentIndex = index
    },
    selectSong (song) {
      this.insertSong(new Song(song))
    },
    back () {
      this.$router.back()
    },
    random () {
      // 根据当前所在的页面设置播放 list
      let list = this.currentIndex === 0 ? this.favoriteList : this.playHistory
      // 如果列表为空,什么也不用做
      if (!list.length) {
        return
      }
      // 由于这些列表中的 song 都不是 song的实例,所以用 map 方法遍历返回所有 song 实例的形式
      list = list.map((song) => {
        return new Song(song)
      })
      this.randomPlay({
        list
      })
    },
    ...mapActions([
      'insertSong',
      'randomPlay'
    ])
  },
  components: {
    Switches,
    Scroll,
    SongList,
    NoResult
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  .user-center
    position: fixed
    top: 0
    bottom: 0
    z-index: 100
    width: 100%
    background: $color-background
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .switches-wrapper
      margin: 10px 0 30px 0
    .play-btn
      box-sizing: border-box
      width: 135px
      padding: 7px 0
      margin: 0 auto
      text-align: center
      border: 1px solid  $color-text-l
      color: $color-text-l
      border-radius: 100px
      font-size: 0
      .icon-play
        display: inline-block
        vertical-align: middle
        margin-right: 6px
        font-size: $font-size-medium-x
      .text
        display: inline-block
        vertical-align: middle
        font-size: $font-size-small
    .list-wrapper
      position: absolute
      top: 110px
      bottom: 0
      width: 100%
      .list-scroll
        height: 100%
        overflow: hidden
        .list-inner
          padding: 20px 30px
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
