<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn"
           @touchstart.prevent="progressTouchStart"
           @touchmove.prevent="progressTouchMove"
           @touchend.prevent="progressTouchEnd">
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import {prefixStyle} from '../../common/js/dom'

const progressBtnWidth = 16
const transform = prefixStyle('transform')

export default {
  name: 'progress-bar',
  props: {
    percent: {
      type: Number,
      default: 0
    }
  },
  watch: {
    percent (newPercent) {
      if (newPercent >= 0 && !this.touch.initiated) {
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        const offsetWidth = newPercent * barWidth
        this._offset(offsetWidth)
      }
    }
  },
  created () {
    this.touch = {}
  },
  methods: {
    progressTouchStart (e) {
      // 设置一个标志位,只有拖动的是按钮才有用
      this.touch.initiated = true
      // 记录拖动开始时按钮的位置坐标
      this.touch.startX = e.touches[0].pageX
      // 记录拖动开始的时候进度条的长度
      this.touch.left = this.$refs.progress.clientWidth
    },
    progressTouchMove (e) {
      // 只有拖动按钮事件触发了才有用
      if (!this.touch.initiated) {
        return
      }
      // 计算拖动的距离
      const deltaX = e.touches[0].pageX - this.touch.startX
      // 计算拖动后按钮应该处于的位置
      // 自然最小不能小于 0 最大不能大于进度条的长度了
      const offsetWidth = Math.min(Math.max(0, this.touch.left + deltaX), this.$refs.progressBar.clientWidth - progressBtnWidth)
      this._offset(offsetWidth)
    },
    progressTouchEnd () {
      this.touch.initiated = false
      this._triggerPercent()
    },
    progressClick (e) {
      const rect = this.$refs.progressBar.getBoundingClientRect()
      const offsetWidth = e.pageX - rect.left
      this._offset(offsetWidth)
      // 获取点击的位置,发现一个 bug 点击按钮的时候会跳到开头,用另一种方法
      // this._offset(e.offsetX)
      this._triggerPercent()
    },
    // 封装一个方法设置新的位置,减少重复代码
    _offset (offsetWidth) {
      this.$refs.progress.style.width = `${offsetWidth}px`
      this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
    },
    // 封装一个方法向外派发 percent 改变事件
    _triggerPercent () {
      const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
      const percent = this.$refs.progress.clientWidth / barWidth
      this.$emit('percentChange', percent)
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
