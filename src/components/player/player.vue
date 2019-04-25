<template>
  <div class="player" v-show="playlist.length>0">
    <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave">
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle"
             @touchstart.prevent="middleTouchStart"
             @touchmove.prevent="middleTouchMove"
             @touchend="middleTouchEnd">
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img class="image" alt="" :src="currentSong.image">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine"
                   class="text"
                   v-for="(line, index) in currentLyric.lines"
                   :key="line.time"
                   :class="{'current': currentLineNumber === index}">{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':currentShow==='cd'}"></span>
            <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i class="icon-prev" @click="prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i @click="togglePlaying" :class="playIcon"></i>
            </div>
            <div class="icon i-right" @click="next"  :class="disableCls">
              <i class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i :class="getFavoriteIcon(currentSong)" @click="toggleFavorite(currentSong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img :src="currentSong.image" width="40" height="40" alt="" :class="cdCls">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <!--.stop 阻止事件冒泡-->
            <i :class="miniIcon" @click.stop="miniTogglePlaying" class="icon-mini"></i>
          </progress-circle>
        </div>
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <playlist ref="playlist"></playlist>
    <audio ref="audio" :src="currentSong.url" @canplay="ready"
           @error="error" @timeupdate="updateTime"
           @ended="end"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
import { mapGetters, mapMutations, mapActions } from 'vuex'
import animations from 'create-keyframe-animation'
import {prefixStyle} from '../../common/js/dom'
import ProgressBar from 'base/progress-bar/progress-bar'
import ProgressCircle from 'base/progress-circle/progress-circle'
import { playMode } from '../../common/js/config'
import Lyric from 'lyric-parser'
import Scroll from 'base/scroll/scroll'
import Playlist from 'components/playlist/playlist'
import {playerMixin} from '../../common/js/mixin'

const transform = prefixStyle('transform')
const transitionDuration = prefixStyle('transitionDuration')
export default {
  name: 'player',
  mixins: [playerMixin],
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll,
    Playlist
  },
  created () {
    // 可以在 created 中定义因为这个变量并不需要有 getter 和 setter?
    this.touch = {}
  },
  data () {
    return {
      songReady: false,
      currentTime: 0,
      radius: 32,
      currentLyric: null,
      currentLineNumber: 0,
      currentShow: 'cd',
      playingLyric: ''
    }
  },
  computed: {
    cdCls () {
      return this.playing ? 'play' : 'play pause'
    },
    playIcon () {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    miniIcon () {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    percent () {
      return this.currentTime / this.currentSong.duration
    },
    ...mapGetters([
      'fullScreen',
      'playing',
      'currentIndex'
    ]),
    disableCls () {
      return this.songReady ? '' : 'disable'
    }
  },
  methods: {
    back () {
      // state 中的值只能通过 mutations 进行修改,是无法通过如 this.fullScreen=''这种来修改的
      this.setFullScreen(false)
    },
    open () {
      this.setFullScreen(true)
    },
    enter (el, done) {
      const {x, y, scale} = this._getPosAndScale()
      let animation = {
        0: {
          // 动画开始的位置
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0, 0, 0) scale(1.1)`
        },
        100: {
          // 动画进入最终完成的位置
          transform: `translate3d(0, 0, 0) scale(1)`
        }
      }
      animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 400,
          easing: 'linear'
        }
      })
      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    afterEnter () {
      animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    leave (el, done) {
      this.$refs.cdWrapper.style.transition = 'all 0.4s'
      const {x, y, scale} = this._getPosAndScale()
      // 离开动画结束时的位置
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
      this.$refs.cdWrapper.addEventListener('transitionend', done)
    },
    afterLeave () {
      this.$refs.cdWrapper.style.transition = ''
      this.$refs.cdWrapper.style.transform = ''
    },
    togglePlaying () {
      if (!this.songReady) {
        return
      }
      this.setPlayingState(!this.playing)
      if (this.currentLyric) {
        this.currentLyric.togglePlay()
      }
    },
    miniTogglePlaying () {
      this.setPlayingState(!this.playing)
    },
    showPlaylist () {
      this.$refs.playlist.show()
    },
    _getPosAndScale () {
      // 这里为了有一个从小图变大图的动画效果,其实就是让大图一开始的位置处于小图位置(点击歌曲或者点击mini 都会有这个效果),
      // 然后慢慢回到原来的位置,这里的 x 和 y 都是相对于原来的位置偏移的距离,所以一个为正一个为负!
      // 小图的宽度
      const smallWidth = 40
      // 小图中心距离左端距离
      const distanceToLeft = 40
      // 小图中心距离底部的距离
      const distanceToBottom = 30
      // 大图顶部距离顶部的距离
      const distanceToTop = 80
      // 大图的宽度
      const bigWidth = window.innerWidth * 0.8
      // 小图和大图的比
      const scale = smallWidth / bigWidth
      // 小图和大图中心横向距离差
      const x = -(window.innerWidth / 2 - distanceToLeft)
      // 小图和大图中心纵向距离差
      // 为什么一个正一个负
      const y = window.innerHeight - distanceToTop - bigWidth / 2 - distanceToBottom
      return {
        x,
        y,
        scale
      }
    },
    ...mapActions([
      'savePlayHistory'
    ]),
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN'
    }),
    prev () {
      if (!this.songReady) {
        return
      }
      if (this.playlist.length === 1) {
        this.loop()
      } else {
        let index = this.currentIndex - 1
        if (index === -1) {
          index = this.playlist.length - 1
        }
        // 由于直接点击切换歌曲时候会立刻播放,当当前歌曲暂停时表面的暂停按钮状态会持续到另一首歌,这里要设置一下
        if (!this.playing) {
          this.togglePlaying()
        }
        this.setCurrentIndex(index)
      }
      this.songReady = false
    },
    next () {
      // 只有当当前歌曲加载后才能点击下一首歌
      if (!this.songReady) {
        return
      }
      if (this.playlist.length === 1) {
        this.loop()
      } else {
        let index = this.currentIndex + 1
        if (index === this.playlist.length) {
          index = 0
        }
        // 由于直接点击切换歌曲时候会立刻播放,当当前歌曲暂停时表面的暂停按钮状态会持续到另一首歌,这里要设置一下
        if (!this.playing) {
          this.togglePlaying()
        }
        this.setCurrentIndex(index)
      }
      this.songReady = false
    },
    ready () {
      // 歌曲加载好之后设置为 true
      this.songReady = true
      this.savePlayHistory(this.currentSong)
    },
    error () {
      this.songReady = true
    },
    updateTime (e) {
      this.currentTime = e.target.currentTime
    },
    onProgressBarChange (percent) {
      const currentTime = percent * this.currentSong.duration
      this.$refs.audio.currentTime = currentTime
      if (!this.playing) {
        this.togglePlaying()
      }
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000)
      }
    },
    end () {
      if (this.mode === playMode.loop) {
        this.loop()
      } else {
        this.next()
      }
    },
    getLyric () {
      this.currentSong.getLyric().then((lyric) => {
        this.currentLyric = new Lyric(lyric, this.handleLyric)
        if (this.playing) {
          this.currentLyric.play()
        }
      }).catch((e) => {
        // 做一些清理操作
        this.currentLyric = null
        this.playingLyric = ''
        this.currentLineNumber = 0
        console.log(e)
      })
    },
    handleLyric ({lineNum, txt}) {
      this.currentLineNumber = lineNum
      // 让高亮始终保持在第六行位置,和顶端保持 5 行距离
      if (lineNum > 5) {
        let el = this.$refs.lyricLine[lineNum - 5]
        this.$refs.lyricList.scrollToElement(el, 1000)
      }
      this.playingLyric = txt
    },
    middleTouchStart (e) {
      this.touch.initiated = true
      const touch = e.touches[0]
      this.touch.startX = touch.pageX
      this.touch.startY = touch.pageY
    },
    middleTouchMove (e) {
      if (!this.touch.initiated) {
        return
      }
      const touch = e.touches[0]
      const deltaX = touch.pageX - this.touch.startX
      const deltaY = touch.pageY - this.touch.startY
      // 歌词上下滚动不用管,只管左右滚动
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        return
      }
      // 判断该向左边滑还是右边滑
      const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
      const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      this.$refs.lyricList.$el.style[transitionDuration] = 0
      this.$refs.middleL.style.opacity = 1 - this.touch.percent
      this.$refs.middleL.style[transitionDuration] = 0
    },
    middleTouchEnd () {
      let offsetWidth
      let opacity
      if (this.currentShow === 'cd') { // 从右向左滑
        if (this.touch.percent > 0.1) {
          offsetWidth = -window.innerWidth
          this.currentShow = 'lyric'
          opacity = 0
        } else {
          offsetWidth = 0
          opacity = 1
        }
      } else { // 从左向右滑
        if (this.touch.percent < 0.9) {
          offsetWidth = 0
          this.currentShow = 'cd'
          opacity = 1
        } else {
          offsetWidth = -window.innerWidth
          opacity = 0
        }
      }
      const time = 200
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
      this.$refs.middleL.style.opacity = opacity
      this.$refs.middleL.style[transitionDuration] = `${time}ms`
    },
    // 循环播放的实现
    loop () {
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
      if (this.currentLyric) {
        this.currentLyric.seek(0)
      }
    },
    // 将时间间隔转换成需要的格式
    format (interval) {
      // 向下取整
      interval = interval | 0
      let minute = interval / 60 | 0
      let second = this._padLeft(interval % 60 | 0)
      return `${minute}:${second}`
    },
    // 前面补 0 ,默认两位
    _padLeft (num, n = 2) {
      let length = num.toString().length
      while (length < n) {
        num = '0' + num
        length++
      }
      return num
    }
  },
  watch: {
    currentSong (newSong, oldSong) {
      // 如果这个 currentSong 为空，也不用往下执行了，当播放列表清空的时候就会出现这种情况
      if (!newSong.id || !oldSong.id) {
        return
      }
      // 做一个判断,如果说新歌和旧歌的 id 一样说明歌曲其实并没有改变,不需要执行里面的代码
      // 这个问题产生的原因就是切换播放模式为随机播放时需要改变 playlist 和 currentIndex 从而使得 currentSong 受影响,其实
      // 当前歌曲本身并没有改变
      if (newSong.id === oldSong.id) {
        return
      }
      // 当之前的歌词对象存在时得先停下,不然会出现歌词乱跳的问题
      if (this.currentLyric) {
        this.currentLyric.stop()
      }
      // nextTick 设置延时,先获取歌曲才能播放,
      // 用 setTimeout增加延时
      // this.$nextTick(() => {
      //   this.$refs.audio.play()
      //   this.getLyric()
      // })
      setTimeout(() => {
        this.$refs.audio.play()
        this.getLyric()
      }, 1000)
      // 和下面那个 playing 两个都设置这样的话是不会播放歌曲的,因为状态在歌曲加载好之前改变的,加载好后这里面的代码不执行了
      // if (!this.songReady) {
      //   return
      // }
      // this.$refs.audio.play()
    },
    playing (newState) {
      const audio = this.$refs.audio
      // nextTick 设置延时,先获取歌曲才能播放
      // 否则会报错Uncaught (in promise) DOMException
      this.$nextTick(() => {
        newState ? audio.play() : audio.pause()
      })
      // 为什么下面这个也可以哩,明白了,开始 currentSong 和 playing 状态都改变了,但歌曲还没加载好,这时 songReady 为 false
      // 所以一开始点一首歌进入的时候下面newState..代码是不会执行的,但是 currentSong 用的是延时,所以可以播放
      // if (!this.songReady) {
      //   return
      // }
      // newState ? audio.play() : audio.pause()
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"
  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background

      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)

      .top
        position: relative
        margin-bottom: 25px

        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50

          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)

        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text

        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text

      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0

        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%

          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            box-sizing: border-box
            height: 100%

            .cd
              width: 100%
              height: 100%
              border-radius: 50%

              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                box-sizing: border-box
                border-radius: 50%
                border: 10px solid rgba(255, 255, 255, 0.1)

              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center

            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l

        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden

          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center

            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium

              &.current
                color: $color-text

            .pure-music
              padding-top: 50%
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium

      .bottom
        position: absolute
        bottom: 50px
        width: 100%

        .dot-wrapper
          text-align: center
          font-size: 0

          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l

            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll

        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0

          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px

            &.time-l
              text-align: left

            &.time-r
              text-align: right

          .progress-bar-wrapper
            flex: 1

        .operators
          display: flex
          align-items: center

          .icon
            flex: 1
            color: $color-theme
            touch-action: none

            &.disable
              color: $color-theme-d

            i
              font-size: 30px

          .i-left
            text-align: right

          .i-center
            padding: 0 20px
            text-align: center

            i
              font-size: 40px

          .i-right
            text-align: left

          .icon-favorite
            color: $color-sub-theme

      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s

        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)

      &.normal-enter, &.normal-leave-to
        opacity: 0

        .top
          transform: translate3d(0, -100px, 0)

        .bottom
          transform: translate3d(0, 100px, 0)

    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background

      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s

      &.mini-enter, &.mini-leave-to
        opacity: 0

      .icon
        flex: 0 0 40px
        width: 40px
        height: 40px
        padding: 0 10px 0 20px

        img
          border-radius: 50%

          &.play
            animation: rotate 10s linear infinite

          &.pause
            animation-play-state: paused

      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden

        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text

        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d

      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px

        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d

        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
