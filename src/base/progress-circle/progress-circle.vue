<template>
  <div class="progress-circle">
<!--    viewBox 相当于一个容器前面两个为坐标,后面两个为长宽.而 r 为半径,cx,cy 为圆心坐标.和 viewBox 成比例,所以-->
<!--    不管 svg 的 width 和 height 为什么都可以自适应
暂时理解stroke-dasharray 控制圈加粗高亮的长度,stroke-dashoffset控制高亮长和前面的搭配使用,为 0时候全部高亮,为和
 stroke-dasharray 一样时全部不高亮-->
    <svg :width="radius" :height="radius" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <circle class="progress-background" r="50" cx="50" cy="50" fill="transparent" />
      <circle class="progress-bar" r="50" cx="50" cy="50" fill="transparent"
        :stroke-dasharray="dashArray" :stroke-dashoffset="dashOffset"/>
    </svg>
    <slot></slot>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  name: 'progress-circle',
  props: {
    radius: {
      type: Number,
      default: 32
    },
    percent: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      dashArray: Math.PI * 100
    }
  },
  computed: {
    dashOffset () {
      return (1 - this.percent) * this.dashArray
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  .progress-circle
    position: relative
    circle
      stroke-width: 8px
      transform-origin: center
      &.progress-background
        transform: scale(0.9)
        stroke: $color-theme-d
      &.progress-bar
        transform: scale(0.9) rotate(-90deg)
        stroke: $color-theme
</style>
