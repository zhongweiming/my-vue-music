<template>
  <scroll class="listview"
          :data="data"
          ref="listview"
          :listenScroll="listenScroll"
          :probeType="probeType"
          @scroll="scroll">
    <ul>
      <li class="list-group" v-for="group in data" :key="group.title" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li class="list-group-item" v-for="item in group.items"
              :key="item.id"
              @click="selectItem(item)">
            <img v-lazy="item.avatar" alt="" class="avatar">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div class="list-shortcut" @touchstart="onShortcutTouchStart"
                               @touchmove="onShortcutTouchMove">
      <ul>
        <li v-for="(item, index) in shortcutList"
            class="item"
            :class="{'current': currentIndex===index}"
            :key="item"
            :data-index="index">
          {{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
      <h1 class="fixed-title">{{fixedTitle}}</h1>
    </div>
    <div v-show="!data.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
import Scroll from 'base/scroll/scroll'
import {getDate} from '../../common/js/dom'
import Loading from 'base/loading/loading'

const ANCHOR_HEIGHT = 18
const TITLE_HEIGHT = 30

export default {
  name: 'listview',
  created () {
    this.touch = {}
    this.listenScroll = true
    this.listHeight = []
    // 表示不节流?不设置的话左右联动会有问题
    this.probeType = 3
  },
  components: {
    Scroll,
    Loading
  },
  data () {
    return {
      scrollY: -1,
      currentIndex: 0,
      fixedTop: 0,
      diff: -1
    }
  },
  computed: {
    shortcutList () {
      return this.data.map((group) => {
        return group.title.substr(0, 1)
      })
    },
    fixedTitle () {
      // 设置边界条件,使得顶部向上滑动之时不再有两个 title
      if (this.scrollY > 0) {
        return ''
      }
      // 判断一下是否存在,因为一开始 data 是空的,如果 data 为空取 title 会报错
      return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
    }
    // fixedTitle: {
    //   get () {
    //     return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
    //   },
    //   set (newValue) {
    //   }
    // }
  },
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    onShortcutTouchStart (e) {
      let anchorIndex = parseInt(getDate(e.target, 'index'))
      let firstTouch = e.touches[0]
      this.touch.y1 = firstTouch.pageY
      this.touch.anchorIndex = anchorIndex
      this._scrollTo(anchorIndex)
    },
    onShortcutTouchMove (e) {
      let firstTouch = e.touches[0]
      this.touch.y2 = firstTouch.pageY
      let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT || 0
      let anchorIndex = this.touch.anchorIndex + parseInt(delta)
      this._scrollTo(anchorIndex)
    },
    scroll (pos) {
      this.scrollY = pos.y
    },
    selectItem (item) {
      this.$emit('select', item)
    },
    _scrollTo (index) {
      if (!index && index !== 0) {
        return
      }
      // 处理边界问题,限定 index
      if (index < 0) {
        index = 0
      } else if (index > this.listHeight.length - 2) {
        index = this.listHeight.length - 2
      }
      // 手动设置 scrollY 解决点击高亮问题
      this.scrollY = -this.listHeight[index]
      this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
    },
    _caculateHeight () { // 计算各个列表的高度
      this.listHeight = []
      const list = this.$refs.listGroup
      let height = 0
      this.listHeight.push(height)
      for (let i = 0; i < list.length; i++) {
        let item = list[i]
        height += item.clientHeight
        this.listHeight.push(height)
      }
    }
  },
  watch: {
    data () {
      // 数据拿到之后计算各个歌手列表元素的高度
      setTimeout(() => {
        this._caculateHeight()
      }, 20)
    },
    scrollY (newY) {
      const listHeight = this.listHeight

      // 当滚动到顶部上面时,newY>0
      // 隐藏固定的 title
      if (newY > 0) {
        this.currentIndex = 0
        // 不能直接这样,需要设置计算属性的 setter
        // this.fixedTitle = ''
        return
      }

      // 当滚动到中间部分时
      for (let i = 0; i < listHeight.length - 1; i++) {
        let lowerHeight = listHeight[i]
        let upperHeight = listHeight[i + 1]
        // 这个-newY和 lowerHeight或者 upperHeight相等的情况为什么不需要考虑呢,要的
        // !upperHeight是为了处理最后下拉到最后的时候进行处理,始终为最后的 Index
        // 并不需要,正常情况下都是滚不到那么下面的(但是当最下面的那个列表很短的时候是有可能的,必须考虑)
        if (-newY >= lowerHeight && -newY < upperHeight) {
          this.currentIndex = i
          this.diff = upperHeight + newY
          return
        }
      }

      // 当滚动到页面底部下面时索引为最下面那个即可
      this.currentIndex = listHeight.length - 2
    },
    diff (newVal) {
      let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
      if (this.fixedTop === fixedTop) {
        return
      }
      this.fixedTop = fixedTop
      this.$refs.fixed.style.transform = `translate3d(0, ${this.fixedTop}px, 0)`
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
